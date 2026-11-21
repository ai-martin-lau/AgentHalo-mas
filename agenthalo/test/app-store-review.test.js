"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { openAppStoreReview, REVIEW_URL, REVIEW_WEB_URL } = require("../src/app-store-review");
const { i18n, createTranslator } = require("../src/i18n");

test("review uses the exact App Store URL without a browser fallback on success", async () => {
  const opened = [];
  assert.equal(REVIEW_URL, "macappstore://apps.apple.com/app/id6814860893?action=write-review");
  assert.equal(REVIEW_WEB_URL, "https://apps.apple.com/app/id6814860893?action=write-review");
  assert.deepEqual(await openAppStoreReview({ openExternal: async url => opened.push(url) }), { status: "ok" });
  assert.deepEqual(opened, [REVIEW_URL]);
});

test("review retries HTTPS after a protocol failure and handles both failures", async () => {
  for (const failBrowser of [false, true]) {
    const opened = [];
    const result = await openAppStoreReview({ openExternal: async url => {
      opened.push(url);
      if (url === REVIEW_URL || failBrowser) throw new Error("unavailable");
    } });
    assert.deepEqual(opened, [REVIEW_URL, REVIEW_WEB_URL]);
    assert.deepEqual(result, failBrowser ? { status: "error", message: "unavailable" } : { status: "ok" });
  }
});

test("rating text is translated consistently across every supported language", () => {
  const context = {};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../src/settings-i18n.js"), "utf8"), context);
  const strings = context.ClawdSettingsI18n.STRINGS;
  assert.deepEqual(Object.keys(strings).sort(), Object.keys(i18n).sort());
  for (const [lang, pool] of Object.entries(strings)) {
    assert.ok(Object.hasOwn(i18n[lang], "rateApp"), lang);
    assert.equal(pool.rateApp, createTranslator(() => lang)("rateApp"), lang);
    assert.match(pool.rateApp, /AgentHalo/);
    assert.ok(pool.rateApp.endsWith("…"), lang);
  }
  assert.equal(strings.zh.rateApp, "给 AgentHalo 评分…");
});

test("app source and Connect guide use the new repository owner", () => {
  const oldRepo = "github.com/" + ["addsumtech", "AgentHalo-mas"].join("/");
  const source = path.join(__dirname, "../src");
  for (const entry of fs.readdirSync(source, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !/\.(js|html|css)$/.test(entry.name)) continue;
    const file = path.join(entry.parentPath, entry.name);
    assert.ok(!fs.readFileSync(file, "utf8").includes(oldRepo), file);
  }
  const guide = fs.readFileSync(path.join(__dirname, "../../store/CONNECT.md"), "utf8");
  assert.ok(!guide.includes(oldRepo));
  assert.ok(guide.includes("https://github.com/ai-martin-lau/AgentHalo-mas"));
});
