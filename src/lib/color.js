export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function hsvToRgb(h, s, v) {
  h = ((h % 360) + 360) % 360; s = clamp(s, 0, 100) / 100; v = clamp(v, 0, 100) / 100;
  const i = Math.floor(h / 60) % 6;
  const f = h / 60 - Math.floor(h / 60);
  const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
  let r, g, b;
  switch (i) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    default: r = v; g = p; b = q;
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

export function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360; s = clamp(s, 0, 100) / 100; l = clamp(l, 0, 100) / 100;
  if (s === 0) { const v = Math.round(l * 255); return { r: v, g: v, b: v }; }
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = hue2rgb(p, q, h / 360 + 1 / 3);
  const g = hue2rgb(p, q, h / 360);
  const b = hue2rgb(p, q, h / 360 - 1 / 3);
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

export function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

export function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60; if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  return { h, s: s * 100, v: max * 100 };
}

export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const h = Math.round(clamp(x, 0, 255)).toString(16);
    return h.length === 1 ? '0' + h : h;
  }).join('').toUpperCase();
}

export function hexToRgb(hex) {
  hex = String(hex).replace('#', '').trim();
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;
  const num = parseInt(hex, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

export function relLuminance(rgb) {
  const chan = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  return 0.2126 * chan(rgb.r) + 0.7152 * chan(rgb.g) + 0.0722 * chan(rgb.b);
}

export function contrastRatio(rgb1, rgb2) {
  const L1 = relLuminance(rgb1) + 0.05, L2 = relLuminance(rgb2) + 0.05;
  return L1 > L2 ? L1 / L2 : L2 / L1;
}

export function bestTextColor(bgRgb) {
  const black = { r: 0, g: 0, b: 0 }, white = { r: 255, g: 255, b: 255 };
  return contrastRatio(bgRgb, black) >= contrastRatio(bgRgb, white) ? '#000000' : '#ffffff';
}

export function findAAFix(hsl, fgRgb, targetRatio = 4.5) {
  const passAt = l => contrastRatio(hslToRgb(hsl.h, hsl.s, l), fgRgb) >= targetRatio;
  let lighter = null, darker = null;
  for (let l = hsl.l; l <= 100; l += 1) { if (passAt(l)) { lighter = l; break; } }
  for (let l = hsl.l; l >= 0; l -= 1) { if (passAt(l)) { darker = l; break; } }
  const candidates = [];
  if (lighter !== null) candidates.push({ l: lighter, delta: lighter - hsl.l });
  if (darker !== null) candidates.push({ l: darker, delta: hsl.l - darker });
  if (!candidates.length) return null;
  candidates.sort((a, b) => a.delta - b.delta);
  return candidates[0].l;
}

export function suggestClosestPassing(centerHsl, fgRgb, targetRatio) {
  const l1 = findAAFix(centerHsl, fgRgb, targetRatio);
  if (l1 !== null) return { h: centerHsl.h, s: centerHsl.s, l: l1 };
  const grayHsl = { h: centerHsl.h, s: 0, l: centerHsl.l };
  const l2 = findAAFix(grayHsl, fgRgb, targetRatio);
  if (l2 !== null) return { h: 0, s: 0, l: l2 };
  return null;
}

export const AA_THRESHOLDS = {
  AA: { normal: 4.5, large: 3 },
  AAA: { normal: 7, large: 4.5 },
};
