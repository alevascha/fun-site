// Bundles framer/framer-fx.js + Lenis into one paste-able block for
// Framer → Site Settings → Custom Code → End of <body> tag.
import fs from 'node:fs';
import { minify } from 'rolldown/experimental';

const fx = fs.readFileSync('framer/framer-fx.js', 'utf8');
const lenis = fs.readFileSync('node_modules/lenis/dist/lenis.min.js', 'utf8');
const { code } = await minify('framer-fx.js', fx);
const out = `<!-- Ale's motion layer · source: github.com/alevascha/fun-site/framer · Lenis (MIT) © darkroom.engineering -->
<script>${lenis}</script>
<script>${code}</script>
`;
fs.writeFileSync('framer/custom-code.html', out);
console.log(`framer/custom-code.html: ${(out.length / 1024).toFixed(1)} KB`);
