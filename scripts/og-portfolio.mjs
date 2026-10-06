// Social preview images (1200×630) for alevasquez.dev, in the Fun Lab card
// style: dark rounded panel, dot grid, glow, serif title and a URL pill.
// Case studies show their own hero image on the right.
//   node scripts/og-portfolio.mjs   →   framer/og/*.png
// Upload each PNG in Framer: page settings → Social preview, or the
// "Social Image" field of each Project CMS item. Also writes the favicons
// (framer/logo/) for Site Settings → Favicon.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const root = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(root, '..', 'framer', 'og', 'src');
const outDir = path.join(root, '..', 'framer', 'og');
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
const dataUri = async f => `data:image/jpeg;base64,${(await fs.readFile(path.join(src, f))).toString('base64')}`;

const frame = (accent, inner) => `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="o1" cx="0.3" cy="0.3" r="0.7"><stop offset="0" stop-color="#CD57FF"/><stop offset="0.5" stop-color="#8B6CF0"/><stop offset="1" stop-color="#FFCE1F"/></radialGradient>
    <radialGradient id="o2" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${accent}" stop-opacity="0.5"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
    <filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="60"/></filter>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="24" stdDeviation="24" flood-color="#000" flood-opacity="0.55"/></filter>
    <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#ffffff" fill-opacity="0.07"/></pattern>
    <clipPath id="card"><rect x="32" y="32" width="1136" height="566" rx="48"/></clipPath>
  </defs>
  <rect width="1200" height="630" fill="#272625"/>
  <g clip-path="url(#card)">
    <rect x="32" y="32" width="1136" height="566" fill="#121212"/>
    <rect x="32" y="32" width="1136" height="566" fill="url(#dots)"/>
    <circle cx="960" cy="660" r="260" fill="url(#o1)" filter="url(#blur)" opacity="0.55"/>
    <circle cx="1040" cy="110" r="280" fill="url(#o2)"/>
  </g>
  <rect x="32.5" y="32.5" width="1135" height="565" rx="47.5" fill="none" stroke="#ffffff" stroke-opacity="0.1"/>
  ${inner}
</svg>`;

const kickerEl = k => `<circle cx="108" cy="118" r="10" fill="url(#o1)"/>
  <text x="130" y="126" font-family="Hanken Grotesk" font-size="24" fill="#DBDBDB" fill-opacity="0.75">${esc(k)}</text>`;
// The AV mark on its gradient circle (same as framer/logo/av-tile.svg).
const AV_PATHS = '<path d="M497 640H359L248 320 122 640H0L256 0z"/><path d="M292.43 640H200.8L248 522z"/><path d="M335 0h138l111 320L710 0h122L576 640z"/>';
const logo = (cx, cy, r) => `<defs><radialGradient id="lg" cx="25%" cy="100%" r="100%"><stop offset="0" stop-color="#CD57FF"/><stop offset="1" stop-color="#FFCE1F"/></radialGradient></defs>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#lg)"/>
  <g transform="translate(${cx - r * 0.469} ${cy - r * 0.359}) scale(${(r * 0.938 / 832).toFixed(5)})" fill="#111011">${AV_PATHS}</g>`;
const pill = (x, y) => `<rect x="${x}" y="${y}" width="250" height="56" rx="28" fill="#F7F7F7"/>
  ${logo(x + 28, y + 28, 20)}
  <text x="${x + 58}" y="${y + 36}" font-family="Hanken Grotesk" font-size="22" fill="#111011">alevasquez.dev</text>`;

// Left text column + an image panel on the right.
function split({ kicker, title, description, accent, image, round = false }) {
  const titleLines = wrap(title, 16).slice(0, 3);
  const size = titleLines.length > 2 ? 58 : titleLines.length > 1 ? 66 : 76;
  const descLines = wrap(description, 34).slice(0, 3);
  const top = 200;
  const descTop = top + (titleLines.length - 1) * size * 0.98 + 58;
  const img = round
    ? `<g filter="url(#shadow)"><circle cx="890" cy="315" r="170" fill="#1d1c1b"/></g>
  <clipPath id="pic"><circle cx="890" cy="315" r="166"/></clipPath>
  <image href="${image}" x="724" y="149" width="332" height="332" preserveAspectRatio="xMidYMid slice" clip-path="url(#pic)"/>
  <circle cx="890" cy="315" r="168" fill="none" stroke="url(#o1)" stroke-width="4"/>`
    : `<g filter="url(#shadow)"><rect x="626" y="166" width="500" height="281" rx="22" fill="#1d1c1b"/></g>
  <clipPath id="pic"><rect x="626" y="166" width="500" height="281" rx="22"/></clipPath>
  <image href="${image}" x="626" y="166" width="500" height="281" preserveAspectRatio="xMidYMid slice" clip-path="url(#pic)"/>
  <rect x="626.5" y="166.5" width="499" height="280" rx="21.5" fill="none" stroke="#ffffff" stroke-opacity="0.14"/>`;
  return frame(accent, `${kickerEl(kicker)}
  ${titleLines.map((l, i) => `<text x="96" y="${top + i * size * 0.98}" font-family="Crimson Pro" font-size="${size}" letter-spacing="-2" fill="#F7F7F7">${esc(l)}</text>`).join('\n  ')}
  ${descLines.map((l, i) => `<text x="96" y="${descTop + i * 34}" font-family="Hanken Grotesk" font-size="24" fill="#DBDBDB" fill-opacity="0.75">${esc(l)}</text>`).join('\n  ')}
  ${img}
  ${pill(96, 500)}`);
}

