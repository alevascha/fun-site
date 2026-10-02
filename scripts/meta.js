import { experiments, getPageMeta, getSeo, HOME_META, SITE } from '../src/experiments.js';
import { STATIC_PAGES } from '../src/pages-content.js';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const active = () => experiments.filter(e => e.active && e.path);
const absolute = path => SITE.url + (path === '/' ? '/' : path);

/* ---------- <head> ---------- */

export function renderMeta(meta, { noindex = false } = {}) {
  const url = absolute(meta.path);
  const image = SITE.url + meta.image;
  return [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    `<meta name="robots" content="${noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(SITE.name)}" />`,
    `<meta property="og:locale" content="en_US" />`,
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
  ].join('\n    ');
}

export const META_BLOCK = /<!-- meta:start -->[\s\S]*?<!-- meta:end -->/;

export function injectMeta(html, meta, opts) {
  return html.replace(META_BLOCK, `<!-- meta:start -->\n    ${renderMeta(meta, opts)}\n    <!-- meta:end -->`);
}

/* ---------- structured data (schema.org JSON-LD) ---------- */

const person = { '@type': 'Person', '@id': `${SITE.authorUrl}#person`, name: SITE.author, url: SITE.authorUrl, sameAs: SITE.sameAs, jobTitle: 'UX Engineer & Design Systems Engineer' };
const website = { '@type': 'WebSite', '@id': `${SITE.url}/#website`, name: SITE.name, url: `${SITE.url}/`, description: SITE.description, inLanguage: 'en', publisher: { '@id': person['@id'] } };

function jsonLd(graph) {
  // Escape "<" so content can never close the script tag.
  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>`;
}

export function homeJsonLd() {
  return jsonLd([
    website,
    person,
    {
      '@type': 'ItemList',
      name: 'Design and accessibility tools',
      itemListElement: active().map((e, i) => ({ '@type': 'ListItem', position: i + 1, url: absolute(e.path), name: getSeo(e.id).title || e.title })),
    },
  ]);
}

export function toolJsonLd(exp) {
  const seo = getSeo(exp.id);
  const meta = getPageMeta(exp);
  const graph = [
    website,
    person,
    {
      '@type': 'WebApplication',
      name: seo.title || exp.title,
      alternateName: exp.title,
      url: absolute(exp.path),
      description: meta.description,
      applicationCategory: 'DesignApplication',
      operatingSystem: 'Any (web browser)',
      browserRequirements: 'Requires JavaScript',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      image: SITE.url + meta.image,
      author: { '@id': person['@id'] },
      featureList: seo.features || [],
      datePublished: exp.addedAt,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE.name, item: `${SITE.url}/` },
        { '@type': 'ListItem', position: 2, name: exp.title, item: absolute(exp.path) },
      ],
    },
  ];
  if (seo.faq?.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: seo.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    });
  }
  return jsonLd(graph);
}

/* ---------- static body shell ----------
   Real HTML for crawlers that don't run JavaScript (and a fast first paint).
   React replaces it on mount with the interactive page, which renders the
   same headings, description, features and FAQ. */

const nav = `<nav class="site-nav" aria-label="Main"><a class="site-nav-brand" href="/"><span class="site-nav-logo">f</span><span class="site-nav-brand-text">${esc(SITE.name)}</span></a><a class="btn btn-primary btn-sm" href="${SITE.authorUrl}">alevasquez.dev ↗</a></nav>`;

const toolLinks = (exclude) => `<ul class="seo-links">${active().filter(e => e.id !== exclude).map(e => `<li><a href="${e.path}">${esc(e.title)}</a> — ${esc(e.description)}</li>`).join('')}</ul>`;

const footer = `<footer class="site-footer"><span>Built by <a href="${SITE.authorUrl}">${esc(SITE.author)}</a>, UX Engineer &amp; Design Systems Engineer.</span><nav class="footer-links" aria-label="Footer">${STATIC_PAGES.map(p => `<a href="${p.path}">${esc(p.title)}</a>`).join('')}</nav></footer>`;

export function homeBody() {
  return `<div class="page"><div class="page-inner">${nav}<header class="hub-hero"><p class="hub-kicker">${esc(SITE.author)} · code playground</p><h1 class="hub-title">${esc(SITE.name)}</h1><p class="hub-sub">Free design and accessibility tools: color palettes, a WCAG contrast checker, design token conversion, type scales, easing curves, image trimming and more. Everything runs in your browser.</p></header><main><h2 class="hub-section-title">Experiments</h2>${toolLinks(null)}</main>${footer}</div></div>`;
}

export function toolBody(exp) {
  const seo = getSeo(exp.id);
  const features = seo.features?.length ? `<h2>What it does</h2><ul>${seo.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul>` : '';
  const faq = seo.faq?.length ? `<h2>FAQ</h2>${seo.faq.map(f => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}` : '';
  return `<div class="page"><div class="page-inner">${nav}<header class="tool-header"><a class="back-link" href="/">← Back to the lab</a><h1 class="tool-title">${esc(exp.title)}</h1><p class="tool-desc">${esc(seo.description || exp.description)}</p></header><main class="seo-static">${features}${faq}<h2>More free tools</h2>${toolLinks(exp.id)}</main>${footer}</div></div>`;
}

export function staticBody(page) {
  const sections = page.sections.map(sec => `<h2>${esc(sec.heading)}</h2>${sec.body.map(p => `<p>${esc(p)}</p>`).join('')}${
    sec.links ? `<ul>${sec.links.map(l => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`).join('')}</ul>` : ''}`).join('');
  return `<div class="page"><div class="page-inner">${nav}<header class="tool-header"><a class="back-link" href="/">← Back to the lab</a><h1 class="tool-title">${esc(page.title)}</h1><p class="tool-desc">${esc(page.description)}</p><p>Last updated ${esc(page.updated)}</p></header><main class="seo-static">${sections}</main>${footer}</div></div>`;
}

export function notFoundBody() {
  return `<div class="page"><div class="page-inner">${nav}<header class="tool-header"><h1 class="tool-title">Page not found</h1><p class="tool-desc">That experiment doesn’t exist (yet). Here’s everything in the lab:</p></header><main>${toolLinks(null)}</main>${footer}</div></div>`;
}

const BODY_BLOCK = /<!-- body:start -->[\s\S]*?<!-- body:end -->/;
const LD_BLOCK = /<!-- ld:start -->[\s\S]*?<!-- ld:end -->/;

export function injectBody(html, body, ld = '') {
  return html
    .replace(BODY_BLOCK, `<!-- body:start -->${body}<!-- body:end -->`)
    .replace(LD_BLOCK, `<!-- ld:start -->${ld}<!-- ld:end -->`);
}

export { HOME_META };
