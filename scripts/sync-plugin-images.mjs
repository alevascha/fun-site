// Copies each plugin's images from ../fun-lab-plugins/<id>/assets into
// public/: the plugin window shots as WebP (760px wide, 2x the largest size
// on the page), the icon, and og.png, a 1200×600 social image from the cover.
// Run after `npm run assets` in fun-lab-plugins:  node scripts/sync-plugin-images.mjs
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { PRO_PLUGINS } from '../src/pro-content.js';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const plugins = path.resolve(root, '../fun-lab-plugins');
for (const { id } of PRO_PLUGINS) {
  const src = path.join(plugins, id, 'assets'), dest = path.join(root, 'public/plugin-assets', id);
  fs.mkdirSync(dest, { recursive: true });
  for (const f of fs.readdirSync(dest)) fs.unlinkSync(path.join(dest, f));
  fs.copyFileSync(path.join(src, 'icon.png'), path.join(dest, 'icon.png'));
  const shots = fs.readdirSync(src).filter(f => /^ui-\d+\.png$/.test(f));
  for (const f of shots) execFileSync('cwebp', ['-quiet', '-q', '82', '-resize', '760', '0', path.join(src, f), '-o', path.join(dest, f.replace('.png', '.webp'))]);
  execFileSync('sips', ['-z', '600', '1200', path.join(src, 'cover.png'), '--out', path.join(dest, 'og.png')], { stdio: 'ignore' });
  const kb = fs.readdirSync(dest).reduce((s, f) => s + fs.statSync(path.join(dest, f)).size, 0) / 1024;
  console.log(`${id}: ${shots.length} shots, ${Math.round(kb)} KB`);
}
