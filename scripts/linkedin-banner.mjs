// LinkedIn profile banner (1584×396, plus @2x) in the alevasquez.dev style:
// dark ground, dot grid, purple/yellow glows, the hero's token sphere drawn
// as vectors, serif headline with the brand gradient and both URLs as pills.
// LinkedIn lays the profile photo over the bottom-left corner, so the left
// ~460px only carries background.
//   node scripts/linkedin-banner.mjs   →   framer/linkedin/banner.png, banner@2x.png
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const root = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(root, '..', 'framer', 'linkedin');
const fontFiles = ['CrimsonPro-Light.ttf', 'Inter-Medium.ttf'].map(f => path.join(root, 'fonts', f));
const W = 1584, H = 396;
const COLORS = ['#CD57FF', '#8B6CF0', '#FFCE1F', '#FF7AB6'];

// Token sphere: Fibonacci points, rotated, perspective-projected; back half
// fades, every 11th token is a small rounded chip, near neighbours link up.
function sphere(cx, cy, R, n = 300) {
  const rx = 0.42, ry = 0.55, focal = 900;
  const pts = Array.from({ length: n }, (_, i) => {
    const y = 1 - (i + 0.5) / n * 2, r = Math.sqrt(1 - y * y), th = i * 2.39996;
    let x = Math.cos(th) * r, z = Math.sin(th) * r, yy = y;
    const x1 = x * Math.cos(ry) - z * Math.sin(ry), z1 = x * Math.sin(ry) + z * Math.cos(ry);
    const y2 = yy * Math.cos(rx) - z1 * Math.sin(rx), z2 = yy * Math.sin(rx) + z1 * Math.cos(rx);
    const s = focal / (focal + z2 * R);
    return { X: cx + x1 * R * s, Y: cy + y2 * R * s, s, depth: (1 - z2) / 2, x3: x1, y3: y2, z3: z2,
      col: COLORS[i % 7 === 0 ? 2 : i % 5 === 0 ? 3 : i % 3 === 0 ? 1 : 0], chip: i % 11 === 0 };
  });
  const link = 1.7 * Math.sqrt(4 * Math.PI / n);
  let lines = '';
  pts.forEach((a, i) => [8, 13, 21, 34].forEach(o => {
    const b = pts[i + o];
    if (!b) return;
    const d = Math.hypot(a.x3 - b.x3, a.y3 - b.y3, a.z3 - b.z3);
    if (d > link) return;
    const op = ((1 - d / link) * 0.3 * Math.min(a.depth, b.depth) + 0.02).toFixed(3);
    lines += `<line x1="${a.X.toFixed(1)}" y1="${a.Y.toFixed(1)}" x2="${b.X.toFixed(1)}" y2="${b.Y.toFixed(1)}" stroke="${a.col}" stroke-opacity="${op}" stroke-width="0.8"/>`;
  }));
  const dots = pts.sort((a, b) => a.depth - b.depth).map(p => {
    const op = (0.18 + p.depth * 0.82).toFixed(3);
    if (p.chip) {
      const w = 11 * p.s, h = 6.5 * p.s;
      return `<rect x="${(p.X - w / 2).toFixed(1)}" y="${(p.Y - h / 2).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="${(3 * p.s).toFixed(1)}" fill="${p.col}" fill-opacity="${op}"/>`;
    }
    return `<circle cx="${p.X.toFixed(1)}" cy="${p.Y.toFixed(1)}" r="${(2.1 * p.s).toFixed(2)}" fill="${p.col}" fill-opacity="${op}"/>`;
  }).join('');
  return lines + dots;
}

