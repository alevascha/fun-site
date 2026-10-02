// Renders a 1200×630 Open Graph image per page into public/og/ (gitignored).
// Runs before `vite build`; fonts are bundled in scripts/fonts (SIL OFL).
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import { experiments, HOME_META, SITE } from '../src/experiments.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(root, '..', 'public', 'og');
const fontFiles = ['CrimsonPro-Light.ttf', 'HankenGrotesk-Medium.ttf'].map(f => path.join(root, 'fonts', f));

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function wrap(text, maxChars) {
  const lines = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    if ((line + ' ' + word).trim().length > maxChars && line) { lines.push(line); line = word; }
    else line = (line + ' ' + word).trim();
  }
  if (line) lines.push(line);
  return lines;
}

function svg({ title, description, accent, kicker }) {
  const titleLines = wrap(title, 22).slice(0, 2);
  const descLines = wrap(description, 62).slice(0, 2);
  const titleSize = titleLines.length > 1 ? 88 : 104;
  const titleY = 300 - (titleLines.length - 1) * 50;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="o1" cx="0.3" cy="0.3" r="0.7"><stop offset="0" stop-color="#CD57FF"/><stop offset="0.5" stop-color="#8B6CF0"/><stop offset="1" stop-color="#FFCE1F"/></radialGradient>
    <radialGradient id="o2" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${accent}" stop-opacity="0.55"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
    <filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="60"/></filter>
    <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#ffffff" fill-opacity="0.07"/></pattern>
    <clipPath id="card"><rect x="32" y="32" width="1136" height="566" rx="48"/></clipPath>
  </defs>
  <rect width="1200" height="630" fill="#272625"/>
  <g clip-path="url(#card)">
    <rect x="32" y="32" width="1136" height="566" fill="#121212"/>
    <rect x="32" y="32" width="1136" height="566" fill="url(#dots)"/>
    <circle cx="960" cy="640" r="260" fill="url(#o1)" filter="url(#blur)" opacity="0.6"/>
    <circle cx="1040" cy="120" r="260" fill="url(#o2)"/>
  </g>
  <rect x="32.5" y="32.5" width="1135" height="565" rx="47.5" fill="none" stroke="#ffffff" stroke-opacity="0.1"/>
  <circle cx="108" cy="118" r="10" fill="url(#o1)"/>
  <text x="130" y="126" font-family="Hanken Grotesk" font-size="24" fill="#DBDBDB" fill-opacity="0.75">${esc(kicker)}</text>
  ${titleLines.map((l, i) => `<text x="96" y="${titleY + i * (titleSize * 0.98)}" font-family="Crimson Pro" font-size="${titleSize}" letter-spacing="-3" fill="#F7F7F7">${esc(l)}</text>`).join('\n  ')}
  ${descLines.map((l, i) => `<text x="96" y="${430 + i * 40}" font-family="Hanken Grotesk" font-size="28" fill="#DBDBDB" fill-opacity="0.75">${esc(l)}</text>`).join('\n  ')}
  <rect x="96" y="500" width="250" height="52" rx="26" fill="#F7F7F7"/>
  <text x="221" y="534" text-anchor="middle" font-family="Hanken Grotesk" font-size="22" fill="#111011">fun.alevasquez.dev</text>
</svg>`;
}

const pages = [
  { id: 'home', title: SITE.name, description: HOME_META.description, accent: '#CD57FF', kicker: 'Alejandro Vasquez · code playground' },
  ...experiments.filter(e => e.active).map(e => ({ id: e.id, title: e.title, description: e.description, accent: e.accent, kicker: `${SITE.name} · ${e.category}` })),
];

await fs.mkdir(outDir, { recursive: true });
for (const page of pages) {
  const png = new Resvg(svg(page), { font: { fontFiles, loadSystemFonts: false, defaultFontFamily: 'Hanken Grotesk' } }).render().asPng();
  await fs.writeFile(path.join(outDir, `${page.id}.png`), png);
}
console.log(`og: rendered ${pages.length} images → public/og/`);
