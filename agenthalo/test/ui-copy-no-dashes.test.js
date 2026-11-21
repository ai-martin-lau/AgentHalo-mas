"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const { Parser } = require("htmlparser2");

const SRC = path.join(__dirname, "..", "src");

// These are numeric ranges whose endpoints are computed at runtime.
const DYNAMIC_RANGES = new Set([
  '${TEXT_SCALE_MIN}–${TEXT_SCALE_MAX}',
  '${formatDate(data.startDate, { month: "short", day: "numeric" })} – ${formatDate(end, { month: "short", day: "numeric" })}',
]);

function hasDash(value, { placeholder = true } = {}) {
  if (placeholder && value === "—") return false;
  for (const range of DYNAMIC_RANGES) value = value.replaceAll(range, "range");
  return /[—–]/u.test(value.replace(/\d\s*–\s*(?=\d)/gu, ""));
}

function decodeEscapes(value) {
  return value.replace(/\\(u\{[\da-f]+\}|u[\da-f]{4}|x[\da-f]{2}|\r?\n|.)/gi, (_, escape) => {
    if (escape.startsWith("u{")) return String.fromCodePoint(parseInt(escape.slice(2, -1), 16));
    if (/^[ux]/.test(escape)) return String.fromCodePoint(parseInt(escape.slice(1), 16));
    return ({ n: "\n", r: "\r", t: "\t" })[escape] ?? escape;
  });
}

