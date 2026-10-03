// Re-composes the portfolio's project images in the site's style.
//
// Each project's original Behance slices are placed in rounded frames with a
// soft shadow on a transparent canvas, so they sit cleanly on the
// Framer cards in both light and dark mode. Rendered with headless Chrome.
//
//   node scripts/project-art/generate.mjs [slug]   → scripts/project-art/out/
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROJECTS } from './projects.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, 'out');
const TMP = join(here, '.tmp');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const img = id => `https://framerusercontent.com/images/${id}`;

// Slot → canvas size and layout. Slots match the CMS image fields:
// 0 hero banner, 1–2 card images (also gallery), 3–5 gallery.
const SLOTS = [
  { name: 'hero', w: 2000, h: 1125, layout: 'hero' },
  { name: 'card-1', w: 1600, h: 1000, layout: 'single' },
  { name: 'card-2', w: 1600, h: 1000, layout: 'pair' },
  { name: 'gallery-1', w: 1600, h: 1000, layout: 'single' },
  { name: 'gallery-2', w: 1600, h: 1000, layout: 'single' },
  { name: 'gallery-3', w: 1600, h: 1000, layout: 'single' },
];

// A frame sized to the image's own aspect ratio (never cropped), fitted
// inside a box given in px and centered there.
function frame(src, box, extra = '') {
  const pad = 14;
  return `<div class="box" style="left:${box.x}px;top:${box.y}px;width:${box.w}px;height:${box.h}px;${extra}">
    <div class="frame"><img src="${src}" style="max-width:${box.w - pad * 2}px;max-height:${box.h - pad * 2}px"></div></div>`;
}

function page(p, slot, i) {
  const a = p.accent;
  const s = p.images.map(img);
  const W = slot.w, H = slot.h;
  const B = (x, y, w, h) => ({ x: Math.round(W * x), y: Math.round(H * y), w: Math.round(W * w), h: Math.round(H * h) });
  let body = '';
  if (slot.layout === 'hero') {
    body = `
      ${frame(s[1], B(0.5, 0.36, 0.45, 0.56), 'transform:rotate(3deg);z-index:1;opacity:.96;align-items:flex-end;justify-content:flex-end')}
      ${frame(s[0], B(0.06, 0.08, 0.64, 0.72), 'z-index:2;align-items:flex-start;justify-content:flex-start')}
      <div class="chip" style="left:7%;bottom:7%"><i></i>${p.label}</div>`;
  } else if (slot.layout === 'pair') {
    body = `
      ${frame(s[3], B(0.42, 0.06, 0.52, 0.62), 'transform:rotate(2.5deg);opacity:.95;align-items:flex-start;justify-content:flex-end')}
      ${frame(s[2], B(0.06, 0.3, 0.6, 0.64), 'z-index:2;align-items:flex-end;justify-content:flex-start')}`;
  } else {
    body = frame(s[i], B(0.06, 0.06, 0.88, 0.88));
  }
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@500;600&display=swap" rel="stylesheet">
<style>
  html,body{margin:0;width:${W}px;height:${H}px;background:transparent;overflow:hidden}
  .stage{position:relative;width:100%;height:100%}
  .box{position:absolute;display:flex;align-items:center;justify-content:center}
  .frame{display:flex;border-radius:30px;padding:14px;background:linear-gradient(160deg,rgba(255,255,255,.22),rgba(255,255,255,.06));
    box-shadow:0 0 0 1.5px rgba(255,255,255,.16) inset, 0 40px 70px -36px rgba(10,8,14,.5)}
  .frame img{display:block;width:auto;height:auto;border-radius:18px;box-shadow:0 0 0 1px rgba(0,0,0,.08)}
  .chip{position:absolute;z-index:3;display:flex;align-items:center;gap:14px;padding:16px 28px;border-radius:999px;
    font:600 30px/1 'Hanken Grotesk',system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#f7f7f7;
    background:rgba(29,28,27,.82);box-shadow:0 0 0 1.5px rgba(255,255,255,.12) inset, 0 20px 40px -20px rgba(0,0,0,.6)}
  .chip i{width:16px;height:16px;border-radius:50%;background:${p.gradient || a}}
</style></head><body><div class="stage">${body}</div></body></html>`;
}

function render(html, w, h, file) {
  const src = join(TMP, 'page.html');
  writeFileSync(src, html);
  execFileSync(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--default-background-color=00000000', `--window-size=${w},${h}`,
    '--virtual-time-budget=8000', `--screenshot=${file}`, `file://${src}`,
  ], { stdio: 'ignore' });
}

const only = process.argv[2];
mkdirSync(TMP, { recursive: true });
for (const p of PROJECTS.filter(p => !only || p.slug === only)) {
  const dir = join(OUT, p.slug);
  mkdirSync(dir, { recursive: true });
  SLOTS.forEach((slot, i) => {
    const file = join(dir, `${i}-${slot.name}.png`);
    render(page(p, slot, i), slot.w, slot.h, file);
    console.log('✓', p.slug, slot.name);
  });
}
rmSync(TMP, { recursive: true, force: true });