// Stacked previews for the projects index.
function stack({ kicker, title, description, accent, images }) {
  const titleLines = wrap(title, 16).slice(0, 2);
  const descLines = wrap(description, 34).slice(0, 3);
  const cards = images.map((im, i) => {
    const rot = [-7, 4, -1][i], x = [640, 760, 700][i], y = [150, 196, 250][i];
    return `<g transform="rotate(${rot} ${x + 190} ${y + 107})"><g filter="url(#shadow)"><rect x="${x}" y="${y}" width="380" height="214" rx="18" fill="#1d1c1b"/></g>
    <clipPath id="s${i}"><rect x="${x}" y="${y}" width="380" height="214" rx="18"/></clipPath>
    <image href="${im}" x="${x}" y="${y}" width="380" height="214" preserveAspectRatio="xMidYMid slice" clip-path="url(#s${i})"/>
    <rect x="${x + 0.5}" y="${y + 0.5}" width="379" height="213" rx="17.5" fill="none" stroke="#ffffff" stroke-opacity="0.14"/></g>`;
  }).join('\n  ');
  return frame(accent, `${kickerEl(kicker)}
  ${titleLines.map((l, i) => `<text x="96" y="${210 + i * 74}" font-family="Crimson Pro" font-size="76" letter-spacing="-2" fill="#F7F7F7">${esc(l)}</text>`).join('\n  ')}
  ${descLines.map((l, i) => `<text x="96" y="${290 + (titleLines.length - 1) * 74 + i * 34}" font-family="Hanken Grotesk" font-size="24" fill="#DBDBDB" fill-opacity="0.75">${esc(l)}</text>`).join('\n  ')}
  ${cards}
  ${pill(96, 500)}`);
}

const PROJECTS = [
  { id: 'dollar-general', title: 'Dollar General', kicker: 'Case study · Fortune 500 retail', description: 'Design system architecture and the AEM Cloud migration.', accent: '#FFCE1F' },
  { id: 'mystrengthbook', title: 'MyStrengthBook', kicker: 'Case study · Fitness SaaS', description: 'Art direction, UI/UX and a white-label design system.', accent: '#CD57FF' },
  { id: 'xlow-branding', title: 'xYlow', kicker: 'Case study · Branding', description: 'Brand identity for an engineering talent platform.', accent: '#7CC4FF' },
  { id: 'valora-medical-group---webflow-management', title: 'Valora Medical Group', kicker: 'Case study · Healthcare', description: 'Webflow site management, design and content.', accent: '#3DDC84' },
  { id: 'afp-modelo', title: 'AFP Modelo', kicker: 'Case study · Fintech', description: 'Design system architecture and product design.', accent: '#3DDC84' },
  { id: 'thors-training-app', title: 'Thor’s Training App', kicker: 'Case study · Fitness', description: 'White-label website design for a training app.', accent: '#FF7A7A' },
  { id: 'huntela', title: 'Huntela', kicker: 'Case study · Sales intelligence', description: 'Product design for an internal research web app.', accent: '#8B6CF0' },
  { id: 'sanza-energy', title: 'Sanza Energy', kicker: 'Case study · Energy', description: 'A sales web app for energy plans, plus the company website.', accent: '#FFCE1F' },
];

const render = async (name, svgText) => {
  const png = new Resvg(svgText, { font: { fontFiles, loadSystemFonts: false }, fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  await fs.writeFile(path.join(outDir, `${name}.png`), png);
};

await fs.mkdir(outDir, { recursive: true });
await render('home', split({ kicker: 'Design Systems Architect · UX & AI Interface Engineer', title: 'Alejandro Vasquez', description: 'Bridging design and engineering for 8+ years. Systems that cut development time by 50%.', accent: '#CD57FF', image: await dataUri('ale.jpg'), round: true }));
await render('project', stack({ kicker: 'Alejandro Vasquez · Selected work', title: 'Selected work', description: 'Design systems, product design and UX engineering for retail, fintech, health and SaaS.', accent: '#8B6CF0', images: await Promise.all(['afp-modelo.jpg', 'mystrengthbook.jpg', 'dollar-general.jpg'].map(dataUri)) }));
for (const p of PROJECTS) await render(`project-${p.id}`, split({ ...p, image: await dataUri(`${p.id}.jpg`) }));
console.log(`og-portfolio: rendered ${PROJECTS.length + 2} images → framer/og/`);

// Favicons for Framer → Site Settings: the round tile, plus a full-bleed square
// for iOS (it rounds the corners itself and shows black behind transparency).
const logoDir = path.join(root, '..', 'framer', 'logo');
const tile = await fs.readFile(path.join(logoDir, 'av-tile.svg'), 'utf8');
const square = tile.replace(/<circle [^>]*\/>/, '<rect width="640" height="640" fill="url(#g)"/>');
const png = (svgText, size) => new Resvg(svgText, { fitTo: { mode: 'width', value: size } }).render().asPng();
for (const [name, svgText, size] of [['favicon-32', tile, 32], ['favicon-192', tile, 192], ['favicon-512', tile, 512], ['apple-touch-icon', square, 180]])
  await fs.writeFile(path.join(logoDir, `${name}.png`), png(svgText, size));
await fs.copyFile(path.join(logoDir, 'av-tile.svg'), path.join(logoDir, 'favicon.svg'));
console.log('og-portfolio: favicons → framer/logo/');
