import { hexToRgbNorm } from "./colorUtils";

// ─── Figma Console Script ─────────────────────────────────────────────────────
// Creates ONE "Colors" collection with Light and Dark modes.
//   • Primitive palette tokens  — same hex value in both modes
//   • Semantic tokens           — aliased to primitives via createVariableAlias()
//     (fallback to resolved hex when alias key is missing/unknown)

export function buildFigmaScript(theme, collectionName = "Colors") {
  if (!theme?.primitives) return "// No theme generated yet";

  const { primitives, light, dark, aliases = {} } = theme;
  const lightAliases = aliases.light || {};
  const darkAliases  = aliases.dark  || {};

  const fmt = (hex) => {
    const { r, g, b } = hexToRgbNorm(hex || "#000000");
    return `{r:${r},g:${g},b:${b},a:1}`;
  };

  // ── Inline data objects ──────────────────────────────────────────────────
  const inlineObj = (obj) =>
    "{\n" + Object.entries(obj).map(([k, v]) => `    ${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(",\n") + "\n  }";

  const primColors   = Object.fromEntries(Object.entries(primitives).filter(([k]) => k.startsWith("color/")));
  const lightColors  = Object.fromEntries(Object.entries(light).filter(([k]) => k.startsWith("color/")));
  const darkColors   = Object.fromEntries(Object.entries(dark).filter(([k]) => k.startsWith("color/")));
  const lightFonts   = Object.fromEntries(Object.entries(light).filter(([k]) => k.startsWith("font/")));
  const darkFonts    = Object.fromEntries(Object.entries(dark).filter(([k]) => k.startsWith("font/")));

  const lightAliasColors = Object.fromEntries(Object.entries(lightAliases).filter(([k]) => k.startsWith("color/")));
  const darkAliasColors  = Object.fromEntries(Object.entries(darkAliases).filter(([k]) => k.startsWith("color/")));

  return `// ─── Figma Theme Import — Single Collection ──────────────────
// Run in: Plugins → Development → Open Console
//
// Creates: "Colors" collection with Light + Dark modes
//   • Primitive tokens: same values in both modes
//   • Semantic tokens: aliased to primitives (auto-resolve on mode switch)

(function() {

  function hexToRgb(hex) {
    if (!hex || hex.length < 7) return {r:0,g:0,b:0,a:1};
    return {
      r: parseInt(hex.slice(1,3),16)/255,
      g: parseInt(hex.slice(3,5),16)/255,
      b: parseInt(hex.slice(5,7),16)/255,
      a: 1,
    };
  }

  function getOrCreateCol(name) {
    return figma.variables.getLocalVariableCollections().find(c => c.name === name)
      || figma.variables.createVariableCollection(name);
  }

  function getOrCreateVar(col, name, type) {
    return figma.variables.getLocalVariables(type)
      .find(x => x.variableCollectionId === col.id && x.name === name)
      || figma.variables.createVariable(name, col.id, type);
  }

  // ── Collection + modes ────────────────────────────────────────────────────
  const col = getOrCreateCol("Colors");

  let lightModeId, darkModeId;
  if (col.modes.length === 1) {
    col.renameMode(col.modes[0].modeId, "Light");
    lightModeId = col.modes[0].modeId;
    darkModeId  = col.addMode("Dark");
  } else {
    const lm = col.modes.find(m => m.name === "Light") || col.modes[0];
    const dm = col.modes.find(m => m.name === "Dark")  || col.modes[1];
    lightModeId = lm.modeId;
    darkModeId  = dm.modeId;
  }

  // ── 1. Primitive palette tokens ───────────────────────────────────────────
  // Identical hex values in both Light and Dark modes
  const PRIMITIVES = ${inlineObj(primColors)};

  const primVars = {};
  for (const [name, hex] of Object.entries(PRIMITIVES)) {
    const v   = getOrCreateVar(col, name, "COLOR");
    const rgb = hexToRgb(hex);
    v.setValueForMode(lightModeId, rgb);
    v.setValueForMode(darkModeId,  rgb);
    primVars[name] = v;
  }

  // ── 2. Semantic color tokens ──────────────────────────────────────────────
  // Aliases resolve automatically when the user switches mode in Figma.
  // Fallback hex values are used if an alias target is missing.

  const LIGHT_ALIASES = ${inlineObj(lightAliasColors)};
  const DARK_ALIASES  = ${inlineObj(darkAliasColors)};
  const LIGHT_HEX     = ${inlineObj(lightColors)};
  const DARK_HEX      = ${inlineObj(darkColors)};

  for (const name of Object.keys(LIGHT_HEX)) {
    const v = getOrCreateVar(col, name, "COLOR");

    // Light mode
    const la = LIGHT_ALIASES[name];
    if (la && primVars[la]) {
      v.setValueForMode(lightModeId, figma.variables.createVariableAlias(primVars[la]));
    } else {
      v.setValueForMode(lightModeId, hexToRgb(LIGHT_HEX[name] || "#000000"));
    }

    // Dark mode
    const da = DARK_ALIASES[name];
    if (da && primVars[da]) {
      v.setValueForMode(darkModeId, figma.variables.createVariableAlias(primVars[da]));
    } else {
      v.setValueForMode(darkModeId, hexToRgb(DARK_HEX[name] || "#000000"));
    }
  }

  // ── 3. Font string tokens ─────────────────────────────────────────────────
  const FONTS_LIGHT = ${inlineObj(lightFonts)};
  const FONTS_DARK  = ${inlineObj(darkFonts)};

  for (const name of Object.keys(FONTS_LIGHT)) {
    const v = getOrCreateVar(col, name, "STRING");
    v.setValueForMode(lightModeId, FONTS_LIGHT[name] || "");
    v.setValueForMode(darkModeId,  FONTS_DARK[name]  || FONTS_LIGHT[name] || "");
  }

  const primCount = Object.keys(PRIMITIVES).length;
  const semCount  = Object.keys(LIGHT_HEX).length;
  figma.notify(\`✅ "Colors" — \${primCount} primitives + \${semCount} semantic tokens — Light + Dark\`);
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
