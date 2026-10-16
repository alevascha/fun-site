# Portfolio code layer (www.alevasquez.dev)

The portfolio is designed and published in **Framer**. This folder holds everything around it that lives as code: the custom code pasted into Framer, the motion layer, and source files (logos, OG images, tokens).

Framer is the source of truth for layout, text and images. This folder is the source of truth for the code in **Framer → Site Settings → Code**. When the two disagree, the file here wins: paste it again.

## Custom code entries in Framer

Framer → Site Settings → Code. Each active entry has a file here:

| Entry in Framer | Placement | File in this folder | How it's made |
| --- | --- | --- | --- |
| **Ale intro loader (head)** | Start of `<head>` | `loader-head.html` | Edited by hand |
| **Ale motion layer** | End of `<body>` | `custom-code.html` | **Generated**: `npm run framer-snippet` |
| **Ale Google Analytics (deferred)** | End of `<body>` | `ga-deferred.html` | Edited by hand |

Entries marked *Disabled* in Framer are kept on purpose for reference (the old Lenis entry, Microsoft Clarity: see `removed-clarity.html`). Leave Framer's own Google Analytics field (Site Settings → General) **empty**: `ga-deferred.html` replaces it and loads GA without slowing the page down.

## Changing the motion layer (animations, intro, particles, orbit, cursor)

1. Edit `framer-fx.js` (plain JavaScript, comments explain each part).
2. Run `npm run framer-snippet` (from the repo root). It builds `public/portfolio-fx.js` (served from fun.alevasquez.dev and cached by browsers) and rewrites `custom-code.html` with a new version number.
3. Commit and push. The Fun Lab deploy publishes the new `portfolio-fx.js` in about 2 minutes.
4. In Framer, open **Ale motion layer**, select all, paste the content of `custom-code.html`, Save, then **Publish**. The version number in it makes every visitor get the new file.

Framer's Publish panel doesn't list code changes ("No changes" is normal); publishing still updates the site.

## Changing Google Analytics or the intro loader

Edit `ga-deferred.html` or `loader-head.html`, commit, then paste the whole file into its entry in Framer and Publish.

## Rules that keep the portfolio fast and accessible

- **Nothing loads before the first paint.** Third-party scripts go after load (see `ga-deferred.html`: it waits until the page is idle or a real tap, wheel or key press).
- **Image Resolution stays on Auto** for project and card images: lower settings blur them on retina screens. Framer already serves AVIF.
- **Logos and icons that are black or white** are vectors with the **Text** color style as fill, so they flip with light/dark mode (see `assets/`: the Cypress and Maestro logos). Don't use black PNG/SVG images for them.
- **Animations stay.** The motion layer pauses them off screen and in background tabs instead of removing them.
- After publishing anything structural, check mobile scores: `npm run perf` (or PageSpeed Insights, twice; runs vary).

## Other files

| Path | What it is |
| --- | --- |
| `assets/` | Source SVGs of tool logos made theme-safe (imported into Framer as vectors) |
| `logo/` | AV logo and favicons |
| `og/` | Open Graph images per page (`node scripts/og-portfolio.mjs`) |
| `linkedin/` | LinkedIn banner (`node scripts/linkedin-banner.mjs`) |
| `portfolio-images/`, `about-photos/`, `ale-profile-800.jpg` | Image sources uploaded to Framer |
| `tokens/` | Per-project brand tokens (fonts, colors, radii) shown by the `DesignSystemShowcase` component on project pages |
| `DesignSystemShowcase.tsx`, `Switcher.tsx` | Framer code components (paste into Framer's code editor) |
