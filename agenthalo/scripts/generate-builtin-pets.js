"use strict";

const fs = require("node:fs");
const path = require("node:path");
const adapter = require("../src/codex-pet-adapter");
const { BUILTIN_PET_NAMES } = require("../src/builtin-pets");

// Compile only the packages present. Use the import adapter unchanged, then
// attach built-in metadata and local sounds; no runtime userData writes needed.
function generateBuiltinPets({
  petsDir = path.join(__dirname, "..", "pets"),
  themesDir = path.join(__dirname, "..", "themes"),
} = {}) {
  const packages = adapter.scanCodexPetPackages(petsDir);
  for (const result of packages) {
    if (!result.ok) throw new Error(`${result.packageDir}: ${result.errors.join("; ")}`);
    const info = result.packageInfo;
    if (!BUILTIN_PET_NAMES[info.id] || path.basename(info.packageDir) !== info.id) {
      throw new Error(`Unknown or mismatched built-in pet ID: ${info.id}`);
    }
    if (info.spriteVersionNumber !== 2) throw new Error(`${info.id}: built-in pets require spriteVersionNumber 2`);
    for (const name of ["complete", "confirm"]) {
      if (!fs.statSync(path.join(info.packageDir, "sounds", `${name}.mp3`)).isFile()) {
        throw new Error(`${info.id}: missing ${name} sound`);
      }
    }
  }
  if (!packages.some(({ packageInfo }) => packageInfo.id === "halo")) {
    throw new Error("The default built-in pet halo is required");
  }
  fs.mkdirSync(themesDir, { recursive: true });
  const staging = fs.mkdtempSync(path.join(themesDir, ".builtin-pets-"));
  try {
    for (const { packageInfo: info } of packages) {
      const generated = adapter.materializeCodexPetTheme(info, staging, { themeId: info.id });
      const theme = generated.themeJson;
      theme.name = BUILTIN_PET_NAMES[info.id];
      // Stable, relative metadata: no local build-machine path or import marker.
      theme.source = { ...theme.source, type: "builtin-pet", packagePath: `pets/${info.id}` };
      theme.sounds = { complete: "complete.mp3", confirm: "confirm.mp3" };
      fs.writeFileSync(path.join(generated.themeDir, "theme.json"), `${JSON.stringify(theme, null, 2)}\n`);
      fs.rmSync(path.join(generated.themeDir, adapter.MARKER_FILENAME));
      fs.cpSync(path.join(info.packageDir, "sounds"), path.join(generated.themeDir, "sounds"), { recursive: true });
    }
    // Remove generated themes whose package was removed. Keep template and any
    // unrelated theme directory intact.
    const ids = packages.map(({ packageInfo }) => packageInfo.id);
    for (const entry of fs.readdirSync(themesDir, { withFileTypes: true })) {
      if (!entry.isDirectory() || ids.includes(entry.name)) continue;
      const jsonPath = path.join(themesDir, entry.name, "theme.json");
      if (!fs.existsSync(jsonPath)) continue;
      const theme = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
      if (theme.source?.type === "builtin-pet") fs.rmSync(path.dirname(jsonPath), { recursive: true });
    }
    for (const id of ids) {
      fs.rmSync(path.join(themesDir, id), { recursive: true, force: true });
      fs.renameSync(path.join(staging, id), path.join(themesDir, id));
    }
    return ids;
  } finally {
    fs.rmSync(staging, { recursive: true, force: true });
  }
}

if (require.main === module) console.log(`Built-in pets: ${generateBuiltinPets().join(", ")}`);
module.exports = { generateBuiltinPets };
