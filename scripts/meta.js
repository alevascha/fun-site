import { experiments, getPageMeta, getSeo, HOME_META, HOME_META_ES, SITE, withSite } from '../src/experiments.js';
import { STATIC_PAGES, STATIC_PAGES_ES } from '../src/pages-content.js';
import { ES } from '../src/seo-es.js';
import { GUIDES } from '../src/guides.js';
import { SECTIONS } from '../src/guide-sections.js';
import { CHANGELOG } from '../src/changelog.js';

/* Build-time HTML for every route, in English and Spanish: <head> tags
   (title, description, robots, canonical, hreflang, Open Graph), JSON-LD
   and a crawlable static body that React replaces on load. */

export const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const active = () => experiments.filter(e => e.active && e.path);
const absolute = path => SITE.url + (path === '/' ? '/' : path);
const L = (lang, en, es) => (lang === 'es' ? es : en);
const toolPath = (exp, lang) => (lang === 'es' ? `/es/${ES[exp.id].slug}` : exp.path);
const toolName = (exp, lang) => (lang === 'es' ? ES[exp.id].name : exp.title);
const toolBlurb = (exp, lang) => (lang === 'es' ? ES[exp.id].card : exp.description);
const guidePath = (g, lang) => (lang === 'es' ? `/es/guias/${g.es.slug}` : `/guides/${g.slug}`);
const PAGE_ES = { '/': '/es', '/about': '/es/acerca-de', '/privacy': '/es/privacidad', '/pro': '/es/pro', '/games': '/es/juegos', '/guides': '/es/guias', '/changelog': '/es/novedades', '/confirm': '/es/confirmar', '/unsubscribe': '/es/baja' };
const page = (enPath, lang) => (lang === 'es' ? PAGE_ES[enPath] || enPath : enPath);

/* ---------- <head> ---------- */

export function renderMeta(meta, { noindex = false } = {}) {
  const url = absolute(meta.path);
  const image = SITE.url + meta.image;
  const lang = meta.lang || 'en';
  const tags = [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    `<meta name="robots" content="${noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
  ];
  if (meta.alternates && !noindex) {
    tags.push(
      `<link rel="alternate" hreflang="en" href="${esc(absolute(meta.alternates.en))}" />`,
      `<link rel="alternate" hreflang="es" href="${esc(absolute(meta.alternates.es))}" />`,
      `<link rel="alternate" hreflang="x-default" href="${esc(absolute(meta.alternates.en))}" />`,
    );
  }
  tags.push(
    `<meta property="og:type" content="${meta.ogType || 'website'}" />`,
    `<meta property="og:site_name" content="${esc(SITE.name)}" />`,
    `<meta property="og:locale" content="${lang === 'es' ? 'es_ES' : 'en_US'}" />`,
    `<meta property="og:locale:alternate" content="${lang === 'es' ? 'en_US' : 'es_ES'}" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(meta.title)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
  );
  return tags.join('\n    ');
}

export const META_BLOCK = /<!-- meta:start -->[\s\S]*?<!-- meta:end -->/;

export function injectMeta(html, meta, opts) {
  return html
    .replace(META_BLOCK, `<!-- meta:start -->\n    ${renderMeta(meta, opts)}\n    <!-- meta:end -->`)
    .replace(/<html lang="[a-z-]+">/, `<html lang="${meta.lang || 'en'}">`);
}

/* ---------- page meta for non-tool routes ---------- */

export function staticMeta(id, lang) {
  const en = STATIC_PAGES.find(p => p.id === id);
  const p = lang === 'es' ? { ...en, ...STATIC_PAGES_ES[id] } : en;
  return { title: p.metaTitle, description: p.description, path: p.path, image: '/og/home.png', lang, alternates: { en: en.path, es: STATIC_PAGES_ES[id].path } };
}

function simpleMeta(enPath, lang, title, description) {
  return { title, description, path: page(enPath, lang), image: '/og/home.png', lang, alternates: { en: enPath, es: page(enPath, 'es') } };
}

export const PRO_META = lang => simpleMeta('/pro', lang,
  L(lang, "Lab Pro for Figma — waitlist — Ale's Fun Lab", "Lab Pro para Figma — lista de espera — Ale's Fun Lab"),
  L(lang, 'Figma plugins built on the lab’s tools: token sync with Variables, a one-click contrast fixer, palettes to Variables and motion tokens. Join the waitlist.', 'Plugins de Figma con las herramientas del lab: tokens sincronizados con Variables, contraste corregido en un clic y paletas a Variables. Únete a la lista.'));
