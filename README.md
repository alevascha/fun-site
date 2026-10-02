# Ale's Fun Lab — fun.alevasquez.dev

A playground of small design-engineering tools by Alejandro Vasquez. React 19 + Vite + Framer Motion, styled after [alevasquez.dev](https://www.alevasquez.dev/), deployed on Netlify.

## Experiments

| Route | What it does |
| --- | --- |
| `/palette-generator` | Hue wheel + harmonies → full tonal palette with live WCAG AA/AAA checks and one-click fixes |
| `/contrast-checker` | Two colors → ratio, every WCAG check, one-click fix for text or background, shareable URL |
| `/image-palette` | Image → dominant colors (k-means, in-browser) → contrast matrix and passing pairs |
| `/color-blindness` | Palette under protan/deutan/tritan/achromat simulation (Machado 2009), flags colors that collapse |
| `/type-scale` | Modular type scale, static or fluid `clamp()`, CSS / design-token export |
| `/gradient-generator` | Linear, radial, conic and draggable mesh gradients with CSS export |
| `/component-states` | Button / input / toggle / checkbox / card in every state, derived from one accent, with WCAG checks |
| `/token-converter` | W3C / Tokens Studio / Figma Variables JSON → CSS, SCSS, Tailwind v4, SwiftUI, flat JSON (aliases resolved or kept) |
| `/motion-playground` | Cubic-bezier editor + spring simulator, racing preview, export as CSS `linear()`, tokens, Framer Motion, SwiftUI |
| `/auto-trim` | Bulk-trim transparent (or solid) edges from images in the browser, download as ZIP |
| `/text-expansion` | Sample UI in English / German / Spanish / pseudo-loc, fragile vs resilient CSS, detects clipped text |
| `/a11y-audit` | Paste HTML → sandboxed render → alt text, labels, names, headings, tap targets, contrast |
| `/multi-size` | One creative across social + IAB ad sizes with safe zones, focal point, PNG/ZIP export |

## Languages

Every page exists in English and Spanish. Spanish routes live under `/es` with translated slugs (`/es/verificador-de-contraste`), and the header has an EN/ES switch that keeps the current page (and its settings). Components translate inline with `t('English', 'Español')` from `useLang()` (`src/i18n.js`); Spanish SEO copy for each tool is in `src/seo-es.js`. The build prerenders both languages with `hreflang` alternates and a bilingual sitemap.

## Content

- **Guides** — `src/guides.js` (titles, slugs) + `src/guide-sections.js` (article bodies), both languages. Each guide links to its tool and gets `TechArticle` structured data.
- **What's new** — `src/changelog.js`, published at `/changelog` and as `/rss.xml` (`/es/rss.xml`).
- **Newsletter / Lab Pro waitlist** — Brevo forms; paste the form action URLs into `SITE.newsletter` in `src/experiments.js`.

## Adding an experiment

1. Build the page in `src/pages/` and wrap it in `<ToolPage id="…">`.
2. Add a `<Route>` in `src/App.jsx`.
3. Add an entry to `src/experiments.js` (with `addedAt` so the hub shows a **New** badge to visitors who haven't opened it), its search copy to `src/seo.js` and its Spanish version (slug, name, copy) to `src/seo-es.js`.
4. Wrap the page's strings in `t('…', '…')`.

Everything else is derived from `experiments.js`: hub cards, `<title>`/meta/Open Graph tags, a prerendered `dist/<route>.html` (so link previews work on LinkedIn/X), `sitemap.xml` and the OG images (`scripts/og.mjs`, rendered at build time with bundled OFL fonts).

## Analytics

[Umami Cloud](https://cloud.umami.is) (free Hobby plan, cookieless). Paste the Website ID into `SITE.umamiWebsiteId` in `src/experiments.js`; when empty, no script is loaded. Custom events go through `track()` in `src/lib/analytics.js`.

## Scripts

```bash
npm run dev     # local dev server
npm run build   # OG images + production build into dist/
npm run lint    # oxlint

Press ⌘K / Ctrl+K (or /) anywhere for the command palette.
```
