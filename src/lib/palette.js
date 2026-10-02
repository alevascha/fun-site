import { clamp, hslToRgb, rgbToHex } from './color';

export const HARMONIES = [
  { id: 'complementary', label: 'Complementary', offsets: [0, 180] },
  { id: 'analogous', label: 'Analogous', offsets: [0, 30, 330] },
  { id: 'split-complementary', label: 'Split Comp.', offsets: [0, 150, 210] },
  { id: 'triad', label: 'Triad', offsets: [0, 120, 240] },
  { id: 'square', label: 'Square', offsets: [0, 90, 180, 270] },
  { id: 'compound', label: 'Compound', offsets: [0, 30, 180, 210] },
  { id: 'shades', label: 'Shades', offsets: [0] },
  { id: 'monochromatic', label: 'Mono', offsets: [0] },
];

export function getHarmonyHues(h, harmonyId) {
  const def = HARMONIES.find(x => x.id === harmonyId) || HARMONIES[0];
  return def.offsets.map(o => (h + o) % 360);
}

function toneFromHsl(hsl) {
  const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return { hex: rgbToHex(rgb.r, rgb.g, rgb.b), hsl };
}

const TONE_ORDER = [
  { symbol: '+3', dir: 1, frac: 0.75 },
  { symbol: '+2', dir: 1, frac: 0.5 },
  { symbol: '+1', dir: 1, frac: 0.25 },
  { symbol: '•', dir: 0, frac: 0 },
  { symbol: '-1', dir: -1, frac: 0.25 },
  { symbol: '-2', dir: -1, frac: 0.5 },
  { symbol: '-3', dir: -1, frac: 0.75 },
];

/* Builds the 7-tone column (3 lighter, base, 3 darker) around hsl. Lighter
   tones interpolate toward white, darker toward black, and a cleanup pass
   guarantees every tone on each side is strictly lighter/darker than the
   one closer to center — so nothing ever repeats. */
export function buildToneColumn(hsl) {
  const tones = TONE_ORDER.map(o => {
    let l;
    if (o.dir > 0) l = hsl.l + (100 - hsl.l) * o.frac;
    else if (o.dir < 0) l = hsl.l * (1 - o.frac);
    else l = hsl.l;
    const s = clamp(hsl.s * (1 - o.frac * 0.15), 0, 100);
    const tone = toneFromHsl({ h: hsl.h, s, l: clamp(l, 0, 100) });
    return { key: o.symbol, symbol: o.symbol, hex: tone.hex, hsl: tone.hsl };
  });

  for (let i = 2; i >= 0; i--) {
    let guard = 0;
    while ((tones[i].hsl.l <= tones[i + 1].hsl.l || tones[i].hex === tones[i + 1].hex) && guard < 100) {
      const newL = clamp(tones[i].hsl.l + 1, 0, 100);
      if (newL === tones[i].hsl.l) break;
      const t = toneFromHsl({ h: tones[i].hsl.h, s: tones[i].hsl.s, l: newL });
      tones[i] = { ...tones[i], hex: t.hex, hsl: t.hsl };
      guard++;
    }
  }
  for (let i = 4; i <= 6; i++) {
    let guard = 0;
    while ((tones[i].hsl.l >= tones[i - 1].hsl.l || tones[i].hex === tones[i - 1].hex) && guard < 100) {
      const newL = clamp(tones[i].hsl.l - 1, 0, 100);
      if (newL === tones[i].hsl.l) break;
      const t = toneFromHsl({ h: tones[i].hsl.h, s: tones[i].hsl.s, l: newL });
      tones[i] = { ...tones[i], hex: t.hex, hsl: t.hsl };
      guard++;
    }
  }
  return tones;
}

export const MAIN_LABELS = ['100', '300', '500', '700', '900'];

export function labelRamp(ramp, prefix, labels) {
  return ramp.map((hsl, i) => ({
    name: prefix + ' ' + labels[i],
    tones: buildToneColumn(hsl),
  }));
}

export function buildTonalRamp(hsl, amounts) {
  return amounts.map(a => {
    let l;
    if (a >= 0) { l = hsl.l + (100 - hsl.l) * a; }
    else { l = hsl.l * (1 + a); }
    const s = clamp(hsl.s * (1 - Math.abs(a) * 0.25), 0, 100);
    return { h: hsl.h, s, l: clamp(l, 0, 100) };
  });
}

