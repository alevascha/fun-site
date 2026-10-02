import { deltaE, rgbToHex } from './color';

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const dist2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;

/* Dominant colors via k-means (k-means++ seeding, fixed seed so the same
   image always gives the same palette). Expects ImageData from a small,
   downscaled canvas. Near-duplicate clusters are merged. */
export function extractPalette(imageData, k = 6) {
  const { data } = imageData;
  const pixels = [];
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    pixels.push([data[i], data[i + 1], data[i + 2]]);
  }
  if (!pixels.length) return [];
  const rand = mulberry32(42);

  const centers = [pixels[Math.floor(rand() * pixels.length)]];
  const d = new Float64Array(pixels.length);
  while (centers.length < Math.min(k, pixels.length)) {
    let sum = 0;
    for (let i = 0; i < pixels.length; i++) {
      let best = Infinity;
      for (const c of centers) best = Math.min(best, dist2(pixels[i], c));
      d[i] = best; sum += best;
    }
    if (sum === 0) break;
    let r = rand() * sum, idx = 0;
    while (r > d[idx] && idx < pixels.length - 1) { r -= d[idx]; idx++; }
    centers.push(pixels[idx]);
  }

  const assign = new Int32Array(pixels.length);
  let means = centers.map(c => c.slice());
  for (let iter = 0; iter < 16; iter++) {
    const sums = means.map(() => [0, 0, 0, 0]);
    let moved = 0;
    for (let i = 0; i < pixels.length; i++) {
      let best = 0, bestD = Infinity;
      for (let c = 0; c < means.length; c++) {
        const dd = dist2(pixels[i], means[c]);
        if (dd < bestD) { bestD = dd; best = c; }
      }
      if (assign[i] !== best) moved++;
      assign[i] = best;
      const s = sums[best];
      s[0] += pixels[i][0]; s[1] += pixels[i][1]; s[2] += pixels[i][2]; s[3]++;
    }
    means = sums.map((s, c) => (s[3] ? [s[0] / s[3], s[1] / s[3], s[2] / s[3]] : means[c]));
    if (iter > 0 && moved === 0) break;
  }

  const counts = new Array(means.length).fill(0);
  for (let i = 0; i < assign.length; i++) counts[assign[i]]++;

  let clusters = means
    .map((m, i) => ({ rgb: { r: Math.round(m[0]), g: Math.round(m[1]), b: Math.round(m[2]) }, count: counts[i] }))
    .filter(c => c.count > 0)
    .sort((a, b) => b.count - a.count);

  const merged = [];
  for (const c of clusters) {
    const twin = merged.find(m => deltaE(m.rgb, c.rgb) < 6);
    if (twin) twin.count += c.count; else merged.push({ ...c });
  }
  clusters = merged;

  const total = pixels.length;
  return clusters.map(c => ({ ...c, hex: rgbToHex(c.rgb.r, c.rgb.g, c.rgb.b), share: c.count / total }));
}
