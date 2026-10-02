import fs from 'node:fs/promises';
import path from 'node:path';
import { experiments, getPageMeta, HOME_META, SITE } from '../src/experiments.js';
import { injectMeta } from './meta.js';

/* - Injects the home page meta tags into index.html (dev + build).
   - After the build, writes dist/<route>.html for every experiment with
     its own title/description/OG tags, plus 404.html and sitemap.xml. */
export default function pagesPlugin() {
  let outDir = 'dist';
  return {
    name: 'fun-lab-pages',
    configResolved(config) { outDir = path.resolve(config.root, config.build.outDir); },
    transformIndexHtml: {
      order: 'pre',
      handler: html => injectMeta(html, HOME_META).replace(
        '<!-- analytics -->',
        SITE.umamiWebsiteId
          ? `<script defer src="https://cloud.umami.is/script.js" data-website-id="${SITE.umamiWebsiteId}" data-domains="fun.alevasquez.dev"></script>`
          : '',
      ),
    },
    async closeBundle() {
      const indexPath = path.join(outDir, 'index.html');
      let html;
      try { html = await fs.readFile(indexPath, 'utf8'); } catch { return; } // dev / non-build
      const active = experiments.filter(e => e.active && e.path);
      // <route>.html (not <route>/index.html): Netlify serves /route from it
      // with a 200 instead of redirecting to /route/.
      for (const exp of active) {
        await fs.writeFile(path.join(outDir, `${exp.path.replace(/^\//, '')}.html`), injectMeta(html, getPageMeta(exp)));
      }
      await fs.writeFile(path.join(outDir, '404.html'), html);
      const today = new Date().toISOString().slice(0, 10);
      const urls = [{ path: '/', lastmod: today }, ...active.map(e => ({ path: e.path, lastmod: e.addedAt }))];
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
        .map(u => `  <url><loc>${SITE.url}${u.path}</loc><lastmod>${u.lastmod}</lastmod></url>`)
        .join('\n')}\n</urlset>\n`;
      await fs.writeFile(path.join(outDir, 'sitemap.xml'), sitemap);
      await fs.writeFile(path.join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`);
    },
  };
}
