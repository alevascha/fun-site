import { hexToRgb, linearToSrgb, rgbToHex, srgbToLinear } from './color';

// Machado, Oliveira & Fernandes (2009) dichromacy matrices at full severity,
// applied in linear RGB. Lower severities interpolate toward identity, which
// is a close approximation of the paper's per-step matrices.
const MATRICES = {
  protanopia: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deuteranopia: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritanopia: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
};

export const VISION_TYPES = [
  { id: 'normal', label: 'Typical vision', short: 'Typical', note: 'Reference — how the palette was designed.',
    es: { label: 'Visión típica', short: 'Típica', note: 'Referencia: cómo se diseñó la paleta.' } },
  { id: 'protanopia', label: 'Protanopia', short: 'Protan', note: 'No red cones. Reds look dark and muddy. ≈1% of men.',
    es: { label: 'Protanopia', short: 'Protan', note: 'Sin conos rojos. Los rojos se ven oscuros y apagados. ≈1% de los hombres.' } },
  { id: 'deuteranopia', label: 'Deuteranopia', short: 'Deutan', note: 'No green cones. Reds and greens merge. ≈1% of men (the -anomaly form is ≈5%).',
    es: { label: 'Deuteranopia', short: 'Deutan', note: 'Sin conos verdes. Rojos y verdes se confunden. ≈1% de los hombres (la forma -anomalía, ≈5%).' } },
  { id: 'tritanopia', label: 'Tritanopia', short: 'Tritan', note: 'No blue cones. Blues/greens and yellows/pinks blur. Very rare.',
    es: { label: 'Tritanopia', short: 'Tritan', note: 'Sin conos azules. Se confunden azules/verdes y amarillos/rosas. Muy rara.' } },
  { id: 'achromatopsia', label: 'Achromatopsia', short: 'Achroma', note: 'No color at all — only lightness is left. ≈1 in 30,000.',
    es: { label: 'Acromatopsia', short: 'Acroma', note: 'Sin color: solo queda la luminosidad. ≈1 de cada 30.000.' } },
];

export function simulateRgb(rgb, type, severity = 1) {
  if (type === 'normal') return rgb;
  const lin = [srgbToLinear(rgb.r), srgbToLinear(rgb.g), srgbToLinear(rgb.b)];
  let out;
  if (type === 'achromatopsia') {
    const y = 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
    out = lin.map(c => c + (y - c) * severity);
  } else {
    const m = MATRICES[type];
    out = m.map((row, i) => {
      const full = row[0] * lin[0] + row[1] * lin[1] + row[2] * lin[2];
      return lin[i] + (full - lin[i]) * severity;
    });
  }
  return { r: linearToSrgb(out[0]), g: linearToSrgb(out[1]), b: linearToSrgb(out[2]) };
}

export function simulateHex(hex, type, severity = 1) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const s = simulateRgb(rgb, type, severity);
  return rgbToHex(s.r, s.g, s.b);
}
