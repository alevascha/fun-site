// YouTube thumbnail (1280×720) for the Fun Lab plugins demo video, in the
// same style as the social images (scripts/og-portfolio.mjs): charcoal
// background, dot grid, brand glow, Crimson Pro title.
//   node scripts/yt-thumbnail.mjs   →   ../fun-lab-plugins/docs/demo-thumbnail.png
// Change the texts in TEXT below and run it again.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const root = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(root, '..', '..', 'fun-lab-plugins', 'docs', 'demo-thumbnail.png');
const fontFiles = ['CrimsonPro-Light.ttf', 'Inter-Medium.ttf'].map(f => path.join(root, 'fonts', f));

const TEXT = {
  kicker: "Ale's Fun Lab",
  title: ['4 Figma', 'plugins'],
  sub: ['Accessibility and design-system', 'tools, right inside Figma'],
  url: 'fun.alevasquez.dev/pro',
};

const W = 1280, H = 720;
const SERIF = "'Crimson Pro'", SANS = "'Inter'";
const check = (x, y, c) => `<path d="M${x} ${y + 7} l6 6 l12 -13" fill="none" stroke="${c}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`;

// One plugin card: dark surface, label, and a small illustration.
const card = (x, y, label, art) => `
  <g transform="translate(${x} ${y})" filter="url(#shadow)">
    <rect width="300" height="252" rx="32" fill="#1D1C1B"/>
    <rect width="300" height="252" rx="32" fill="none" stroke="#ffffff" stroke-opacity="0.08"/>
    ${art}
    <text x="24" y="226" font-family="${SANS}" font-size="21" fill="#F7F7F7" fill-opacity="0.82">${label}</text>
  </g>`;

const contrastArt = `
  <rect x="24" y="24" width="252" height="132" rx="20" fill="#F7F4F2"/>
  <text x="48" y="118" font-family="${SERIF}" font-size="84" fill="#111011">Aa</text>
  <rect x="152" y="58" width="104" height="44" rx="22" fill="#3DDC84" fill-opacity="0.18"/>
  ${check(166, 69, '#3DDC84')}
  <text x="198" y="88" font-family="${SANS}" font-size="20" fill="#3DDC84">AA</text>
  <text x="24" y="190" font-family="${SANS}" font-size="20" fill="#F7F7F7" fill-opacity="0.55">7.2 : 1</text>`;

const SW = ['#F3DDFF', '#E4B0FF', '#CD57FF', '#9A2FD0', '#5E1A86'];
const paletteArt = `
  ${SW.map((c, i) => `<rect x="${24 + i * 51}" y="24" width="45" height="132" rx="14" fill="${c}"/>`).join('')}
  <circle cx="46" cy="186" r="9" fill="#FFCE1F"/><circle cx="70" cy="186" r="9" fill="#FF7AB6"/><circle cx="94" cy="186" r="9" fill="#8B6CF0"/>`;

const typeArt = `
  <text x="24" y="104" font-family="${SERIF}" font-size="88" fill="#F7F7F7">Aa</text>
  <text x="142" y="104" font-family="${SERIF}" font-size="58" fill="#F7F7F7" fill-opacity="0.8">Aa</text>
  <text x="222" y="104" font-family="${SERIF}" font-size="38" fill="#F7F7F7" fill-opacity="0.6">Aa</text>
  <rect x="24" y="136" width="252" height="10" rx="5" fill="url(#bar)"/>
  <text x="24" y="190" font-family="${SANS}" font-size="20" fill="#F7F7F7" fill-opacity="0.55">clamp() · tokens</text>`;

