# The Fun Lab — fun.alevasquez.dev

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
| `/component-states` | Button / input / card in every state, derived from one accent, with WCAG checks |

## Adding an experiment

1. Build the page in `src/pages/` and wrap it in `<ToolPage id="…">`.
2. Add a `<Route>` in `src/App.jsx`.
3. Add an entry to `src/experiments.js` (with `addedAt` so the hub shows a **New** badge to visitors who haven't opened it).

Everything else is derived from `experiments.js`: hub cards, `<title>`/meta/Open Graph tags, a prerendered `dist/<route>/index.html` (so link previews work on LinkedIn/X), `sitemap.xml` and the OG images (`scripts/og.mjs`, rendered at build time with bundled OFL fonts).

## Analytics

[Umami Cloud](https://cloud.umami.is) (free Hobby plan, cookieless). Paste the Website ID into `SITE.umamiWebsiteId` in `src/experiments.js`; when empty, no script is loaded. Custom events go through `track()` in `src/lib/analytics.js`.

## Scripts

```bash
npm run dev     # local dev server
npm run build   # OG images + production build into dist/
npm run lint    # oxlint
```
