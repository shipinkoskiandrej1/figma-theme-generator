import { GROUPS } from "./constants";
import { hexToRgbNorm } from "./colorUtils";

export function buildFigmaScript(theme, collectionName) {
  const colorVars = GROUPS.flatMap(g => g.vars).filter(v => v.type === "color" && theme[v.key]);
  const fontVars  = GROUPS.flatMap(g => g.vars).filter(v => v.type === "font"  && theme[v.key]);

  const colorLines = colorVars.map(v => {
    const { r, g, b, a } = hexToRgbNorm(theme[v.key]);
    return `  setColor(col, mode, ${JSON.stringify(v.key)}, {r:${r},g:${g},b:${b},a:${a}});`;
  }).join("\n");

  const fontLines = fontVars.map(v =>
    `  setString(col, mode, ${JSON.stringify(v.key)}, ${JSON.stringify(theme[v.key])});`
  ).join("\n");

  return `// ─── Figma Theme Import ───────────────────────────────────
// Run this in: Plugins → Development → Open Console  (or via Script Runner)
// Collection: "${collectionName}"

(function() {
  const NAME = ${JSON.stringify(collectionName)};

  function getOrCreateCollection(name) {
    const existing = figma.variables.getLocalVariableCollections()
      .find(c => c.name === name);
    return existing || figma.variables.createVariableCollection(name);
  }

  function setColor(col, modeId, path, rgba) {
    let v = figma.variables.getLocalVariables("COLOR")
      .find(x => x.variableCollectionId === col.id && x.name === path);
    if (!v) v = figma.variables.createVariable(path, col.id, "COLOR");
    v.setValueForMode(modeId, rgba);
  }

  function setString(col, modeId, path, value) {
    let v = figma.variables.getLocalVariables("STRING")
      .find(x => x.variableCollectionId === col.id && x.name === path);
    if (!v) v = figma.variables.createVariable(path, col.id, "STRING");
    v.setValueForMode(modeId, value);
  }

  const col  = getOrCreateCollection(NAME);
  const mode = col.defaultModeId;

${colorLines}
${fontLines}

  figma.notify("✅ Theme variables imported into \\"" + NAME + "\\"");
})();`;
}

export function buildTokenStudioJSON(theme) {
  const out = { global: {} };
  GROUPS.flatMap(g => g.vars).forEach(v => {
    if (!theme[v.key]) return;
    const parts = v.key.split("/");
    let node = out.global;
    parts.forEach((p, i) => {
      if (i === parts.length - 1) {
        node[p] = { value: theme[v.key], type: v.type === "color" ? "color" : "fontFamilies" };
      } else {
        node[p] = node[p] || {};
        node = node[p];
      }
    });
  });
  return JSON.stringify(out, null, 2);
}