// The same "Paid" (green) and "Failed" (red) pair as seen with normal vision
// and with deuteranopia, where they nearly match.
const cbArt = `
  <g font-family="${SANS}" font-size="17">
    <rect x="24" y="30" width="118" height="44" rx="22" fill="#2FBF71"/><text x="62" y="58" fill="#0B2A18">Paid</text>
    <rect x="158" y="30" width="118" height="44" rx="22" fill="#E5484D"/><text x="186" y="58" fill="#2A0B0C">Failed</text>
    <rect x="24" y="100" width="118" height="44" rx="22" fill="#A39A55"/><text x="62" y="128" fill="#1E1C0E">Paid</text>
    <rect x="158" y="100" width="118" height="44" rx="22" fill="#8F8754"/><text x="186" y="128" fill="#1C1A0E">Failed</text>
  </g>
  <text x="24" y="190" font-family="${SANS}" font-size="20" fill="#F7F7F7" fill-opacity="0.55">deuteranopia</text>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="logo" cx="0.25" cy="1" r="1"><stop offset="0" stop-color="#CD57FF"/><stop offset="1" stop-color="#FFCE1F"/></radialGradient>
    <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#CD57FF"/><stop offset="0.55" stop-color="#FF7AB6"/><stop offset="1" stop-color="#FFCE1F"/></linearGradient>
    <linearGradient id="bar" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#CD57FF"/><stop offset="1" stop-color="#FFCE1F"/></linearGradient>
    <radialGradient id="glowA" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#CD57FF" stop-opacity="0.55"/><stop offset="1" stop-color="#CD57FF" stop-opacity="0"/></radialGradient>
    <radialGradient id="glowB" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#FFCE1F" stop-opacity="0.32"/><stop offset="1" stop-color="#FFCE1F" stop-opacity="0"/></radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="20" stdDeviation="20" flood-color="#000" flood-opacity="0.55"/></filter>
    <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#ffffff" fill-opacity="0.07"/></pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="#272625"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>
  <circle cx="980" cy="210" r="420" fill="url(#glowA)"/>
  <circle cx="1120" cy="640" r="360" fill="url(#glowB)"/>
  <circle cx="120" cy="720" r="300" fill="url(#glowA)" opacity="0.5"/>

  <g transform="translate(72 84)">
    <rect width="64" height="64" rx="18" fill="url(#logo)"/>
    <text x="32" y="47" text-anchor="middle" font-family="${SERIF}" font-size="44" fill="#111011" transform="skewX(-12) translate(10 0)">f</text>
    <text x="84" y="42" font-family="${SANS}" font-size="26" fill="#F7F7F7" fill-opacity="0.8">${TEXT.kicker}</text>
  </g>
  <text font-family="${SERIF}" font-size="138" letter-spacing="-3" fill="#F7F7F7">
    <tspan x="64" y="310">${TEXT.title[0]}</tspan>
    <tspan x="64" y="440" fill="url(#grad)">${TEXT.title[1]}</tspan>
  </text>
  <text font-family="${SANS}" font-size="30" fill="#F7F7F7" fill-opacity="0.72">
    <tspan x="72" y="528">${TEXT.sub[0]}</tspan>
    <tspan x="72" y="570">${TEXT.sub[1]}</tspan>
  </text>
  <g transform="translate(72 610)">
    <rect width="${TEXT.url.length * 13.6 + 64}" height="56" rx="28" fill="#F7F7F7"/>
    <circle cx="30" cy="28" r="9" fill="url(#logo)"/>
    <text x="50" y="37" font-family="${SANS}" font-size="24" fill="#111011">${TEXT.url}</text>
  </g>

  ${card(612, 84, 'Contrast Checker', contrastArt)}
  ${card(936, 84, 'Palette Generator', paletteArt)}
  ${card(612, 368, 'Type Scale', typeArt)}
  ${card(936, 368, 'Color Blindness', cbArt)}
</svg>`;

const png = new Resvg(svg, {
  fitTo: { mode: 'width', value: W },
  font: { fontFiles, loadSystemFonts: false, defaultFontFamily: 'Inter' },
}).render().asPng();
await fs.writeFile(out, png);
console.log(`${path.relative(process.cwd(), out)}: ${(png.length / 1024).toFixed(0)} KB`);
