/* Trims empty edges from an image: transparent pixels (alpha ≤ threshold)
   and, optionally, a solid background matching the top-left pixel.
   Returns a PNG blob plus the crop rectangle. Runs on a canvas — the file
   never leaves the browser. */
export async function trimImage(file, { alphaThreshold = 0, padding = 0, trimSolid = false, tolerance = 12 } = {}) {
  const bitmap = await createImageBitmap(file);
  const { width: w, height: h } = bitmap;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(bitmap, 0, 0);
  const { data } = ctx.getImageData(0, 0, w, h);

  const br = data[0], bg = data[1], bb = data[2], ba = data[3];
  const tol2 = tolerance * tolerance * 3;
  const empty = i => {
    const a = data[i + 3];
    if (a <= alphaThreshold) return true;
    if (!trimSolid || ba <= alphaThreshold) return false;
    const dr = data[i] - br, dg = data[i + 1] - bg, db = data[i + 2] - bb, da = a - ba;
    return dr * dr + dg * dg + db * db + da * da <= tol2;
  };
  const rowEmpty = y => { for (let x = 0, i = y * w * 4; x < w; x++, i += 4) if (!empty(i)) return false; return true; };
  const colEmpty = (x, y0, y1) => { for (let y = y0; y <= y1; y++) if (!empty((y * w + x) * 4)) return false; return true; };

  let top = 0; while (top < h && rowEmpty(top)) top++;
  if (top === h) return { empty: true, origW: w, origH: h };
  let bottom = h - 1; while (bottom > top && rowEmpty(bottom)) bottom--;
  let left = 0; while (left < w && colEmpty(left, top, bottom)) left++;
  let right = w - 1; while (right > left && colEmpty(right, top, bottom)) right--;

  const cw = right - left + 1, ch = bottom - top + 1;
  const out = document.createElement('canvas');
  out.width = cw + padding * 2; out.height = ch + padding * 2;
  out.getContext('2d').drawImage(canvas, left, top, cw, ch, padding, padding, cw, ch);
  const blob = await new Promise(res => out.toBlob(res, 'image/png'));
  bitmap.close?.();
  return { blob, width: out.width, height: out.height, origW: w, origH: h, rect: { left, top, width: cw, height: ch } };
}

/* Procedural sample images: a shape floating in lots of transparent space. */
export async function makeSamples() {
  const specs = [
    { w: 900, h: 700, draw: ctx => { ctx.fillStyle = '#CD57FF'; ctx.beginPath(); ctx.arc(420, 330, 120, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#FFCE1F'; ctx.beginPath(); ctx.arc(510, 300, 60, 0, Math.PI * 2); ctx.fill(); } },
    { w: 1200, h: 1200, draw: ctx => { ctx.fillStyle = '#8B6CF0'; ctx.font = '300 220px Georgia'; ctx.fillText('Lab', 380, 700); } },
    { w: 800, h: 600, draw: ctx => { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 800, 600); ctx.fillStyle = '#272625'; ctx.beginPath(); ctx.roundRect(260, 180, 280, 200, 40); ctx.fill(); } },
  ];
  const names = ['orbs.png', 'wordmark.png', 'card-on-white.png'];
  return Promise.all(specs.map(async (s, i) => {
    const c = document.createElement('canvas');
    c.width = s.w; c.height = s.h;
    s.draw(c.getContext('2d'));
    const blob = await new Promise(res => c.toBlob(res, 'image/png'));
    return new File([blob], names[i], { type: 'image/png' });
  }));
}