export const GUIDES_META = lang => simpleMeta('/guides', lang,
  L(lang, "Guides: color, accessibility, type & tokens — Ale's Fun Lab", "Guías: color, accesibilidad, tipografía y tokens — Ale's Fun Lab"),
  L(lang, 'Short, practical guides on color contrast, fluid typography, design tokens and designing for translation — each with a free tool.', 'Guías breves y prácticas sobre contraste de color, tipografía fluida, design tokens y diseño para la traducción, cada una con una herramienta gratuita.'));
export const GAMES_META = lang => simpleMeta('/games', lang,
  L(lang, "Games for designers: color & contrast — Ale's Fun Lab", "Juegos para diseñadores: color y contraste — Ale's Fun Lab"),
  L(lang, 'Quick, free browser games that train your eye for color and accessible contrast. Play on your phone or desktop.', 'Juegos rápidos y gratuitos en el navegador que entrenan tu ojo para el color y el contraste accesible. Juega en el teléfono o en la computadora.'));
export const CHANGELOG_META = lang => simpleMeta('/changelog', lang,
  L(lang, "What's new — Ale's Fun Lab", "Novedades — Ale's Fun Lab"),
  L(lang, 'New tools, guides and improvements in Ale’s Fun Lab, newest first.', 'Nuevas herramientas, guías y mejoras en Ale’s Fun Lab, de la más reciente a la más antigua.'));
export const guideMeta = (g, lang) => ({
  title: withSite(g[lang].title), description: g[lang].description, path: guidePath(g, lang), image: `/og/${g.tool}.png`,
  lang, ogType: 'article', alternates: { en: guidePath(g, 'en'), es: guidePath(g, 'es') },
});
export const homeMeta = lang => (lang === 'es' ? HOME_META_ES : HOME_META);

/* ---------- structured data (schema.org JSON-LD) ---------- */

const person = { '@type': 'Person', '@id': `${SITE.authorUrl}#person`, name: SITE.author, url: SITE.authorUrl, sameAs: SITE.sameAs, jobTitle: 'Design Systems Architect · UX & AI Interface Engineer' };
const website = { '@type': 'WebSite', '@id': `${SITE.url}/#website`, name: SITE.name, url: `${SITE.url}/`, description: SITE.description, inLanguage: ['en', 'es'], publisher: { '@id': person['@id'] } };

