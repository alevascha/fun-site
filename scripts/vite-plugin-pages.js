import fs from 'node:fs/promises';
import fsSync from 'node:fs';
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

      // Inline the entry CSS (~14 KB gzipped): a <link> blocks the first paint
      // until a second request finishes, which costs ~0.4 s on mobile.
      const links = [...html.matchAll(/<link rel="stylesheet" crossorigin href="(\/assets\/[^"]+\.css)">/g)];
      for (const [tag, href] of links) {
        const css = await fs.readFile(path.join(outDir, href), 'utf8');
        html = html.replace(tag, () => `<style>${css}</style>`);
      }
      await fs.writeFile(path.join(outDir, 'index.html'), html);

      // "/es" → es.html, "/es/guias/x" → es/guias/x.html. Hosts serve
      // /route from route.html with a 200 (no redirect to /route/).
      const write = async (route, content) => {
        const rel = route === '/' ? 'index.html' : `${route.replace(/^\//, '')}.html`;
        await fs.mkdir(path.dirname(path.join(outDir, rel)), { recursive: true });
        await fs.writeFile(path.join(outDir, rel), content);
      };
      // Each route's lazy chunks are preloaded together with the entry, so the
      // browser doesn't discover them only after the entry script runs.
      let manifest = {};
      try { manifest = JSON.parse(await fs.readFile(path.join(outDir, '.vite/manifest.json'), 'utf8')); } catch { /* no manifest */ }
      const entryTag = html.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/);
      const basePreloads = [...html.matchAll(/<link rel="modulepreload" crossorigin href="([^"]+)">/g)].map(m => m[1]);
      html = html.replace(/\s*<script type="module" crossorigin src="[^"]+"><\/script>/, '').replace(/\s*<link rel="modulepreload" crossorigin href="[^"]+">/g, '');
      const routeAssets = src => {
        const js = new Set(), css = new Set();
        const walk = key => {
          const c = manifest[key];
          if (!c || c.isEntry || js.has(c.file)) return;
          js.add(c.file);
          (c.css || []).forEach(f => css.add(f));
          (c.imports || []).forEach(walk);
        };
        if (src && manifest[src]) walk(src);
        return { js: [...basePreloads, ...[...js].map(f => `/${f}`).filter(f => !basePreloads.includes(f))], css: [...css].map(f => `/${f}`) };
      };
      const cssCache = new Map();
      const pascal = id => id.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join('');
      // Starts the app once the prerendered page has painted: first the
      // route's chunks as modulepreload (they download in parallel), then
      // the entry. See the comment in render().
      const bootAfterPaint = (src, chunks) => `(function(){var d=document,done=0;function add(r,h){var l=d.createElement('link');l.rel=r;l.crossOrigin='';l.href=h;d.head.appendChild(l)}function go(){if(done)return;done=1;${JSON.stringify(chunks)}.forEach(function(h){add('modulepreload',h)});var s=d.createElement('script');s.type='module';s.crossOrigin='';s.src=${JSON.stringify(src)};d.head.appendChild(s)}function later(){if(d.visibilityState!=='visible')return go();requestAnimationFrame(function(){setTimeout(go,0)});setTimeout(go,1000)}d.readyState==='loading'?d.addEventListener('DOMContentLoaded',later):later()})()`;
      const render = (meta, body, ld, opts, src) => {
        const out = injectBody(injectMeta(html, meta, opts), body, ld);
        if (!entryTag) return out;
        // The app's JS (entry and this route's chunks) is requested and run
        // only after the browser has painted the prerendered page once
        // (DOMContentLoaded, then one frame). With a plain module script and
        // modulepreload links in <head>, ~400 KB of scripts started before the
        // first paint, and PageSpeed counts those in the first contentful
        // paint: it swung between ~1.7 s and ~3 s from run to run. The HTML
        // parses in a few ms, so starting the downloads one frame later costs
        // visitors almost nothing. In a background tab it starts right away,
        // and if no frame comes within a second (a covered window) it starts
        // anyway.
        const { js, css } = routeAssets(src);
        // Small route CSS (under 2 KB, e.g. Lenis' few rules) goes inline: a
        // separate high-priority request before the first paint costs a round
        // trip on slow connections. Larger files keep their preload.
        const inline = [], preload = [];
        for (const f of css) {
          const text = cssCache.get(f) ?? cssCache.set(f, fsSync.readFileSync(path.join(outDir, f), 'utf8')).get(f);
          (text.length < 2048 ? inline : preload).push(text.length < 2048 ? text : f);
        }
        const tags = [
          ...(inline.length ? [`<style>${inline.join('')}</style>`] : []),
          `<script>${bootAfterPaint(entryTag[1], js)}</script>`,
          ...preload.map(f => `<link rel="preload" as="style" crossorigin href="${f}">`),
        ].join('\n    ');
        return out.replace('</head>', `    ${tags}\n  </head>`);
      };

      const sitemap = []; // { en, es, lastmod, priority }
      const today = new Date().toISOString().slice(0, 10);

      for (const lang of LANGS) {
        await write(page('/', lang), render(homeMeta(lang), homeBody(lang), homeJsonLd(lang)));

        for (const exp of active()) {
          await write(toolPath(exp, lang), render(getPageMeta(exp, lang), toolBody(exp, lang), toolJsonLd(exp, lang), undefined, `src/pages/${pascal(exp.id)}.jsx`));
        }
        for (const p of STATIC_PAGES) {
          await write(lang === 'es' ? STATIC_PAGES_ES[p.id].path : p.path, render(staticMeta(p.id, lang), staticBody(p.id, lang), '', undefined, 'src/pages/StaticPage.jsx'));
        }
        await write(page('/pro', lang), render(PRO_META(lang), proBody(lang), '', undefined, 'src/pages/ProPage.jsx'));
        await write(page('/games', lang), render(GAMES_META(lang), gamesBody(lang), '', undefined, 'src/pages/GamesIndex.jsx'));
        await write(page('/guides', lang), render(GUIDES_META(lang), guidesBody(lang), '', undefined, 'src/pages/GuidesIndex.jsx'));
        await write(page('/changelog', lang), render(CHANGELOG_META(lang), changelogBody(lang), '', undefined, 'src/pages/Changelog.jsx'));
        for (const g of GUIDES) {
          await write(guidePath(g, lang), render(guideMeta(g, lang), guideBody(g, lang), guideJsonLd(g, lang), undefined, 'src/pages/GuidePage.jsx'));
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
        { title: `Page not found - ${SITE.name}`, description: SITE.description, path: '/404', image: '/og/home.png', lang: 'en' },
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
