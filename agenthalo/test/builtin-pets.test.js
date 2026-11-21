"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { generateBuiltinPets } = require("../scripts/generate-builtin-pets");
const { LEGACY_THEME_IDS, BUILTIN_PET_NAMES } = require("../src/builtin-pets");
const prefs = require("../src/prefs");
const { SUPPORTED_LANGS } = require("../src/i18n");
const ROOT = path.join(__dirname, "..");

function setup(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agenthalo-builtins-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const petsDir = path.join(root, "pets");
  fs.cpSync(path.join(ROOT, "pets", "halo"), path.join(petsDir, "halo"), { recursive: true });
  return { petsDir, themesDir: path.join(root, "themes") };
}
function addFox(petsDir) {
  const dir = path.join(petsDir, "fox");
  fs.cpSync(path.join(petsDir, "halo"), dir, { recursive: true });
  const json = JSON.parse(fs.readFileSync(path.join(dir, "pet.json")));
  json.id = "fox";
  fs.writeFileSync(path.join(dir, "pet.json"), JSON.stringify(json));
  fs.writeFileSync(path.join(dir, "sounds", "complete.mp3"), "fox-specific-sound");
}

test("generation discovers actual packages, copies per-pet sounds and produces deterministic output", (t) => {
  const options = setup(t);
  assert.deepEqual(generateBuiltinPets(options), ["halo"]);
  const jsonPath = path.join(options.themesDir, "halo", "theme.json");
  const first = fs.readFileSync(jsonPath, "utf8");
  generateBuiltinPets(options);
  assert.equal(fs.readFileSync(jsonPath, "utf8"), first);
  assert.ok(!first.includes(options.petsDir));
  addFox(options.petsDir);
  assert.deepEqual(generateBuiltinPets(options).sort(), ["fox", "halo"]);
  assert.equal(fs.readFileSync(path.join(options.themesDir, "fox", "sounds", "complete.mp3"), "utf8"), "fox-specific-sound");
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(options.themesDir, "fox", "theme.json"))).name, BUILTIN_PET_NAMES.fox);
  fs.rmSync(path.join(options.petsDir, "fox"), { recursive: true });
  generateBuiltinPets(options);
  assert.equal(fs.existsSync(path.join(options.themesDir, "fox")), false);
});

test("invalid or missing default packages fail the build before replacing valid themes", (t) => {
  const options = setup(t);
  generateBuiltinPets(options);
  addFox(options.petsDir);
  fs.rmSync(path.join(options.petsDir, "fox", "spritesheet.webp"));
  assert.throws(() => generateBuiltinPets(options), /spritesheet not found/);
  assert.ok(fs.existsSync(path.join(options.themesDir, "halo", "theme.json")));
  fs.rmSync(path.join(options.petsDir, "fox"), { recursive: true });
  fs.rmSync(path.join(options.petsDir, "halo"), { recursive: true });
  assert.throws(() => generateBuiltinPets(options), /halo is required/);
});

test("all ten reserved pet IDs have the specified seven locale names", () => {
  assert.equal(Object.keys(BUILTIN_PET_NAMES).length, 10);
  for (const names of Object.values(BUILTIN_PET_NAMES)) assert.deepEqual(Object.keys(names).sort(), [...SUPPORTED_LANGS].sort());
  assert.equal(BUILTIN_PET_NAMES.axolotl.zh, "六角恐龙");
  assert.equal(BUILTIN_PET_NAMES.wukong.en, "Monkey King");
});

test("fresh installs default to Halo, 50% volume and long-task completion sounds", () => {
  const defaults = prefs.getDefaults();
  assert.equal(defaults.theme, "halo");
  assert.equal(defaults.soundVolume, 0.5);
  assert.equal(defaults.completionSoundMode, "long");
});