function jsonLd(graph) {
  // Escape "<" so content can never close the script tag.
  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>`;
}

const crumbs = (lang, items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: [{ name: SITE.name, path: page('/', lang) }, ...items].map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: absolute(it.path) })),
});

export function homeJsonLd(lang = 'en') {
  return jsonLd([
    website,
    person,
    {
      '@type': 'ItemList',
      name: L(lang, 'Design and accessibility tools', 'Herramientas de diseño y accesibilidad'),
      itemListElement: active().map((e, i) => ({ '@type': 'ListItem', position: i + 1, url: absolute(toolPath(e, lang)), name: getSeo(e.id, lang).title || toolName(e, lang) })),
    },
  ]);
}

export function toolJsonLd(exp, lang = 'en') {
  const seo = getSeo(exp.id, lang);
  const meta = getPageMeta(exp, lang);
  const graph = [
    website,
    person,
    {
      '@type': 'WebApplication',
      name: seo.title || exp.title,
      alternateName: toolName(exp, lang),
      url: absolute(meta.path),
      description: meta.description,
      inLanguage: lang,
      applicationCategory: 'DesignApplication',
      operatingSystem: L(lang, 'Any (web browser)', 'Cualquiera (navegador web)'),
      browserRequirements: L(lang, 'Requires JavaScript', 'Requiere JavaScript'),
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      image: SITE.url + meta.image,
      author: { '@id': person['@id'] },
      featureList: seo.features || [],
      datePublished: exp.addedAt,
    },
    crumbs(lang, [{ name: toolName(exp, lang), path: meta.path }]),
  ];
  if (seo.faq?.length) {
    graph.push({ '@type': 'FAQPage', mainEntity: seo.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
  }
  return jsonLd(graph);
}

export function guideJsonLd(g, lang = 'en') {
  const c = g[lang];
  return jsonLd([
    website,
    person,
    {
      '@type': 'TechArticle',
      headline: c.title,
      description: c.description,
      inLanguage: lang,
      url: absolute(guidePath(g, lang)),
      image: `${SITE.url}/og/${g.tool}.png`,
      datePublished: g.date,
      dateModified: g.date,
      author: { '@id': person['@id'] },
      publisher: { '@id': person['@id'] },
      timeRequired: `PT${g.minutes}M`,
    },
    crumbs(lang, [{ name: L(lang, 'Guides', 'Guías'), path: page('/guides', lang) }, { name: c.title, path: guidePath(g, lang) }]),
  ]);
}

/* ---------- static body shells ---------- */

const nav = (lang, otherPath) => `<nav class="site-nav" aria-label="${L(lang, 'Main', 'Principal')}"><a class="site-nav-brand" href="${page('/', lang)}"><span class="site-nav-logo">f</span><span class="site-nav-brand-text">${esc(SITE.name)}</span></a><span class="site-nav-links"><a class="site-nav-link" href="${page('/games', lang)}">${L(lang, 'Games', 'Juegos')}</a> <a class="site-nav-link" href="${page('/guides', lang)}">${L(lang, 'Guides', 'Guías')}</a> <a class="site-nav-link" href="${page('/pro', lang)}">Pro</a></span><a class="site-nav-link" href="${otherPath}" hreflang="${L(lang, 'es', 'en')}" lang="${L(lang, 'es', 'en')}">${L(lang, 'Español', 'English')}</a></nav>`;

const toolLinks = (lang, exclude) => `<ul class="seo-links">${active().filter(e => e.id !== exclude).map(e => `<li><a href="${toolPath(e, lang)}">${esc(toolName(e, lang))}</a> — ${esc(toolBlurb(e, lang))}</li>`).join('')}</ul>`;
const guideLinks = (lang, exclude) => `<ul class="seo-links">${GUIDES.filter(g => g.slug !== exclude).map(g => `<li><a href="${guidePath(g, lang)}">${esc(g[lang].title)}</a> — ${esc(g[lang].description)}</li>`).join('')}</ul>`;

const footer = lang => `<footer class="site-footer"><span>${L(lang, 'Built by', 'Hecho por')} <a href="${SITE.authorUrl}">${esc(SITE.author)}</a>, Design Systems Architect · UX &amp; AI Interface Engineer.</span><nav class="footer-links" aria-label="${L(lang, 'Footer', 'Pie de página')}"><a href="${page('/guides', lang)}">${L(lang, 'Guides', 'Guías')}</a><a href="${page('/changelog', lang)}">${L(lang, "What's new", 'Novedades')}</a><a href="${page('/pro', lang)}">Pro</a><a href="${page('/about', lang)}">${L(lang, 'About', 'Acerca de')}</a><a href="${page('/privacy', lang)}">${L(lang, 'Privacy', 'Privacidad')}</a></nav></footer>`;

// .ssr-shell: readable by crawlers, hidden from people while the app boots (see index.html).
const shell = (lang, otherPath, inner) => `<div class="ssr-shell"><div class="page"><div class="page-inner">${nav(lang, otherPath)}${inner}${footer(lang)}</div></div></div>`;
const back = lang => `<a class="back-link" href="${page('/', lang)}">← ${L(lang, 'Back to the lab', 'Volver al lab')}</a>`;
const other = lang => L(lang, 'es', 'en');

export function homeBody(lang = 'en') {
  return shell(lang, page('/', other(lang)), `<header class="hub-hero"><p class="hub-kicker">${esc(SITE.author)} · ${L(lang, 'code playground', 'laboratorio de código')}</p><h1 class="hub-title">${esc(SITE.name)}</h1><p class="hub-sub">${esc(L(lang,
    'Free design and accessibility tools: color palettes, a WCAG contrast checker, design token conversion, type scales, easing curves, image trimming and more. Everything runs in your browser.',
    'Herramientas gratuitas de diseño y accesibilidad: paletas de colores, verificador de contraste WCAG, conversión de design tokens, escalas tipográficas, curvas de animación, recorte de imágenes y más. Todo funciona en tu navegador.'))}</p></header><main><h2 class="hub-section-title">${L(lang, 'Experiments', 'Experimentos')}</h2>${toolLinks(lang, null)}<h2 class="hub-section-title">${L(lang, 'Guides', 'Guías')}</h2>${guideLinks(lang, null)}</main>`);
}

export function toolBody(exp, lang = 'en') {
  const seo = getSeo(exp.id, lang);
  const features = seo.features?.length ? `<h2>${L(lang, 'What it does', 'Qué hace')}</h2><ul>${seo.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul>` : '';
  const faq = seo.faq?.length ? `<h2>${L(lang, 'FAQ', 'Preguntas frecuentes')}</h2>${seo.faq.map(f => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}` : '';
  const guide = GUIDES.find(g => g.tool === exp.id);
  const guideLink = guide ? `<p><a href="${guidePath(guide, lang)}">📖 ${esc(guide[lang].title)}</a></p>` : '';
  const intro = lang === 'es' ? seo.intro : seo.description || exp.description;
  return shell(lang, toolPath(exp, other(lang)), `<header class="tool-header">${back(lang)}<h1 class="tool-title">${esc(toolName(exp, lang))}</h1><p class="tool-desc">${esc(intro)}</p></header><main class="seo-static">${features}${faq}${guideLink}<h2>${L(lang, 'More free tools', 'Más herramientas gratuitas')}</h2>${toolLinks(lang, exp.id)}</main>`);
}

export function staticBody(id, lang = 'en') {
  const en = STATIC_PAGES.find(p => p.id === id);
  const p = lang === 'es' ? { ...en, ...STATIC_PAGES_ES[id] } : en;
  const otherPath = lang === 'es' ? en.path : STATIC_PAGES_ES[id].path;
  const sections = p.sections.map(sec => `<h2>${esc(sec.heading)}</h2>${sec.body.map(b => `<p>${esc(b)}</p>`).join('')}${
    sec.links ? `<ul>${sec.links.map(l => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`).join('')}</ul>` : ''}`).join('');
  return shell(lang, otherPath, `<header class="tool-header">${back(lang)}<h1 class="tool-title">${esc(p.title)}</h1><p class="tool-desc">${esc(p.description)}</p><p>${L(lang, 'Last updated', 'Última actualización:')} ${esc(p.updated)}</p></header><main class="seo-static">${sections}</main>`);
}

