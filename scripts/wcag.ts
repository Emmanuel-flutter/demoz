// Dependency-free WCAG 2.x contrast helpers.
//
// Used by scripts/extract-brand.ts to gate a proposed brand palette:
//   - foreground vs background must reach >= 4.5:1 (normal body text).
//   - accent / accentCyan / muted vs background must reach >= 3:1 (large text / UI).
//
// Everything here is pure math on hex strings. No runtime dependency.

export type Rgb = { r: number; g: number; b: number };

// Accepts "#RGB" or "#RRGGBB" (case-insensitive). Throws on anything else.
export const hexToRgb = (hex: string): Rgb => {
  const clean = hex.trim().replace(/^#/, "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    throw new Error(`Invalid hex color: "${hex}"`);
  }
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
};

export const rgbToHex = ({ r, g, b }: Rgb): string => {
  const to2 = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return `#${to2(r)}${to2(g)}${to2(b)}`.toUpperCase();
};

// Per WCAG 2.x: linearize each sRGB channel, then weight.
export const relativeLuminance = (rgb: Rgb): number => {
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return (
    0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b)
  );
};

// Contrast ratio between two colors, always >= 1 (order-independent).
export const contrastRatio = (a: string, b: string): number => {
  const la = relativeLuminance(hexToRgb(a));
  const lb = relativeLuminance(hexToRgb(b));
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
};

// Round a contrast ratio to 2 decimals for reporting.
export const roundRatio = (ratio: number): number =>
  Math.round(ratio * 100) / 100;

// --- HSL helpers (used only to nudge lightness while keeping hue/saturation) ---

type Hsl = { h: number; s: number; l: number };

const rgbToHsl = ({ r, g, b }: Rgb): Hsl => {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
    }
    h /= 6;
  }
  return { h, s, l };
};

const hslToRgb = ({ h, s, l }: Hsl): Rgb => {
  if (s === 0) {
    const v = l * 255;
    return { r: v, g: v, b: v };
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: hue2rgb(p, q, h + 1 / 3) * 255,
    g: hue2rgb(p, q, h) * 255,
    b: hue2rgb(p, q, h - 1 / 3) * 255,
  };
};

export type RepairResult = {
  meets: boolean; // did the ORIGINAL color already meet the target?
  ratio: number; // contrast ratio of the original color vs background
  suggested: string; // a repaired hex that meets the target (or best effort)
  suggestedRatio: number; // contrast ratio of the suggested color
  changed: boolean; // is `suggested` different from the original?
};

// Nudge the foreground's lightness (keeping hue/saturation) until it meets
// `target` contrast against `background`. Scans lightness across its full range
// and picks the value that meets the target with the smallest change from the
// original; if nothing meets it, returns the highest-contrast option found.
export const repairForContrast = (
  foreground: string,
  background: string,
  target: number,
): RepairResult => {
  const originalRatio = contrastRatio(foreground, background);
  if (originalRatio >= target) {
    return {
      meets: true,
      ratio: roundRatio(originalRatio),
      suggested: foreground.toUpperCase(),
      suggestedRatio: roundRatio(originalRatio),
      changed: false,
    };
  }

  const hsl = rgbToHsl(hexToRgb(foreground));
  const originalL = hsl.l;

  // Candidate that MEETS the target with the smallest lightness change.
  let best: { hex: string; ratio: number; dist: number } | null = null;
  // Best overall contrast, used only if nothing meets the target.
  let fallback = { hex: foreground.toUpperCase(), ratio: originalRatio };

  for (let step = 0; step <= 100; step++) {
    const l = step / 100;
    const candidate = rgbToHex(hslToRgb({ h: hsl.h, s: hsl.s, l }));
    const ratio = contrastRatio(candidate, background);
    if (ratio > fallback.ratio) {
      fallback = { hex: candidate, ratio };
    }
    if (ratio >= target) {
      const dist = Math.abs(l - originalL);
      if (best === null || dist < best.dist) {
        best = { hex: candidate, ratio, dist };
      }
    }
  }

  const chosen = best ?? fallback;
  return {
    meets: false,
    ratio: roundRatio(originalRatio),
    suggested: chosen.hex,
    suggestedRatio: roundRatio(chosen.ratio),
    changed: chosen.hex.toUpperCase() !== foreground.toUpperCase(),
  };
};