export function buildNeutralRamp(hue, type) {
  if (type === 'light') {
    return [{ h: hue, s: 20, l: 97 }, { h: hue, s: 20, l: 92 }, { h: hue, s: 20, l: 85 }, { h: hue, s: 20, l: 78 }, { h: hue, s: 20, l: 70 }];
  }
  return [{ h: hue, s: 20, l: 30 }, { h: hue, s: 20, l: 22 }, { h: hue, s: 20, l: 15 }, { h: hue, s: 20, l: 9 }, { h: hue, s: 20, l: 4 }];
}

const ROLE_NAMES = ['Main', 'Secondary', 'Tertiary', 'Accent'];
const NEUTRAL_LIGHT_WEIGHT = 25;
const NEUTRAL_DARK_WEIGHT = 15;

/* Number of color groups matches the harmony exactly: complementary -> 2,
   analogous/split-complementary/triad -> 3, square/compound -> 4.
   Shades/monochromatic -> 2 (Main + a tone-shifted Secondary of the same
   hue). Neutral Light and Neutral Dark are always generated regardless of N. */
export function buildPaletteGroups(baseHsl, harmony) {
  const isMonoLike = (harmony === 'shades' || harmony === 'monochromatic');
  const hues = isMonoLike ? [baseHsl.h, baseHsl.h] : getHarmonyHues(baseHsl.h, harmony);
  const N = hues.length;

  const colorPool = 100 - NEUTRAL_LIGHT_WEIGHT - NEUTRAL_DARK_WEIGHT; // 60
  const denom = (N * (N + 1)) / 2;
  const weights = hues.map((h, i) => Math.round((colorPool * (N - i)) / denom));

  const colorGroups = hues.map((hue, i) => {
    let hsl;
    if (isMonoLike && i === 1) { hsl = { h: hue, s: clamp(baseHsl.s + 25, 0, 100), l: 50 }; }
    else if (i === 0) { hsl = { h: hue, s: baseHsl.s, l: baseHsl.l }; }
    else { hsl = { h: hue, s: clamp(baseHsl.s + 10 - (i - 1) * 3, 0, 100), l: baseHsl.l }; }
    const name = ROLE_NAMES[i] || ('Accent ' + i);
    const ramp = buildTonalRamp(hsl, [0.6, 0.3, 0, -0.3, -0.6]);
    return { name, percentage: weights[i] + '%', weight: weights[i], swatches: labelRamp(ramp, name, MAIN_LABELS) };
  });

  const colorSum = weights.reduce((a, b) => a + b, 0);
  const neutralDarkWeight = NEUTRAL_DARK_WEIGHT + (colorPool - colorSum);

  const lightRamp = buildNeutralRamp(hues[0], 'light');
  const darkRamp = buildNeutralRamp(hues[0], 'dark');
  const neutralLight = { name: 'Neutral Light', percentage: NEUTRAL_LIGHT_WEIGHT + '%', weight: NEUTRAL_LIGHT_WEIGHT, swatches: labelRamp(lightRamp, 'Neutral Light', MAIN_LABELS) };
  const neutralDark = { name: 'Neutral Dark', percentage: neutralDarkWeight + '%', weight: neutralDarkWeight, swatches: labelRamp(darkRamp, 'Neutral Dark', MAIN_LABELS) };

  return [...colorGroups, neutralLight, neutralDark];
}

/* Spanish labels for generated group/swatch/text-color names and harmonies. */
const NAME_ES = [
  ['Neutral Light', 'Neutro claro'], ['Neutral Dark', 'Neutro oscuro'], ['Main', 'Principal'],
  ['Secondary', 'Secundario'], ['Tertiary', 'Terciario'], ['Accent', 'Acento'], ['Dark', 'Oscuro'], ['Light', 'Claro'],
];
export function localName(name, lang) {
  if (lang !== 'es') return name;
  for (const [en, es] of NAME_ES) if (name.startsWith(en)) return es + name.slice(en.length);
  return name;
}

export const HARMONY_ES = {
  complementary: 'Complementaria', analogous: 'Análoga', 'split-complementary': 'Compl. dividida', triad: 'Tríada',
  square: 'Cuadrada', compound: 'Compuesta', shades: 'Matices', monochromatic: 'Mono',
};
