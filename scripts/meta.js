import { SITE } from '../src/experiments.js';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* The <head> tags for one page. Used for the dev server and for every
   prerendered route, so link previews work without running JS. */
export function renderMeta(meta) {
  const url = SITE.url + (meta.path === '/' ? '/' : meta.path);
  const image = SITE.url + meta.image;
  return [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(SITE.name)}" />`,
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

export function injectMeta(html, meta) {
  return html.replace(META_BLOCK, `<!-- meta:start -->\n    ${renderMeta(meta)}\n    <!-- meta:end -->`);
}
