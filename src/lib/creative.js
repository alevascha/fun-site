import { bestTextColor, hexToRgb } from './color';

/* One creative, laid out for any canvas size. The same draw function renders
   the on-screen previews and the full-resolution PNG exports. */

export const SIZES = [
  { id: 'ig-post', group: 'Social', name: 'Instagram post', w: 1080, h: 1080, safe: [{ inset: 0.05 }] },
  { id: 'ig-story', group: 'Social', name: 'Story / Reel', w: 1080, h: 1920, safe: [{ top: 0, height: 0.14, label: 'Profile & close' }, { top: 0.8, height: 0.2, label: 'Reply bar & CTA' }] },
  { id: 'li-link', group: 'Social', name: 'LinkedIn / Facebook link', w: 1200, h: 628, safe: [{ inset: 0.04 }] },
  { id: 'x-post', group: 'Social', name: 'X post', w: 1600, h: 900, safe: [{ inset: 0.04 }] },
  { id: 'yt-thumb', group: 'Social', name: 'YouTube thumbnail', w: 1280, h: 720, safe: [{ left: 0.8, top: 0.86, width: 0.2, height: 0.14, label: 'Timestamp' }] },
  { id: 'pin', group: 'Social', name: 'Pinterest pin', w: 1000, h: 1500, safe: [{ inset: 0.05 }] },
  { id: 'mrec', group: 'Display ads', name: 'Medium rectangle', w: 300, h: 250, safe: [] },
  { id: 'leader', group: 'Display ads', name: 'Leaderboard', w: 728, h: 90, safe: [] },
  { id: 'billboard', group: 'Display ads', name: 'Billboard', w: 970, h: 250, safe: [] },
  { id: 'half', group: 'Display ads', name: 'Half page', w: 300, h: 600, safe: [] },
  { id: 'sky', group: 'Display ads', name: 'Wide skyscraper', w: 160, h: 600, safe: [] },
  { id: 'mobile-banner', group: 'Display ads', name: 'Mobile banner', w: 320, h: 50, safe: [] },
];

export async function ensureFonts() {
  if (!document.fonts) return;
  await Promise.all([
    document.fonts.load('300 64px "Crimson Pro"'),
    document.fonts.load('400 32px "Inter"'),
    document.fonts.load('600 32px "Inter"'),
  ]).catch(() => {});
}

function wrap(ctx, text, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = w; } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

/* Largest font size (≤ max) whose wrapped text fits in maxLines × maxWidth. */
function fit(ctx, text, font, maxSize, minSize, maxWidth, maxLines) {
  for (let size = maxSize; size >= minSize; size -= Math.max(1, size * 0.04)) {
    ctx.font = font(size);
    const lines = wrap(ctx, text, maxWidth);
    if (lines.length <= maxLines && lines.every(l => ctx.measureText(l).width <= maxWidth)) return { size, lines };
  }
  ctx.font = font(minSize);
  return { size: minSize, lines: wrap(ctx, text, maxWidth).slice(0, maxLines) };
}

function drawCover(ctx, img, x, y, w, h, focal) {
  const scale = Math.max(w / img.width, h / img.height);
  const sw = w / scale, sh = h / scale;
  const sx = Math.min(img.width - sw, Math.max(0, focal.x * img.width - sw / 2));
  const sy = Math.min(img.height - sh, Math.max(0, focal.y * img.height - sh / 2));
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function rounded(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, Math.min(r, h / 2, w / 2));
}