export function gamesBody(lang = 'en') {
  const games = active().filter(e => e.category === 'Games');
  return shell(lang, page('/games', other(lang)), `<header class="tool-header">${back(lang)}<h1 class="tool-title">${L(lang, 'Games', 'Juegos')}</h1><p class="tool-desc">${esc(GAMES_META(lang).description)}</p></header><main class="seo-static"><ul class="seo-links">${games.map(e => `<li><a href="${toolPath(e, lang)}">${esc(toolName(e, lang))}</a> — ${esc(toolBlurb(e, lang))}</li>`).join('')}</ul></main>`);
}

export function guidesBody(lang = 'en') {
  return shell(lang, page('/guides', other(lang)), `<header class="tool-header">${back(lang)}<h1 class="tool-title">${L(lang, 'Guides', 'Guías')}</h1><p class="tool-desc">${esc(GUIDES_META(lang).description)}</p></header><main class="seo-static">${guideLinks(lang, null)}</main>`);
}

const inline = text => esc(text).replace(/`([^`]+)`/g, '<code>$1</code>');

export function guideBody(g, lang = 'en') {
  const c = g[lang];
  const tool = experiments.find(e => e.id === g.tool);
  const blocks = SECTIONS[g.slug][lang].map(b => {
    if (b.h) return `<h2>${esc(b.h)}</h2>`;
    if (b.p) return `<p>${inline(b.p)}</p>`;
    if (b.list) return `<ul>${b.list.map(li => `<li>${inline(li)}</li>`).join('')}</ul>`;
    if (b.code) return `<pre class="code-block">${esc(b.code)}</pre>`;
    if (b.tip) return `<aside class="guide-tip">💡 ${inline(b.tip)}</aside>`;
    return '';
  }).join('');
  return shell(lang, guidePath(g, other(lang)), `<header class="tool-header guide-header"><a class="back-link" href="${page('/guides', lang)}">← ${L(lang, 'All guides', 'Todas las guías')}</a><h1 class="tool-title guide-title">${esc(c.title)}</h1><p class="tool-desc">${esc(c.description)}</p><p>${L(lang, 'By', 'Por')} ${esc(SITE.author)} · <time datetime="${g.date}">${g.date}</time> · ${g.minutes} min</p></header><article class="guide-body">${blocks}<p><a href="${toolPath(tool, lang)}">${L(lang, 'Open the tool', 'Abrir la herramienta')}: ${esc(toolName(tool, lang))} →</a></p></article><h2>${L(lang, 'More guides', 'Más guías')}</h2>${guideLinks(lang, g.slug)}`);
}

export function proBody(lang = 'en') {
  return shell(lang, page('/pro', other(lang)), `<header class="tool-header">${back(lang)}<h1 class="tool-title">Lab Pro</h1><p class="tool-desc">${esc(PRO_META(lang).description)}</p></header>`);
}

export function changelogBody(lang = 'en') {
  const items = CHANGELOG.map(e => `<article id="${e.id}"><time datetime="${e.date}">${e.date}</time><h2>${esc(e[lang].title)}</h2><p>${esc(e[lang].body)}</p></article>`).join('');
  return shell(lang, page('/changelog', other(lang)), `<header class="tool-header">${back(lang)}<h1 class="tool-title">${L(lang, "What's new", 'Novedades')}</h1></header><main class="seo-static">${items}</main>`);
}

// Newsletter confirm / unsubscribe landing pages (noindex; the app takes over).
export const SUBSCRIPTION_META = (action, lang) => ({
  title: action === 'confirm'
    ? L(lang, `Confirm your subscription — ${SITE.name}`, `Confirma tu suscripción — ${SITE.name}`)
    : L(lang, `Unsubscribe — ${SITE.name}`, `Darte de baja — ${SITE.name}`),
  description: SITE.description,
  path: page(action === 'confirm' ? '/confirm' : '/unsubscribe', lang),
  image: '/og/home.png',
  lang,
});

export function subscriptionBody(action, lang = 'en') {
  const title = action === 'confirm' ? L(lang, 'Confirming your subscription…', 'Confirmando tu suscripción…') : L(lang, 'Updating your subscription…', 'Actualizando tu suscripción…');
  return shell(lang, page('/', other(lang)), `<header class="tool-header">${back(lang)}<h1 class="tool-title">${title}</h1></header>`);
}

export function notFoundBody() {
  return shell('en', '/es', `<header class="tool-header"><h1 class="tool-title">Page not found</h1><p class="tool-desc">That page doesn’t exist (yet). Here’s everything in the lab:</p></header><main>${toolLinks('en', null)}</main>`);
}

const BODY_BLOCK = /<!-- body:start -->[\s\S]*?<!-- body:end -->/;
const LD_BLOCK = /<!-- ld:start -->[\s\S]*?<!-- ld:end -->/;

export function injectBody(html, body, ld = '') {
  return html
    .replace(BODY_BLOCK, `<!-- body:start -->${body}<!-- body:end -->`)
    .replace(LD_BLOCK, `<!-- ld:start -->${ld}<!-- ld:end -->`);
}

/* ---------- feeds ---------- */

export function rss(lang) {
  const items = [
    ...CHANGELOG.map(e => ({ title: e[lang].title, description: e[lang].body, link: absolute(page('/changelog', lang)) + `#${e.id}`, date: e.date, guid: `changelog-${e.id}-${lang}` })),
    ...GUIDES.map(g => ({ title: g[lang].title, description: g[lang].description, link: absolute(guidePath(g, lang)), date: g.date, guid: `guide-${g.slug}-${lang}` })),
  ].sort((a, b) => b.date.localeCompare(a.date));
  const self = absolute(lang === 'es' ? '/es/rss.xml' : '/rss.xml');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE.name)}${lang === 'es' ? ' (español)' : ''}</title>
    <link>${absolute(page('/', lang))}</link>
    <description>${esc(L(lang, 'New tools, guides and improvements.', 'Nuevas herramientas, guías y mejoras.'))}</description>
    <language>${lang}</language>
    <atom:link href="${self}" rel="self" type="application/rss+xml" />
${items.map(i => `    <item>
      <title>${esc(i.title)}</title>
      <link>${esc(i.link)}</link>
      <guid isPermaLink="false">${i.guid}</guid>
      <pubDate>${new Date(i.date + 'T12:00:00Z').toUTCString()}</pubDate>
      <description>${esc(i.description)}</description>
    </item>`).join('\n')}
  </channel>
</rss>
`;
}

export { HOME_META, toolPath, toolName, guidePath, page, absolute };
