"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const themeLoader = require("../src/theme-loader");
const createThemeContext = require("../src/theme-context");
const { collectRequiredAssetFiles } = require("../src/theme-schema");
const { LEGACY_THEME_IDS } = require("../src/builtin-pets");
const adapter = require("../src/codex-pet-adapter");
const ROOT = path.join(__dirname, "..");
themeLoader.init(path.join(ROOT, "src"));

test("store companions reuse the Codex adapter and are ordinary built-in themes", () => {
  const companions = themeLoader.listThemesWithMetadata();
  assert.ok(companions.some(({ id }) => id === "halo"));
  assert.deepEqual(companions.map(({ id }) => id).sort(), fs.readdirSync(path.join(ROOT, "pets")).sort());
  for (const { id, builtin, name } of companions) {
    assert.equal(builtin, true);
    assert.equal(typeof name.zh, "string");
    const theme = themeLoader.loadTheme(id, { strict: true });
    const context = createThemeContext(theme);
    assert.equal(theme.source.type, "builtin-pet");
    assert.equal(theme.source.spriteVersionNumber, 2);
    assert.equal(theme.rendering.svgChannel, "object");
    assert.equal(theme.eyeTracking.enabled, false);
    assert.equal(theme.miniMode.supported, false);
    assert.deepEqual(theme.states.thinking, ["codex-pet-review-loop.svg"]);
    assert.deepEqual(theme.states.working, ["codex-pet-running-loop.svg"]);
    assert.equal(context.getHitRendererConfig().reactions.clickLeft.duration, 840);
    assert.ok(context.getSoundUrl("complete"));
    assert.ok(context.getSoundUrl("confirm"));
    for (const file of collectRequiredAssetFiles(theme)) assert.ok(fs.existsSync(context.resolveAssetPath(file)), `${id}: ${file}`);
    const svg = fs.readFileSync(context.resolveAssetPath(theme.states.idle[0]), "utf8");
    assert.match(svg, /height="2288"/);
    assert.match(svg, /spritesheet.webp/);
    assert.equal(adapter.readManagedMarker(path.join(ROOT, "themes", id)), null);
  }
  for (const id of LEGACY_THEME_IDS.filter((id) => !companions.some((theme) => theme.id === id))) {
    assert.equal(fs.existsSync(path.join(ROOT, "themes", id)), false, `retired ${id}`);
  }
  assert.ok(fs.existsSync(path.join(ROOT, "themes", "template")));
});