const pill = (x, y, label, dot) => {
  const w = 42 + label.length * 10.6 + (dot ? 18 : 0);
  return `<g transform="translate(${x} ${y})">
    <rect width="${w.toFixed(0)}" height="50" rx="25" fill="#ffffff" fill-opacity="0.06" stroke="#ffffff" stroke-opacity="0.14"/>
    ${dot ? `<circle cx="24" cy="25" r="5.5" fill="${dot}"/>` : ''}
    <text x="${dot ? 40 : 21}" y="32" font-family="Inter" font-size="21" fill="#F7F7F7" fill-opacity="0.9">${label}</text>
  </g>`;
};

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="grad" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#CD57FF"/><stop offset="0.55" stop-color="#FF7AB6"/><stop offset="1" stop-color="#FFCE1F"/></linearGradient>
    <radialGradient id="glowP" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#CD57FF" stop-opacity="0.42"/><stop offset="1" stop-color="#CD57FF" stop-opacity="0"/></radialGradient>
    <radialGradient id="glowY" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#FFCE1F" stop-opacity="0.16"/><stop offset="1" stop-color="#FFCE1F" stop-opacity="0"/></radialGradient>
    <radialGradient id="glowV" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#8B6CF0" stop-opacity="0.28"/><stop offset="1" stop-color="#8B6CF0" stop-opacity="0"/></radialGradient>
    <radialGradient id="core" cx="0.35" cy="0.3" r="0.75"><stop offset="0" stop-color="#FFE38A"/><stop offset="0.45" stop-color="#FFCE1F"/><stop offset="0.75" stop-color="#B98CF5"/><stop offset="1" stop-color="#8B6CF0"/></radialGradient>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>
    <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#ffffff" fill-opacity="0.075"/></pattern>
    <linearGradient id="fadeL" x1="0" x2="1"><stop offset="0" stop-color="#111011" stop-opacity="0.85"/><stop offset="0.35" stop-color="#111011" stop-opacity="0"/></linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#161516"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>
  <ellipse cx="1400" cy="190" rx="420" ry="300" fill="url(#glowP)"/>
  <ellipse cx="260" cy="40" rx="420" ry="260" fill="url(#glowV)"/>
  <ellipse cx="1560" cy="380" rx="300" ry="220" fill="url(#glowY)"/>
  <rect width="${W}" height="${H}" fill="url(#fadeL)"/>

  <!-- top-left decorations (above the profile photo): a token, the palette
       and a component being edited, i.e. design + engineering -->
  <g opacity="0.92">
    <g transform="translate(52 44)">
      <rect width="262" height="44" rx="12" fill="#ffffff" fill-opacity="0.05" stroke="#ffffff" stroke-opacity="0.12"/>
      <circle cx="22" cy="22" r="7" fill="#CD57FF"/>
      <text x="40" y="28" font-family="Inter" font-size="17"><tspan fill="#CD57FF">--brand-primary</tspan><tspan fill="#DBDBDB" fill-opacity="0.7">: #CD57FF;</tspan></text>
    </g>
    <g transform="translate(52 108)">
      <rect width="196" height="58" rx="14" fill="#ffffff" fill-opacity="0.05" stroke="#ffffff" stroke-opacity="0.12"/>
      <rect x="14" y="13" width="32" height="32" rx="8" fill="#CD57FF"/>
      <rect x="58" y="13" width="32" height="32" rx="8" fill="#FF7AB6"/>
      <rect x="102" y="13" width="32" height="32" rx="8" fill="#FFCE1F"/>
      <rect x="146" y="13" width="32" height="32" rx="8" fill="#8B6CF0"/>
    </g>
    <g transform="translate(270 112)">
      <rect x="-6" y="-6" width="132" height="62" rx="12" fill="none" stroke="#8B6CF0" stroke-opacity="0.8" stroke-dasharray="4 4"/>
      <rect width="120" height="50" rx="25" fill="url(#grad)"/>
      <text x="60" y="32" text-anchor="middle" font-family="Inter" font-size="18" fill="#111011">Primary</text>
      <rect x="-9" y="-9" width="6" height="6" fill="#F7F7F7"/><rect x="117" y="-9" width="6" height="6" fill="#F7F7F7"/>
      <rect x="-9" y="47" width="6" height="6" fill="#F7F7F7"/><rect x="117" y="47" width="6" height="6" fill="#F7F7F7"/>
      <path d="M128 40 L128 66 L135 59 L140 70 L145 68 L140 57 L150 57 Z" fill="#F7F7F7" stroke="#111011" stroke-width="1.5" stroke-linejoin="round"/>
    </g>
  </g>

  <!-- the hero's gradient ball with its token orbit -->
  <circle cx="1418" cy="198" r="96" fill="url(#core)" filter="url(#soft)" opacity="0.9"/>
  ${sphere(1418, 198, 138)}

  <!-- copy (kept right of the profile-photo zone) -->
  <g transform="translate(492 0)">
    <text x="0" y="76" font-family="Inter" font-size="19" letter-spacing="3.8" fill="url(#grad)">ALEJANDRO VASQUEZ</text>
    <text x="0" y="156" font-family="Crimson Pro" font-weight="300" font-size="78" letter-spacing="-1.4" fill="#F7F7F7">Bridging the gap between</text>
    <text x="0" y="236" font-family="Crimson Pro" font-weight="300" font-size="78" letter-spacing="-1.4" fill="url(#grad)">Design &amp; Engineering</text>
    <text x="0" y="288" font-family="Inter" font-size="26" fill="#DBDBDB" fill-opacity="0.82">Design Systems Architect · UX &amp; AI Interface Engineer</text>
    ${pill(0, 316, 'alevasquez.dev', '#CD57FF')}
    ${pill(236, 316, 'fun.alevasquez.dev', '#FFCE1F')}
  </g>
</svg>`;

await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(path.join(outDir, 'banner.svg'), svg);
for (const [name, width] of [['banner.png', W], ['banner@2x.png', W * 2]]) {
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: width }, font: { fontFiles, loadSystemFonts: false, defaultFontFamily: 'Inter' } }).render().asPng();
  await fs.writeFile(path.join(outDir, name), png);
  console.log(`framer/linkedin/${name}: ${(png.length / 1024).toFixed(0)} KB`);
}
