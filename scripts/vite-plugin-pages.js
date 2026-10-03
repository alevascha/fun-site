import fs from 'node:fs/promises';
import path from 'node:path';
import { getPageMeta, getSeo, SITE } from '../src/experiments.js';
import { STATIC_PAGES, STATIC_PAGES_ES } from '../src/pages-content.js';
import { ES } from '../src/seo-es.js';
import { GUIDES } from '../src/guides.js';
import {
  absolute, active, CHANGELOG_META, SUBSCRIPTION_META, subscriptionBody, changelogBody, guideBody, guideJsonLd, guideMeta, GUIDES_META, guidesBody, GAMES_META, gamesBody, guidePath,
  homeBody, homeJsonLd, homeMeta, injectBody, injectMeta, notFoundBody, page, PRO_META, proBody, rss, staticBody, staticMeta,
  toolBody, toolJsonLd, toolName, toolPath,
} from './meta.js';

const adsenseHead = () => (SITE.adsenseClient
  ? `<meta name="google-adsense-account" content="${SITE.adsenseClient}" />\n    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE.adsenseClient}" crossorigin="anonymous"></script>`
  : '');

const LANGS = ['en', 'es'];

/* Build-time SEO, for every route in English and Spanish:
   - dist/<route>.html with its own meta, hreflang alternates, JSON-LD and a
     crawlable static body (Spanish routes live under /es with translated slugs)
   - 404.html (noindex), sitemap.xml (with hreflang pairs), robots.txt,
     rss.xml + es/rss.xml and llms.txt */
