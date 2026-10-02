import fs from 'node:fs/promises';
import path from 'node:path';
import { experiments, getPageMeta, getSeo, HOME_META, SITE } from '../src/experiments.js';
import { homeBody, homeJsonLd, injectBody, injectMeta, notFoundBody, toolBody, toolJsonLd } from './meta.js';

/* Build-time SEO:
   - index.html gets the home page's meta tags, JSON-LD and a static body
   - dist/<route>.html for every experiment, each with its own meta, JSON-LD
     (WebApplication + Breadcrumb + FAQ) and crawlable body content
   - 404.html (noindex), sitemap.xml, robots.txt and llms.txt */
export default function pagesPlugin() {
  let outDir = 'dist';
  return {
    name: 'fun-lab-pages',
    configResolved(config) { outDir = path.resolve(config.root, config.build.outDir); },
    transformIndexHtml: {
      order: 'pre',
      handler: html => injectBody(injectMeta(html, HOME_META), homeBody(), homeJsonLd()).replace(
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

      // <route>.html (not <route>/index.html): hosts serve /route from it
      // with a 200 instead of redirecting to /route/.
      for (const exp of active) {
        const page = injectBody(injectMeta(html, getPageMeta(exp)), toolBody(exp), toolJsonLd(exp));
        await fs.writeFile(path.join(outDir, `${exp.path.replace(/^\//, '')}.html`), page);
      }

      const notFound = injectBody(
        injectMeta(html, { title: `Page not found — ${SITE.name}`, description: SITE.description, path: '/404', image: '/og/home.png' }, { noindex: true }),
        notFoundBody(),
      );
      await fs.writeFile(path.join(outDir, '404.html'), notFound);

      const today = new Date().toISOString().slice(0, 10);
      const urls = [{ path: '/', lastmod: today, priority: '1.0' }, ...active.map(e => ({ path: e.path, lastmod: e.addedAt, priority: '0.8' }))];
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
        .map(u => `  <url><loc>${SITE.url}${u.path}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.priority}</priority></url>`)
        .join('\n')}\n</urlset>\n`;
      await fs.writeFile(path.join(outDir, 'sitemap.xml'), sitemap);
      await fs.writeFile(path.join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`);

      // llms.txt: a plain-text map of the site for AI search engines and assistants.
      const llms = [
        `# ${SITE.name}`,
        '',
        `> ${SITE.description}`,
        '',
        `Built by ${SITE.author} (${SITE.authorUrl}). All tools are free, run entirely in the browser, and need no account.`,
        '',
        '## Tools',
        '',
        ...active.map(e => {
          const seo = getSeo(e.id);
          return `- [${e.title}](${SITE.url}${e.path}): ${seo.description || e.description}`;
        }),
        '',
      ].join('\n');
      await fs.writeFile(path.join(outDir, 'llms.txt'), llms);
    },
  };
}
