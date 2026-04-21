import { hexToRgbNorm } from "./colorUtils";

// ─── Figma Console Script ─────────────────────────────────────────────────────
// Creates two collections:
//   • "Primitives"  — brand scale + neutral scale (1 mode: Values)
//   • collectionName — semantic tokens (2 modes: Light, Dark)

export function buildFigmaScript(theme, collectionName) {
  if (!theme?.primitives) return "// No theme generated yet";

  const { primitives, light, dark } = theme;

  const hex2rgb = (hex) => {
    const { r, g, b } = hexToRgbNorm(hex);
    return `{r:${r},g:${g},b:${b},a:1}`;
  };

  // Primitive color lines
  const primColorLines = Object.entries(primitives)
    .filter(([k]) => k.startsWith("color/"))
    .map(([k, v]) => `  setPrimColor(${JSON.stringify(k)}, ${hex2rgb(v)});`)
    .join("\n");

  // Semantic lines helper
  const semColorLines = (modeVar, obj) =>
    Object.entries(obj)
      .filter(([k]) => k.startsWith("color/"))
      .map(([k, v]) => `  setSemColor(${modeVar}, ${JSON.stringify(k)}, ${hex2rgb(v)});`)
      .join("\n");

  const semFontLines = (modeVar, obj) =>
    Object.entries(obj)
      .filter(([k]) => k.startsWith("font/"))
      .map(([k, v]) => `  setSemString(${modeVar}, ${JSON.stringify(k)}, ${JSON.stringify(v)});`)
      .join("\n");

  return `// ─── Figma Theme Import ───────────────────────────────────────
// Run in: Plugins → Development → Open Console
// Creates: "Primitives" collection + "${collectionName}" semantic collection

(function() {
  const SEM_NAME = ${JSON.stringify(collectionName)};

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3),16)/255;
    const g = parseInt(hex.slice(3,5),16)/255;
    const b = parseInt(hex.slice(5,7),16)/255;
    return {r, g, b, a:1};
  }

  function getOrCreateCol(name) {
    return figma.variables.getLocalVariableCollections().find(c => c.name === name)
      || figma.variables.createVariableCollection(name);
  }

  function setPrimColor(path, rgba) {
    const col = primCol;
    let v = figma.variables.getLocalVariables("COLOR")
      .find(x => x.variableCollectionId === col.id && x.name === path);
    if (!v) v = figma.variables.createVariable(path, col.id, "COLOR");
    v.setValueForMode(primCol.defaultModeId, rgba);
  }

  function setSemColor(modeId, path, rgba) {
    let v = figma.variables.getLocalVariables("COLOR")
      .find(x => x.variableCollectionId === semCol.id && x.name === path);
    if (!v) v = figma.variables.createVariable(path, semCol.id, "COLOR");
    v.setValueForMode(modeId, rgba);
  }

  function setSemString(modeId, path, value) {
    let v = figma.variables.getLocalVariables("STRING")
      .find(x => x.variableCollectionId === semCol.id && x.name === path);
    if (!v) v = figma.variables.createVariable(path, semCol.id, "STRING");
    v.setValueForMode(modeId, value);
  }

  // ── 1. Primitives collection ──────────────────────────────
  const primCol = getOrCreateCol("Primitives");

${primColorLines}

  // ── 2. Semantic collection (Light + Dark modes) ───────────
  const semCol = getOrCreateCol(SEM_NAME);

  let lightModeId, darkModeId;
  if (semCol.modes.length === 1) {
    semCol.renameMode(semCol.modes[0].modeId, "Light");
    lightModeId = semCol.modes[0].modeId;
    darkModeId  = semCol.addMode("Dark");
  } else {
    const lm = semCol.modes.find(m => m.name === "Light") || semCol.modes[0];
    const dm = semCol.modes.find(m => m.name === "Dark")  || semCol.modes[1];
    lightModeId = lm.modeId;
    darkModeId  = dm.modeId;
  }

  // Light mode
${semColorLines("lightModeId", light)}
${semFontLines("lightModeId", light)}

  // Dark mode
${semColorLines("darkModeId", dark)}
${semFontLines("darkModeId", dark)}

  figma.notify('✅ Theme imported into "Primitives" + "${collectionName}" (Light / Dark)');
})();`;
}

// ─── Token Studio JSON ────────────────────────────────────────────────────────
// Exports: global (primitives) + light + dark sets

function nestTokens(flat, type) {
  const out = {};
  Object.entries(flat).forEach(([key, value]) => {
    const parts = key.split("/");
    let node = out;
    parts.forEach((p, i) => {
      if (i === parts.length - 1) {
        node[p] = { value, type };
      } else {
        node[p] = node[p] || {};
        node = node[p];
      }
    });
  });
  return out;
}

export function buildTokenStudioJSON(theme) {
  if (!theme?.primitives) return "{}";

  const { primitives, light, dark } = theme;

  // Split primitives into colors and fonts (shouldn't be fonts in primitives, but safe)
  const primColors = Object.fromEntries(Object.entries(primitives).filter(([k]) => k.startsWith("color/")));

  const semColors = (obj) => Object.fromEntries(Object.entries(obj).filter(([k]) => k.startsWith("color/")));
  const semFonts  = (obj) => Object.fromEntries(Object.entries(obj).filter(([k]) => k.startsWith("font/")));

  const out = {
    global: nestTokens(primColors, "color"),
    light: {
      ...nestTokens(semColors(light), "color"),
      ...nestTokens(semFonts(light), "fontFamilies"),
    },
    dark: {
      ...nestTokens(semColors(dark), "color"),
      ...nestTokens(semFonts(dark), "fontFamilies"),
    },
  };

  return JSON.stringify(out, null, 2);
}
