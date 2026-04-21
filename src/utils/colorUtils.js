export function isValidHex(hex) {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

export function hexToRgbNorm(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return { r: +r.toFixed(4), g: +g.toFixed(4), b: +b.toFixed(4), a: 1 };
}

function linearize(c) {
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance(hex) {
  const r = linearize(parseInt(hex.slice(1, 3), 16) / 255);
  const g = linearize(parseInt(hex.slice(3, 5), 16) / 255);
  const b = linearize(parseInt(hex.slice(5, 7), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(hex1, hex2) {
  const l1 = luminance(hex1);
  const l2 = luminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker  = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function wcagLevel(ratio) {
  if (ratio >= 7)   return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3)   return "AA Large";
  return "Fail";
}

// ─── Brand-tinted neutral scale ───────────────────────────────────────────────
// Extracts the hue from the primary brand color and generates a 12-stop scale
// with very low saturation (8%) so it reads as neutral while carrying brand harmony.

function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
      default: break;
    }
  }
  return { h: h * 360, s, l };
}

function hslToHex(h, s, l) {
  // h: 0–360, s: 0–1, l: 0–1
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const val = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * Math.max(0, Math.min(1, val))).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * Generates a 12-stop neutral scale tinted with the primary brand hue.
 * Saturation is fixed at 8% — subtle enough to read as neutral,
 * strong enough to create visual harmony with the brand palette.
 *
 * @param {string} primaryHex – 6-digit hex of the primary brand color
 * @returns {{ [step: string]: string }} e.g. { "0": "#F9FAFB", "50": "#F3F4F7", … }
 */
export function generateNeutralScale(primaryHex) {
  const { h } = hexToHsl(primaryHex);
  const SAT = 0.08; // 8% — keeps the neutrals feeling neutral

  // [step, lightness] pairs — perceptually balanced across the range
  const stops = [
    ["0",   0.975],
    ["50",  0.955],
    ["100", 0.930],
    ["200", 0.878],
    ["300", 0.798],
    ["400", 0.695],
    ["500", 0.525],
    ["600", 0.415],
    ["700", 0.298],
    ["800", 0.182],
    ["900", 0.102],
    ["950", 0.056],
  ];

  return Object.fromEntries(
    stops.map(([step, l]) => [step, hslToHex(h, SAT, l)])
  );
}
