# Ale's Fun Lab · fun.alevasquez.dev

Free design and accessibility tools, games and guides by Alejandro Vasquez. React 19 + Vite + Framer Motion, in English and Spanish, published on GitHub Pages.

This repo also holds the code layer of the portfolio (www.alevasquez.dev, built in Framer): see [framer/README.md](framer/README.md).

## Everyday commands

```bash
npm run dev       # local site at http://localhost:5173
npm run build     # OG images + production build into dist/ (what gets published)
npm run preview   # serve dist/ at http://localhost:4173 to check the real build
npm run lint      # oxlint
npm run perf      # PageSpeed-style mobile scores for the pages in scripts/perf-pages.json
```

**Publishing:** every push to `main` builds and publishes the site (GitHub Actions → GitHub Pages, `.github/workflows/deploy-ghpages.yml`, about 2 minutes). There is nothing to deploy by hand. `netlify.toml` is from the old host and isn't used.

## Where things live

| I want to change… | File |
| --- | --- |
| A tool's card (name, emoji, description, category, "New" date) | `src/experiments.js` |
| A tool's search title/description (English) | `src/seo.js` |
| A tool's Spanish name, slug and SEO copy | `src/seo-es.js` |
| A guide (title, slug, summary) / its article text | `src/guides.js` / `src/guide-sections.js` |
| About, Privacy, Terms, Refunds pages | `src/pages-content.js` |
| The Pro page (plugins, prices, FAQ) | `src/pro-content.js` |
| What's new (also the RSS feed) | `src/changelog.js` |
| Site name, analytics, newsletter, ads | `SITE` at the top of `src/experiments.js` |
| Colors, radii, fonts, spacing for the whole site | tokens in `:root` (dark) and `:root[data-theme='light']` at the top of `src/index.css` |
| Shared UI pieces (buttons, segmented control, cards, reveal) | `src/components/ui.jsx` |
| The page shell crawlers see (prerendered HTML) | `scripts/meta.js` |

Everything else is derived from those: hub cards, routes, `<title>`/meta/Open Graph tags, prerendered `dist/<route>.html` pages, `sitemap.xml`, RSS and the OG images.

## Adding things

### A tool or a game
1. Pick an `id` in kebab-case, e.g. `color-mixer`. Create `src/pages/ColorMixer.jsx`: **the file name must be the id in PascalCase**, because the build uses it to preload the page's code. Wrap the page in `<ToolPage id="color-mixer">` (copy a similar page as a start).
2. In `src/App.jsx`, add `const ColorMixer = lazy(() => import('./pages/ColorMixer'));` and `'color-mixer': ColorMixer` to `TOOLS`.
3. Add an entry to `experiments` in `src/experiments.js` (`category: 'Games'` puts it on /games), with `addedAt: 'YYYY-MM-DD'` for the **New** badge.
4. Add its English SEO copy to `src/seo.js` and its Spanish slug, name and copy to `src/seo-es.js`.
5. Write every visible string as `t('English', 'Español')` (from `useLang()`).
6. `npm run build && npm run preview`, open the page in both languages, then push.

### A guide
Add it to `src/guides.js` (both languages) and its sections to `src/guide-sections.js`. It's listed on /guides and the home automatically.

### A What's new entry
Add it at the top of `src/changelog.js`.

## Rules that keep the scores high

These are why mobile PageSpeed is 90+. Breaking one usually costs 10 to 30 points.

1. **The prerendered shell paints first.** Each page's HTML has a text version of the content (`.ssr-shell`, from `scripts/meta.js`) painted at 1% opacity under the boot loader, so the first and largest paints don't wait for JavaScript. Keep the shell's text a bit larger than the app's (`.js .ssr-shell p` in `index.html`), and keep system fonts in it.
2. **Nothing heavy before the first paint.** No new blocking `<script>`, font or stylesheet in `<head>` of `index.html`. The only third-party script is Umami (3 KB, `defer`, injected by `scripts/vite-plugin-pages.js`); anything bigger should load after the page has loaded.
3. **Small route CSS is inlined.** CSS under 2 KB that a page needs is put inside the HTML by the build (`scripts/vite-plugin-pages.js`); bigger CSS is preloaded.
4. **Animations stay.** Pause them off screen and in background tabs (`src/lib/perf.js`) rather than removing them. Fade in from opacity 0.01, not 0.
5. **Big pages render in two steps.** The home renders the hero first and the rest as a transition (`src/pages/Home.jsx`). Do the same if a page gets much bigger.
6. **Check before pushing anything that touches loading:** `npm run perf -- https://fun.alevasquez.dev/<page>` after publishing, or PageSpeed Insights. Run it twice: single runs vary by several points.

## Languages

Every page exists in English and Spanish. Spanish routes live under `/es` with translated slugs (`/es/verificador-de-contraste`); the EN/ES switch keeps the current page and its settings. Components translate inline with `t('English', 'Español')` from `useLang()` (`src/i18n.js`). The build prerenders both languages with `hreflang` alternates and a bilingual sitemap.

## Analytics and signups

- **Umami Cloud** (cookieless): `SITE.umamiWebsiteId`. Custom events go through `track()` in `src/lib/analytics.js`.
- **Newsletter / Pro waitlist:** `SITE.newsletter` (Kit, Buttondown, Formspree, Google Sheet or Brevo; see `src/lib/subscribe.js`).
- **Ads:** `SITE.adsenseClient` and `SITE.adSlots` (empty = no ads and no AdSense script).

Press ⌘K / Ctrl+K (or /) anywhere on the site for the command palette.
