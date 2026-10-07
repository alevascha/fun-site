// Bundles framer/framer-fx.js + Lenis into paste-able blocks for
// Framer → Site Settings → Custom Code → End of <body> tag. Framer caps each
// entry at 50,000 characters, so Lenis gets its own entry:
//   framer/custom-code-lenis.html → "Ale motion layer · Lenis"
//   framer/custom-code.html       → "Ale motion layer"
// (framer/loader-head.html goes in a third entry, Start of <head>.)
import fs from 'node:fs';
import { minify } from 'rolldown/experimental';

const LIMIT = 50000;
const fx = fs.readFileSync('framer/framer-fx.js', 'utf8');
const lenis = fs.readFileSync('node_modules/lenis/dist/lenis.min.js', 'utf8');
const { code } = await minify('framer-fx.js', fx);
const files = {
  'framer/custom-code-lenis.html': `<!-- Ale's motion layer · Lenis (MIT) © darkroom.engineering -->
<script>${lenis}</script>
`,
  'framer/custom-code.html': `<!-- Ale's motion layer · source: github.com/alevascha/fun-site/framer -->
<script>${code}</script>
`,
};
for (const [file, out] of Object.entries(files)) {
  fs.writeFileSync(file, out);
  console.log(`${file}: ${out.length.toLocaleString()} chars${out.length > LIMIT ? '  ⚠ over Framer’s 50,000 limit' : ''}`);
}