test("v19 preferences retire every old theme reference without changing custom pets or volume", () => {
  const raw = {
    version: 19, theme: "fox", positionThemeId: "sunwukong", positionVariantId: "red",
    soundVolume: 0.8,
    themeVariant: Object.fromEntries([...LEGACY_THEME_IDS.map((id) => [id, "red"]), ["codex-pet-custom", "blue"]]),
    themeOverrides: Object.fromEntries([...LEGACY_THEME_IDS.map((id) => [id, { states: { idle: ["old.svg"] } }]), ["custom", { sounds: { complete: { file: "own.mp3" } } }]]),
  };
  const before = JSON.stringify(raw);
  const result = prefs.validate(prefs.migrate(raw));
  assert.equal(result.theme, "halo");
  assert.equal(result.positionThemeId, "halo");
  assert.equal(result.positionVariantId, "default");
  assert.deepEqual(result.themeVariant, { "codex-pet-custom": "blue" });
  assert.deepEqual(result.themeOverrides, { custom: { sounds: { complete: { file: "own.mp3" } } } });
  assert.equal(result.soundVolume, 0.8);
  assert.equal(JSON.stringify(raw), before);
  for (const id of LEGACY_THEME_IDS) assert.equal(prefs.migrate({ version: 19, theme: id }).theme, "halo");
  for (const soundVolume of [0, 0.2, 1]) assert.equal(prefs.validate(prefs.migrate({ version: 19, soundVolume })).soundVolume, soundVolume);
  assert.equal(prefs.migrate({ version: 19, theme: "codex-pet-custom" }).theme, "codex-pet-custom");
});

test("new pet choices and overrides survive subsequent launches", () => {
  const raw = { version: 20, theme: "fox", positionThemeId: "fox", themeOverrides: { halo: { sounds: { complete: "new.mp3" } } } };
  assert.deepEqual(prefs.migrate(raw).themeOverrides, raw.themeOverrides);
  assert.equal(prefs.migrate(raw).theme, "fox");
});


test("migration drops nested borrowed animation slots pointing at retired themes", () => {
  const result = prefs.migrate({ version: 19, theme: "custom", themeOverrides: {
    custom: { states: {
      idle: { file: "old.svg", sourceThemeId: "sprout" },
      working: { file: "own.svg" },
      thinking: { file: "imported.svg", sourceThemeId: "codex-pet-custom" },
    } },
  } });
  assert.equal(result.theme, "custom");
  assert.deepEqual(result.themeOverrides.custom.states, {
    working: { file: "own.svg" },
    thinking: { file: "imported.svg", sourceThemeId: "codex-pet-custom" },
  });
});

test("completion mode validates and persists through the settings controller", (t) => {
  const { petsDir } = setup(t);
  const file = path.join(petsDir, "prefs.json");
  const { createSettingsController } = require("../src/settings-controller");
  const controller = createSettingsController({ prefsPath: file });
  t.after(() => controller.dispose());
  for (const mode of ["always", "off", "long"]) {
    assert.equal(controller.applyUpdate("completionSoundMode", mode).status, "ok");
    controller.persist();
    assert.equal(prefs.load(file).snapshot.completionSoundMode, mode);
  }
  assert.equal(controller.applyUpdate("completionSoundMode", "invalid").status, "error");
});

test("every built-in pet gives the settings grid a real atlas preview", () => {
  const { listThemesWithMetadata } = require("../src/theme-metadata");
  const themes = listThemesWithMetadata({ builtinThemesDir: path.join(ROOT, "themes") });
  const ids = themes.map((theme) => theme.id).sort();
  assert.deepEqual(ids, Object.keys(BUILTIN_PET_NAMES).sort());
  assert.deepEqual(themes.map((theme) => theme.id), Object.keys(BUILTIN_PET_NAMES), "settings grid follows product order, Halo first");
  for (const theme of themes) {
    assert.ok(theme.codexPet, `${theme.id} has no atlas preview`);
    assert.equal(theme.managedCodexPet, undefined, `${theme.id} must not look like an imported pet`);
    const atlasPath = require("node:url").fileURLToPath(theme.codexPet.previewAtlasUrl);
    assert.equal(path.basename(atlasPath), "spritesheet.webp");
    assert.ok(fs.existsSync(atlasPath), `${theme.id} atlas missing`);
    assert.deepEqual([theme.codexPet.atlasColumns, theme.codexPet.atlasRows], [8, 11]);
    const header = fs.readFileSync(atlasPath).subarray(0, 30);
    assert.equal(header.toString("ascii", 8, 12), "WEBP");
  }
});