export default function pagesPlugin() {
  let outDir = 'dist';
  return {
    name: 'fun-lab-pages',
    configResolved(config) { outDir = path.resolve(config.root, config.build.outDir); },
    transformIndexHtml: {
      order: 'pre',
      handler: html => injectBody(injectMeta(html, homeMeta('en')), homeBody('en'), homeJsonLd('en'))
        .replace('<!-- adsense -->', adsenseHead())
        .replace(
          '<!-- analytics -->',
          SITE.umamiWebsiteId
            ? `<script defer src="https://cloud.umami.is/script.js" data-website-id="${SITE.umamiWebsiteId}" data-domains="fun.alevasquez.dev"></script>`
            : '',
        ),
    },
    async closeBundle() {
      let html;
      try { html = await fs.readFile(path.join(outDir, 'index.html'), 'utf8'); } catch { return; } // dev / non-build

      // "/es" → es.html, "/es/guias/x" → es/guias/x.html. Hosts serve
      // /route from route.html with a 200 (no redirect to /route/).
      const write = async (route, content) => {
        const rel = route === '/' ? 'index.html' : `${route.replace(/^\//, '')}.html`;
        await fs.mkdir(path.dirname(path.join(outDir, rel)), { recursive: true });
        await fs.writeFile(path.join(outDir, rel), content);
      };
      const render = (meta, body, ld, opts) => injectBody(injectMeta(html, meta, opts), body, ld);

      const sitemap = []; // { en, es, lastmod, priority }
      const today = new Date().toISOString().slice(0, 10);

      for (const lang of LANGS) {
        await write(page('/', lang), render(homeMeta(lang), homeBody(lang), homeJsonLd(lang)));

        for (const exp of active()) {
          await write(toolPath(exp, lang), render(getPageMeta(exp, lang), toolBody(exp, lang), toolJsonLd(exp, lang)));
        }
        for (const p of STATIC_PAGES) {
          await write(lang === 'es' ? STATIC_PAGES_ES[p.id].path : p.path, render(staticMeta(p.id, lang), staticBody(p.id, lang)));
        }
        await write(page('/pro', lang), render(PRO_META(lang), proBody(lang)));
        await write(page('/games', lang), render(GAMES_META(lang), gamesBody(lang)));
        await write(page('/guides', lang), render(GUIDES_META(lang), guidesBody(lang)));
        await write(page('/changelog', lang), render(CHANGELOG_META(lang), changelogBody(lang)));
        for (const g of GUIDES) {
          await write(guidePath(g, lang), render(guideMeta(g, lang), guideBody(g, lang), guideJsonLd(g, lang)));
        }
        // Newsletter landing pages: reachable from emails only, kept out of search.
        for (const action of ['confirm', 'unsubscribe']) {
          await write(page(action === 'confirm' ? '/confirm' : '/unsubscribe', lang), render(SUBSCRIPTION_META(action, lang), subscriptionBody(action, lang), '', { noindex: true }));
        }
      }

      sitemap.push({ en: '/', es: '/es', lastmod: today, priority: '1.0' });
      for (const e of active()) sitemap.push({ en: e.path, es: toolPath(e, 'es'), lastmod: e.addedAt, priority: '0.8' });
      for (const g of GUIDES) sitemap.push({ en: guidePath(g, 'en'), es: guidePath(g, 'es'), lastmod: g.date, priority: '0.7' });
      sitemap.push({ en: '/games', es: '/es/juegos', lastmod: today, priority: '0.6' });
      sitemap.push({ en: '/guides', es: '/es/guias', lastmod: today, priority: '0.6' });
      sitemap.push({ en: '/pro', es: '/es/pro', lastmod: today, priority: '0.5' });
      sitemap.push({ en: '/changelog', es: '/es/novedades', lastmod: today, priority: '0.4' });
      for (const p of STATIC_PAGES) sitemap.push({ en: p.path, es: STATIC_PAGES_ES[p.id].path, lastmod: p.updated, priority: '0.3' });

      // 404: the app shell with a noindex robots tag.
      await fs.writeFile(path.join(outDir, '404.html'), render(
        { title: `Page not found — ${SITE.name}`, description: SITE.description, path: '/404', image: '/og/home.png', lang: 'en' },
        notFoundBody(), '', { noindex: true },
      ));

      // ads.txt authorizes Google to sell ads on this domain (required by AdSense).
      if (SITE.adsenseClient) {
        await fs.writeFile(path.join(outDir, 'ads.txt'), `google.com, ${SITE.adsenseClient.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0\n`);
      }

      // Sitemap: one <url> per language, each listing both alternates.
      const alt = u => `<xhtml:link rel="alternate" hreflang="en" href="${absolute(u.en)}"/><xhtml:link rel="alternate" hreflang="es" href="${absolute(u.es)}"/><xhtml:link rel="alternate" hreflang="x-default" href="${absolute(u.en)}"/>`;
      const urls = sitemap.flatMap(u => [u.en, u.es].map(loc => `  <url><loc>${absolute(loc)}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.priority}</priority>${alt(u)}</url>`));
      await fs.writeFile(path.join(outDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`);
      await fs.writeFile(path.join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`);

      await fs.writeFile(path.join(outDir, 'rss.xml'), rss('en'));
      await fs.mkdir(path.join(outDir, 'es'), { recursive: true });
      await fs.writeFile(path.join(outDir, 'es', 'rss.xml'), rss('es'));

      // llms.txt: a plain-text map of the site for AI search engines and assistants.
      const llms = [
        `# ${SITE.name}`,
        '',
        `> ${SITE.description}`,
        '',
        `Built by ${SITE.author} (${SITE.authorUrl}). All tools are free, run entirely in the browser, and need no account. Every page is also available in Spanish under /es.`,
        '',
        '## Tools',
        '',
        ...active().map(e => `- [${e.title}](${SITE.url}${e.path}): ${getSeo(e.id).description || e.description}`),
        '',
        '## Guides',
        '',
        ...GUIDES.map(g => `- [${g.en.title}](${absolute(guidePath(g, 'en'))}): ${g.en.description}`),
        '',
        '## En español',
        '',
        ...active().map(e => `- [${toolName(e, 'es')}](${absolute(toolPath(e, 'es'))}): ${ES[e.id].description}`),
        ...GUIDES.map(g => `- [${g.es.title}](${absolute(guidePath(g, 'es'))}): ${g.es.description}`),
        '',
      ].join('\n');
      await fs.writeFile(path.join(outDir, 'llms.txt'), llms);
    },
  };
}