// A lexical walk, never eval/require application code. It visits quoted strings
// and every template (including nested interpolations), skipping comments,
// regex literals and logging calls. Scan all literals conservatively, rather
// than maintaining a list of UI files that could miss a new renderer.
function jsStrings(source, filename = "") {
  const strings = [];
  let i = 0;

  function code(end = "", ignored = false) {
    let previous = "";
    while (i < source.length) {
      const c = source[i];
      if (/\s/.test(c)) { i++; continue; }
      if (end && c === end) { i++; return; }
      if (source.startsWith("//", i)) {
        const newline = source.indexOf("\n", i);
        i = newline < 0 ? source.length : newline + 1;
        continue;
      }
      if (source.startsWith("/*", i)) {
        const close = source.indexOf("*/", i + 2);
        i = close < 0 ? source.length : close + 2;
        continue;
      }
      const log = /^(?:console\s*\.\s*\w+|ctx\s*\.\s*permLog|log)\s*\(/.exec(source.slice(i));
      if (log && (log[0].startsWith("console") || filename === "server-route-permission.js" || filename === "win-cloak-recovery.js")) {
        i += log[0].length;
        code(")", true);
        previous = "value";
        continue;
      }
      if (c === '"' || c === "'" || c === "`") {
        const start = i++;
        const quote = c;
        let raw = "";
        let interpolated = false;
        while (i < source.length && source[i] !== quote) {
          if (source[i] === "\\") {
            raw += source.slice(i, i + 2);
            i += 2;
          } else if (quote === "`" && source.startsWith("${", i)) {
            interpolated = true;
            const exprStart = i;
            i += 2;
            code("}", ignored);
            raw += source.slice(exprStart, i);
          } else {
            raw += source[i++];
          }
        }
        i++;
        const concatenated = previous === "+" || /^\s*\+/.test(source.slice(i));
        if (!ignored) strings.push({ value: decodeEscapes(raw), start, interpolated: interpolated || concatenated });
        previous = "value";
        continue;
      }
      if (c === "/" && (!previous || /^(?:[=(:,!\[{};?&|+*%<>~-]|return|case|throw|yield|typeof|void|delete|in|of|=>)$/.test(previous))) {
        let cursor = i + 1;
        let inClass = false;
        let closed = false;
        while (cursor < source.length) {
          const ch = source[cursor++];
          if (ch === "\n" || ch === "\r") break;
          if (ch === "\\") { cursor++; continue; }
          if (ch === "[") inClass = true;
          if (ch === "]") inClass = false;
          if (ch === "/" && !inClass) { closed = true; break; }
        }
        if (closed) {
          i = cursor;
          while (/[a-z]/i.test(source[i] || "")) i++;
          previous = "value";
          continue;
        }
      }
      if ("({[".includes(c)) {
        const controlCondition = c === "(" && /^(?:if|while|for|with|switch|catch)$/.test(previous);
        i++;
        code({ "(": ")", "{": "}", "[": "]" }[c], ignored);
        previous = c === "{" || controlCondition ? "" : "value";
        continue;
      }
      const word = /^[\w$]+/.exec(source.slice(i));
      previous = word ? word[0] : c;
      i += word ? word[0].length : 1;
    }
  }
  code();
  return strings;
}

function violations(source, filename) {
  const found = [];
  function inspect(value, start, interpolated = false) {
    // This API validation error cannot reach a user-facing surface.
    if (filename === "settings-controller.js"
      && value === "${key}: effect-bearing keys cannot be updated via applyBulk — use applyUpdate") return;
    // PowerShell comments embedded in a generated script are not UI text.
    if (filename === "focus.js") value = value.replace(/^\s*#.*$/gm, "");
    if (hasDash(value, { placeholder: !interpolated })) {
      found.push(`${filename}:${source.slice(0, start).split("\n").length}: ${value.slice(0, 240)}`);
    }
  }
  if (filename.endsWith(".html")) {
    let scriptStart = null;
    let styleStart = null;
    let text = "";
    let textStart = 0;
    function flushText() {
      if (text) inspect(text.trim(), textStart);
      text = "";
    }
    const parser = new Parser({
      onopentag(name, attrs) {
        flushText();
        if (name === "script") scriptStart = parser.endIndex + 1;
        if (name === "style") styleStart = parser.endIndex + 1;
        // Include accessible text, tooltips and input placeholders; checking
        // every attribute also guards copy added in a new UI attribute.
        for (const value of Object.values(attrs)) inspect(value, parser.startIndex);
      },
      ontext(value) {
        if (scriptStart === null && styleStart === null) {
          if (!text) textStart = parser.startIndex;
          text += value;
        }
      },
      onclosetag(name) {
        flushText();
        if (name === "script" && scriptStart !== null) {
          for (const item of jsStrings(source.slice(scriptStart, parser.startIndex), filename)) {
            inspect(item.value, scriptStart + item.start, item.interpolated);
          }
          scriptStart = null;
        }
        if (name === "style" && styleStart !== null) {
          for (const item of jsStrings(source.slice(styleStart, parser.startIndex), filename)) {
            inspect(item.value, styleStart + item.start, item.interpolated);
          }
          styleStart = null;
        }
      },
    }, { decodeEntities: true });
    parser.end(source);
    flushText();
  } else {
    for (const item of jsStrings(source, filename)) inspect(item.value, item.start, item.interpolated);
  }
  return found;
}

function sourceFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    // Generated and concurrently maintained; explicitly outside this task.
    return /\.(?:js|html|css)$/.test(entry.name) && entry.name !== "builtin-pets.js" ? [full] : [];
  });
}

test("UI copy has no punctuation dashes in src strings or HTML", () => {
  const found = sourceFiles(SRC).flatMap((file) => violations(
    fs.readFileSync(file, "utf8"), path.relative(SRC, file).split(path.sep).join("/"),
  ));
  assert.deepEqual(found, [], "Rewrite each UI dash naturally; keep only no-data placeholders and numeric ranges.");
});

test("copy scanner catches quotes, escapes, nested templates and HTML entities", () => {
  for (const source of [
    'const text = "通知——请检查";',
    "const text = 'Read only — no approvals';",
    'const text = "Read only \\u2014 no approvals";',
    'const text = `Ready — ${name}`;',
    'const text = `${ok ? `Ready – ${name}` : ""}`;',
    'const text = `Notice ${"—"} please`;',
    'const text = "Notice " + "—" + " please";',
    'const text = "Needs input – check the bubble";',
  ]) assert.ok(violations(source, "sample.js").length, source);
  assert.equal(violations('<p>Ready &mdash; continue</p><input title="Note &ndash; act">', "sample.html").length, 2);
  assert.equal(violations('<script>const text = "Ready — continue";</script>', "sample.html").length, 1);
  assert.equal(violations('p::before { content: "Ready — continue"; }', "sample.css").length, 1);
});

test("copy scanner preserves comments, logs, placeholders and numeric ranges", () => {
  const source = [
    '// "comment — unchanged"',
    '/* "comment —— unchanged" */',
    'console.warn("log — unchanged", `detail — ${value}`);',
    'const pattern = /["—]/g;',
    'if (ok) /["—]/.test(value);',
    'const ratio = { value: 1 } / 2;',
    'const empty = "—";',
    'const range = "10–100%; 17–20 digits";',
    'const dynamicRange = `${TEXT_SCALE_MIN}–${TEXT_SCALE_MAX}`;',
    'const after = "ordinary text";',
  ].join("\n");
  assert.deepEqual(violations(source, "sample.js"), []);
  assert.equal(violations(`${source}\nconst ui = "Ready — continue";`, "sample.js").length, 1);
  assert.deepEqual(violations('<!-- text — unchanged --><style>/* note — unchanged */</style><p>—</p>', "sample.html"), []);
  assert.equal(violations('console.log("unchanged — log"); const ui = "Ready — continue";', "sample.js").length, 1);
});
