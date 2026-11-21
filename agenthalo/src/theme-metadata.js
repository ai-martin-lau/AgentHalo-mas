"use strict";

// Design invariant: this module must not require theme-loader, hold active-theme
// state, or read directories owned by theme-loader.init(). Directory roots and
// single-theme reads are injected through options.

const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const {
  isPlainObject,
  getStateFiles,
  buildCapabilities,
} = require("./theme-schema");
const {
  ATLAS_BY_SPRITE_VERSION,
  DEFAULT_SPRITE_VERSION_NUMBER,
} = require("./codex-pet-adapter");

function fileUrl(absPath) {
  try { return pathToFileURL(absPath).href; } catch { return null; }
}

// Previews resolve inside the theme's own assets folder only; built-in themes
// no longer share a central artwork folder.
function buildPreviewUrl(raw, themeDir, _isBuiltin, _options = {}) {
  const previewFile = (typeof raw.preview === "string" && raw.preview)
    || getStateFiles(raw.states && raw.states.idle)[0]
    || null;
  if (!previewFile) return null;
  const filename = path.basename(previewFile);
  const themeLocal = path.join(themeDir, "assets", filename);
  return fs.existsSync(themeLocal) ? fileUrl(themeLocal) : null;
}

function buildVariantPreviewUrl(raw, variantSpec, themeDir, isBuiltin, options = {}) {
  let previewFile = null;
  if (variantSpec) {
    if (typeof variantSpec.preview === "string" && variantSpec.preview) {
      previewFile = variantSpec.preview;
    } else if (Array.isArray(variantSpec.idleAnimations)
               && variantSpec.idleAnimations[0]
               && typeof variantSpec.idleAnimations[0].file === "string") {
      previewFile = variantSpec.idleAnimations[0].file;
    }
  }
  if (previewFile) {
    const filename = path.basename(previewFile);
    const themeLocal = path.join(themeDir, "assets", filename);
    if (fs.existsSync(themeLocal)) return fileUrl(themeLocal);
  }
  return buildPreviewUrl(raw, themeDir, isBuiltin, options);
}

function buildVariantMetadata(raw, themeDir, isBuiltin, options = {}) {
  const rawVariants = isPlainObject(raw.variants) ? raw.variants : {};
  const hasExplicitDefault = isPlainObject(rawVariants.default);
  const out = [];

  if (!hasExplicitDefault) {
    out.push({
      id: "default",
      name: { en: "Standard", zh: "标准", "zh-TW": "標準" },
      description: null,
      previewFileUrl: buildPreviewUrl(raw, themeDir, isBuiltin, options),
    });
  }
  for (const [id, spec] of Object.entries(rawVariants)) {
    if (!isPlainObject(spec)) continue;
    out.push({
      id,
      name: (spec.name != null) ? spec.name : id,
      description: (spec.description != null) ? spec.description : null,
      previewFileUrl: buildVariantPreviewUrl(raw, spec, themeDir, isBuiltin, options),
    });
  }
  return out;
}

function computePreviewContentRatio(raw) {
  const vb = raw && raw.viewBox;
  const cb = raw && raw.layout && raw.layout.contentBox;
  if (!vb || !cb) return null;
  if (!(vb.width > 0) || !(vb.height > 0)) return null;
  if (!(cb.width > 0) || !(cb.height > 0)) return null;
  return Math.max(cb.width / vb.width, cb.height / vb.height);
}

function computePreviewContentOffsetPct(raw) {
  const vb = raw && raw.viewBox;
  const cb = raw && raw.layout && raw.layout.contentBox;
  if (!vb || !cb) return null;
  if (!(vb.width > 0) || !(vb.height > 0)) return null;
  const cbCenterX = cb.x + cb.width / 2;
  const cbCenterY = cb.y + cb.height / 2;
  const vbCenterX = vb.x + vb.width / 2;
  const vbCenterY = vb.y + vb.height / 2;
  return {
    x: -((cbCenterX - vbCenterX) / vb.width) * 100,
    y: -((cbCenterY - vbCenterY) / vb.height) * 100,
  };
}

// Built-in pets render from a raster atlas. Their generated preview SVG links
// to spritesheet.webp, and an SVG loaded through <img> never fetches external
// resources, so the settings tile would stay blank. Hand the atlas itself to
// the settings page instead, the same way imported Codex pets are shown.
function buildBuiltinPetPreview(raw, themeDir, isBuiltin) {
  const source = raw && raw.source;
  if (!isBuiltin || !isPlainObject(source) || source.type !== "builtin-pet") return null;
  const name = typeof source.spritesheetPath === "string" && path.basename(source.spritesheetPath);
  if (!name) return null;
  const atlasPath = path.join(themeDir, "assets", name);
  if (!fs.existsSync(atlasPath)) return null;
  const previewAtlasUrl = fileUrl(atlasPath);
  if (!previewAtlasUrl) return null;
  const atlas = ATLAS_BY_SPRITE_VERSION[source.spriteVersionNumber]
    || ATLAS_BY_SPRITE_VERSION[DEFAULT_SPRITE_VERSION_NUMBER];
  return { previewAtlasUrl, atlasColumns: atlas.columns, atlasRows: atlas.rows };
}

function buildThemeMetadata(themeId, raw, isBuiltin, themeDir, options = {}) {
  if (!raw) return null;
  const builtinPetPreview = buildBuiltinPetPreview(raw, themeDir, isBuiltin);
  return {
    id: themeId,
    name: raw.name || themeId,
    builtin: !!isBuiltin,
    ...(builtinPetPreview ? { codexPet: builtinPetPreview } : {}),
    previewFileUrl: buildPreviewUrl(raw, themeDir, isBuiltin, options),
    previewContentRatio: computePreviewContentRatio(raw),
    previewContentOffsetPct: computePreviewContentOffsetPct(raw),
    variants: buildVariantMetadata(raw, themeDir, isBuiltin, options),
    capabilities: buildCapabilities(raw, { trustedRuntimeAllowed: !!isBuiltin }),
  };
}

function getThemeMetadata(themeId, options = {}) {
  const readThemeJson = options.readThemeJson;
  if (typeof readThemeJson !== "function") {
    throw new TypeError("getThemeMetadata requires options.readThemeJson");
  }
  const { raw, isBuiltin, themeDir } = readThemeJson(themeId);
  return buildThemeMetadata(themeId, raw, isBuiltin, themeDir, options);
}

function listThemesWithMetadata(options = {}) {
  const themes = [];
  const seen = new Set();
  if (options.builtinThemesDir) scanMetadata(options.builtinThemesDir, true, themes, seen, options);
  if (options.userThemesDir) scanMetadata(options.userThemesDir, false, themes, seen, options);
  return themes;
}

function scanMetadata(dir, builtin, themes, seen, options = {}) {
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory() || seen.has(entry.name)) continue;
      const jsonPath = path.join(dir, entry.name, "theme.json");
      let raw;
      try { raw = JSON.parse(fs.readFileSync(jsonPath, "utf8")); } catch { continue; }
      if (raw && raw._scaffoldOnly === true) continue;
      const themeDir = path.join(dir, entry.name);
      themes.push(buildThemeMetadata(entry.name, raw, builtin, themeDir, options));
      seen.add(entry.name);
    }
  } catch { /* dir missing */ }
}

module.exports = {
  getThemeMetadata,
  listThemesWithMetadata,
  buildThemeMetadata,
  buildPreviewUrl,
  buildVariantPreviewUrl,
  buildVariantMetadata,
  computePreviewContentRatio,
  computePreviewContentOffsetPct,
};
