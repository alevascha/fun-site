// Builds the portfolio's motion layer (framer/framer-fx.js + Lenis).
//   public/portfolio-fx.js  → served by this site at
//                             https://fun.alevasquez.dev/portfolio-fx.js and
//                             cached once for every page of the portfolio.
//   framer/custom-code.html → paste in Framer → Site Settings → Custom Code →
//                             End of <body> ("Ale motion layer"). A tiny inline
//                             part that has to run as soon as the page is
//                             parsed, plus the deferred <script src> above
//                             (versioned by content hash, so a new build is
//                             picked up as soon as the snippet is updated).
// (framer/loader-head.html goes in another entry, Start of <head>.)
import fs from 'node:fs';
import crypto from 'node:crypto';
import { minify } from 'rolldown/experimental';

const fx = fs.readFileSync('framer/framer-fx.js', 'utf8');
const lenis = fs.readFileSync('node_modules/lenis/dist/lenis.min.js', 'utf8').replace(/\n\/\/# sourceMappingURL=.*\n?$/, '\n');
const { code } = await minify('framer-fx.js', fx);
const bundle = `/* Ale's motion layer · source: github.com/alevascha/fun-site/framer
   Lenis (MIT) © darkroom.engineering */
${lenis}
${code}
`;
fs.writeFileSync('public/portfolio-fx.js', bundle);
const hash = crypto.createHash('sha1').update(bundle).digest('hex').slice(0, 8);

// Runs inline, right after the page is parsed:
// - Intro only when the page is slow: parsed within 800 ms (the delay before
//   loader-head.html fades its cover in) means a fast load, so the intro is
//   skipped and the site shows straight away.
// - Framer wraps each page in <div id="main"> with no landmark role.
const inline = `(function(){var d=document.documentElement;if(d.classList.contains('avfx-loading')&&performance.now()<800)d.classList.remove('avfx-loading');var m=document.getElementById('main');if(m&&!document.querySelector('main,[role="main"]'))m.setAttribute('role','main')})()`;

const snippet = `<!-- Ale's motion layer · source: github.com/alevascha/fun-site/framer -->
<script>${inline}</script>
<script src="https://fun.alevasquez.dev/portfolio-fx.js?v=${hash}" defer></script>
`;
fs.writeFileSync('framer/custom-code.html', snippet);
console.log(`public/portfolio-fx.js: ${(bundle.length / 1024).toFixed(1)} KB (v=${hash})`);
console.log(`framer/custom-code.html: ${snippet.length} chars`);
