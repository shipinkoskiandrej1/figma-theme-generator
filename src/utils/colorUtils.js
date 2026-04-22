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
 * Generates a 12-stop neutral scale anchored to the primary brand color.
 *
 * Design intent:
 *  • Light end (0, 50)  — near-white with a barely-there brand tint (~4% mix)
 *  • Mid range (400–600) — clearly blue/green/red-gray depending on brand hue
 *  • Dark end (900, 950) — the darkest shade of the primary color, NOT black
 *
 * Technique: RGB interpolation between a near-white anchor and a near-black
 * anchor, where the brand mix ratio grows linearly from 4% → 30% as the
 * scale deepens. This guarantees visible hue influence at every stop and
 * ensures neutral/950 is an unmistakably dark version of the brand color.
 *
 * Why not HSL: HSL collapses chroma to zero at extreme lightness via
 * `a = s × min(L, 1−L)` — at L=0.975 the effective chroma is 0.002,
 * producing pure white regardless of saturation input.
 *
 * @param {string} primaryHex – 6-digit hex of the primary brand color
 * @returns {{ [step: string]: string }}
 */
export function generateNeutralScale(primaryHex) {
  const br = parseInt(primaryHex.slice(1, 3), 16);
  const bg = parseInt(primaryHex.slice(3, 5), 16);
  const bb = parseInt(primaryHex.slice(5, 7), 16);

  const toHex = v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");

  // t = 0 → lightest stop,  t = 1 → darkest stop
  // grayBase slides from 252 (near-white) → 8 (near-black)
  // brandMix  slides from  4% (subtle tint) → 30% (dominant brand hue)
  const stops = [
    ["0",   0.00],
    ["50",  0.05],
    ["100", 0.12],
    ["200", 0.22],
    ["300", 0.34],
    ["400", 0.47],
    ["500", 0.57],
    ["600", 0.66],
    ["700", 0.76],
    ["800", 0.85],
    ["900", 0.92],
    ["950", 1.00],
  ];

  return Object.fromEntries(stops.map(([step, t]) => {
    const grayBase = 252 - t * (252 - 8);        // 252 → 8
    const brandMix = 0.04 + t * (0.30 - 0.04);   //  4% → 30%

    const r = grayBase * (1 - brandMix) + br * brandMix;
    const g = grayBase * (1 - brandMix) + bg * brandMix;
    const b = grayBase * (1 - brandMix) + bb * brandMix;

    return [step, `#${toHex(r)}${toHex(g)}${toHex(b)}`];
  }));
}

/**
 * Finds the minimum lightness adjustment to fgHex so it achieves
 * targetRatio contrast against bgHex, preserving hue and saturation.
 *
 * Strategy:
 *  - Determine direction: if bg is light → fg must go darker; if bg is dark → fg must go lighter.
 *  - Binary search on HSL lightness in [0, currentL] or [currentL, 1].
 *  - Returns the closest passing color to the original (minimum change).
 *
 * @param {string} fgHex      – foreground color to fix
 * @param {string} bgHex      – background color (unchanged)
 * @param {number} targetRatio – minimum required contrast (default 4.5 for AA)
 * @returns {string}           – hex of the adjusted foreground
 */
export function findAccessibleColor(fgHex, bgHex, targetRatio = 4.5) {
  // Already passes — nothing to do
  if (contrastRatio(fgHex, bgHex) >= targetRatio) return fgHex;

  const bgLum   = luminance(bgHex);
  const { h, s, l: origL } = hexToHsl(fgHex);

  // Light background → darken fg (search L downward from origL toward 0)
  // Dark  background → lighten fg (search L upward from origL toward 1)
  const bgIsLight = bgLum > 0.179;

  let lo = bgIsLight ? 0      : origL;
  let hi = bgIsLight ? origL  : 1;
  let best = bgIsLight ? hslToHex(h, s, 0) : hslToHex(h, s, 1);

  for (let i = 0; i < 26; i++) {
    const mid       = (lo + hi) / 2;
    const candidate = hslToHex(h, s, mid);
    if (contrastRatio(candidate, bgHex) >= targetRatio) {
      best = candidate;
      // Good — try to get closer to the original (less aggressive adjustment)
      if (bgIsLight) lo = mid;  // try lighter (higher L)
      else           hi = mid;  // try darker  (lower L)
    } else {
      // Not enough contrast — push further from original
      if (bgIsLight) hi = mid;  // go darker
      else           lo = mid;  // go lighter
    }
  }

  return best;
}