function drawCta(ctx, text, x, y, size, color, align = 'left') {
  ctx.font = `600 ${size}px Inter, sans-serif`;
  const padX = size * 1.1, h = size * 2.3;
  const w = ctx.measureText(text).width + padX * 2;
  const left = align === 'right' ? x - w : x;
  rounded(ctx, left, y, w, h, h / 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.fillStyle = bestTextColor(hexToRgb(color));
  ctx.textBaseline = 'middle';
  ctx.fillText(text, left + padX, y + h / 2 + size * 0.04);
  ctx.textBaseline = 'alphabetic';
  return { w, h };
}

export function drawCreative(canvas, size, data, scale = 1) {
  const W = size.w, H = size.h;
  canvas.width = Math.round(W * scale);
  canvas.height = Math.round(H * scale);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  const { headline, sub, cta, brand, accent, bg, image, focal, logo } = data;
  const ink = bestTextColor(hexToRgb(bg)) === '#000000' ? '#111011' : '#F7F7F7';
  const ratio = W / H;
  const unit = Math.min(W, H);

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const headFont = s => `300 ${s}px "Crimson Pro", Georgia, serif`;
  const bodyFont = s => `400 ${s}px Inter, sans-serif`;

  if (ratio >= 3) {
    // ---- Banner: image strip left, headline middle, CTA right ----
    const imgW = image ? H * 1.4 : 0;
    if (image) drawCover(ctx, image, 0, 0, imgW, H, focal);
    const g = ctx.createLinearGradient(imgW, 0, W, 0);
    g.addColorStop(0, bg); g.addColorStop(1, brand);
    ctx.globalAlpha = 0.25; ctx.fillStyle = g; ctx.fillRect(imgW, 0, W - imgW, H); ctx.globalAlpha = 1;
    const pad = H * 0.22;
    const ctaSize = Math.max(9, Math.min(H * 0.18, 22));
    ctx.font = `600 ${ctaSize}px Inter, sans-serif`;
    const ctaW = ctx.measureText(cta).width + ctaSize * 2.2;
    const textW = W - imgW - ctaW - pad * 3;
    const tiny = H < 70;
    const head = fit(ctx, headline, headFont, H * (tiny ? 0.42 : 0.3), 8, textW, tiny ? 1 : 2);
    ctx.fillStyle = ink;
    const blockH = head.lines.length * head.size * 1.05;
    let y = (H - blockH) / 2 + head.size * 0.85;
    ctx.font = headFont(head.size);
    head.lines.forEach(l => { ctx.fillText(l, imgW + pad, y); y += head.size * 1.05; });
    drawCta(ctx, cta, W - pad, (H - ctaSize * 2.3) / 2, ctaSize, brand, 'right');
    return;
  }

  if (ratio <= 0.62) {
    // ---- Tall: image on top, text block below ----
    const safeTop = size.id === 'ig-story' ? H * 0.14 : 0;
    const safeBottom = size.id === 'ig-story' ? H * 0.2 : 0;
    const imgH = image ? H * 0.5 : H * 0.12;
    if (image) {
      drawCover(ctx, image, 0, 0, W, imgH, focal);
      const fade = ctx.createLinearGradient(0, imgH * 0.6, 0, imgH);
      fade.addColorStop(0, 'rgba(0,0,0,0)'); fade.addColorStop(1, bg);
      ctx.fillStyle = fade; ctx.fillRect(0, imgH * 0.6, W, imgH * 0.4 + 1);
    }
    const pad = W * 0.08;
    let y = Math.max(imgH + unit * 0.06, safeTop + unit * 0.06);
    ctx.fillStyle = brand;
    ctx.font = `600 ${unit * 0.055}px Inter, sans-serif`;
    ctx.fillText(logo.toUpperCase(), pad, y);
    y += unit * 0.07;
    const maxBottom = H - safeBottom - unit * 0.06;
    const ctaSize = unit * 0.055;
    const head = fit(ctx, headline, headFont, unit * 0.16, 10, W - pad * 2, 3);
    ctx.fillStyle = ink;
    ctx.font = headFont(head.size);
    head.lines.forEach(l => { y += head.size * 1.02; ctx.fillText(l, pad, y); });
    if (sub && W >= 250) {
      const s = fit(ctx, sub, bodyFont, unit * 0.055, 8, W - pad * 2, 3);
      ctx.font = bodyFont(s.size);
      ctx.globalAlpha = 0.75;
      y += s.size * 0.6;
      s.lines.forEach(l => { y += s.size * 1.4; ctx.fillText(l, pad, y); });
      ctx.globalAlpha = 1;
    }
    drawCta(ctx, cta, pad, Math.min(maxBottom - ctaSize * 2.3, y + unit * 0.08), ctaSize, brand);
    return;
  }

  // ---- Square / landscape: full-bleed image, text bottom-left over a scrim ----
  if (image) {
    drawCover(ctx, image, 0, 0, W, H, focal);
    const scrim = ctx.createLinearGradient(0, H * 0.25, 0, H);
    scrim.addColorStop(0, 'rgba(0,0,0,0)');
    scrim.addColorStop(1, bg);
    ctx.fillStyle = scrim;
    ctx.fillRect(0, 0, W, H);
  } else {
    const glow = ctx.createRadialGradient(W * 0.85, H * 0.1, 0, W * 0.85, H * 0.1, unit * 0.9);
    glow.addColorStop(0, brand); glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = 0.6; ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
  }
  const pad = unit * 0.08;
  const yt = size.id === 'yt-thumb';
  const textInk = image ? (bestTextColor(hexToRgb(bg)) === '#000000' ? '#111011' : '#FFFFFF') : ink;

  ctx.fillStyle = accent;
  ctx.font = `600 ${unit * 0.04}px Inter, sans-serif`;
  ctx.fillText(logo.toUpperCase(), pad, pad + unit * 0.03);

  const ctaSize = unit * 0.04;
  const head = fit(ctx, headline, headFont, unit * (yt ? 0.16 : 0.12), 10, W * (yt ? 0.7 : 0.78) - pad, 3);
  const subFit = sub && unit >= 220 ? fit(ctx, sub, bodyFont, unit * 0.038, 8, W * 0.7, 2) : null;
  const blockH = head.lines.length * head.size * 1.02 + (subFit ? subFit.lines.length * subFit.size * 1.45 + subFit.size : 0) + ctaSize * 2.3 + unit * 0.05;
  let y = H - pad - blockH;
  ctx.fillStyle = textInk;
  ctx.font = headFont(head.size);
  head.lines.forEach(l => { y += head.size * 1.02; ctx.fillText(l, pad, y); });
  if (subFit) {
    ctx.font = bodyFont(subFit.size);
    ctx.globalAlpha = 0.85;
    y += subFit.size * 0.5;
    subFit.lines.forEach(l => { y += subFit.size * 1.45; ctx.fillText(l, pad, y); });
    ctx.globalAlpha = 1;
  }
  drawCta(ctx, cta, pad, y + unit * 0.04, ctaSize, brand);
}

/* A procedural "photo" so the tool works before anyone uploads anything. */
export function sampleImage() {
  const c = document.createElement('canvas');
  c.width = 1600; c.height = 1200;
  const ctx = c.getContext('2d');
  const sky = ctx.createLinearGradient(0, 0, 0, 1200);
  sky.addColorStop(0, '#2B1A4F'); sky.addColorStop(0.5, '#CD57FF'); sky.addColorStop(0.8, '#FFB36B'); sky.addColorStop(1, '#FFCE1F');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, 1600, 1200);
  ctx.fillStyle = '#FFF3C4'; ctx.beginPath(); ctx.arc(1050, 760, 150, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3B2366'; ctx.beginPath(); ctx.moveTo(0, 860);
  for (let x = 0; x <= 1600; x += 50) ctx.lineTo(x, 840 + Math.sin(x / 140) * 60);
  ctx.lineTo(1600, 1200); ctx.lineTo(0, 1200); ctx.fill();
  ctx.fillStyle = '#1B1230'; ctx.beginPath(); ctx.moveTo(0, 1000);
  for (let x = 0; x <= 1600; x += 50) ctx.lineTo(x, 990 + Math.cos(x / 100) * 40);
  ctx.lineTo(1600, 1200); ctx.lineTo(0, 1200); ctx.fill();
  return c;
}
