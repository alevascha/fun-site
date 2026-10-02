// Single source of truth for the hub cards, per-page <title>/meta tags,
// the prerendered route HTML, the sitemap and the OG images (see
// scripts/vite-plugin-pages.js and scripts/og.mjs).
//
// Add a new entry here each time a new experiment is built.
// `path` must match a <Route> in App.jsx. Set `addedAt` (YYYY-MM-DD) so the
// hub can flag it as "New" for visitors who haven't opened it yet.
// Omit `path` (or set active:false) for a "coming soon" placeholder card.

import { SEO } from './seo.js';
import { ES, HOME_ES } from './seo-es.js';

export const SITE = {
  name: "Ale's Fun Lab",
  url: 'https://fun.alevasquez.dev',
  description: 'Free design and accessibility tools by Alejandro Vasquez: color palettes, WCAG contrast checker, design token converter, type scales, easing curves and more.',
  author: 'Alejandro Vasquez',
  authorUrl: 'https://www.alevasquez.dev/',
  sameAs: ['https://www.alevasquez.dev/', 'https://www.linkedin.com/in/aledvascha/'],
  // Umami Cloud (free Hobby plan, cookieless). Paste the Website ID from
  // cloud.umami.is → Settings → Websites. Empty = no analytics script.
  umamiWebsiteId: 'edf8df86-dccd-4aa7-9d8c-04e63ea232ab',
  // Google AdSense. After approval, paste your publisher id ("ca-pub-…") and
  // the ad unit slot ids from AdSense → Ads → By ad unit. Empty = no ads,
  // no AdSense script, no ads.txt.
  adsenseClient: '',
  // Email signups. provider: 'kit' | 'buttondown' | 'formspree' | 'sheets' |
  // 'brevo' — see src/lib/subscribe.js for what goes in `newsletter` and
  // `waitlist` for each. Empty `newsletter` = signup hidden in production
  // (still visible in dev so it can be styled). `waitlist` falls back to
  // `newsletter` when empty.
  // `key` must match SITE_KEY in scripts/apps-script/Code.gs (sheets only).
  newsletter: { provider: 'sheets', newsletter: 'https://script.google.com/macros/s/AKfycbwLyDZdElT5WIIDstqlLCGoOkspqWIYfgUJjsDdu-UjERwazPvda4YF6MTDSIxZDGon/exec', waitlist: '', key: 'flab_6aec59d0853784ae037c26e0' },
  adSlots: { hub: '', tool: '' },
};

export const experiments = [
  {
    id: 'palette-generator',
    category: 'Color',
    path: '/palette-generator',
    emoji: '🎨',
    accent: '#ff8a8a',
    title: 'Palette Generator',
    description: 'Pick a hue, choose a color harmony, and get a full accessible palette with live AA/AAA contrast checking.',
    addedAt: '2026-09-30',
    active: true,
  },
  {
    id: 'contrast-checker',
    category: 'Accessibility',
    path: '/contrast-checker',
    emoji: '🌗',
    accent: '#ffd56e',
    title: 'Contrast Checker',
    description: 'Paste two colors, see the WCAG ratio, and fix a failing pair with a single click.',
    addedAt: '2026-10-01',
    active: true,
  },
  {
    id: 'image-palette',
    category: 'Color',
    path: '/image-palette',
    emoji: '🖼️',
    accent: '#7cc4ff',
    title: 'Image → Palette',
    description: 'Drop in an image, pull out its dominant colors, and see which pairs are safe to use together.',
    addedAt: '2026-10-01',
    active: true,
  },
  {
    id: 'color-blindness',
    category: 'Accessibility',
    path: '/color-blindness',
    emoji: '👁️',
    accent: '#c792ff',
    title: 'Color Blindness Simulator',
    description: 'See a palette through protanopia, deuteranopia, tritanopia and achromatopsia — and catch colors that collapse.',
    addedAt: '2026-10-01',
    active: true,
  },
  {
    id: 'type-scale',
    category: 'Typography',
    path: '/type-scale',
    emoji: '🔠',
    accent: '#8af0c4',
    title: 'Type Scale Generator',
    description: 'Pick a base size and a ratio, get a full type scale with live preview, fluid clamp() and tokens to copy.',
    addedAt: '2026-10-01',
    active: true,
  },
  {
    id: 'gradient-generator',
    category: 'Color',
    path: '/gradient-generator',
    emoji: '🌈',
    accent: '#ff9ad5',
    title: 'Gradient & Mesh Generator',
    description: 'Linear, radial, conic or blobby mesh gradients — drag the points, shuffle the colors, copy the CSS.',
    addedAt: '2026-10-01',
    active: true,
  },
  {
    id: 'component-states',
    category: 'UI',
    path: '/component-states',
    emoji: '🧩',
    accent: '#ffb072',
    title: 'Component States Explorer',
    description: 'Buttons, inputs and cards in every state — hover, focus, pressed, disabled, error — side by side with contrast checks.',
    addedAt: '2026-10-01',
    active: true,
  },
  {
    id: 'token-converter',
    category: 'Design systems',
    path: '/token-converter',
    emoji: '🧬',
    accent: '#8af0c4',
    title: 'Design Token Converter',
    description: 'Paste W3C tokens, Tokens Studio or Figma Variables JSON and get CSS, SCSS, Tailwind v4 or SwiftUI — aliases included.',
    addedAt: '2026-10-02',
    active: true,
  },
  {
    id: 'motion-playground',
    category: 'Motion',
    path: '/motion-playground',
    emoji: '🎢',
    accent: '#cd57ff',
    title: 'Motion & Easing Playground',
    description: 'Drag cubic-bezier handles, tune a real spring, watch them race, and export motion tokens as CSS linear(), Framer Motion or SwiftUI.',
    addedAt: '2026-10-02',
    active: true,
  },
  {
    id: 'auto-trim',
    category: 'Assets',
    path: '/auto-trim',
    emoji: '✂️',
    accent: '#ffce1f',
    title: 'Auto-Trim',
    description: 'Drop in PNGs and get them back without the empty transparent edges — in bulk, in your browser, as one ZIP.',
    addedAt: '2026-10-02',
    active: true,
  },
  {
    id: 'text-expansion',
    category: 'UI',
    path: '/text-expansion',
    emoji: '🌍',
    accent: '#7cc4ff',
    title: 'Text Expansion Stress Test',
    description: 'See how a UI breaks in German, Spanish or pseudo-localized text — and which CSS fixes make it survive translation.',
    addedAt: '2026-10-02',
    active: true,
  },
  {
    id: 'a11y-audit',
    category: 'Accessibility',
    path: '/a11y-audit',
    emoji: '🔎',
    accent: '#3ddc84',
    title: 'Mini A11y Audit',
    description: 'Paste HTML and find missing alt text and labels, unnamed buttons, heading jumps, tiny tap targets and low contrast.',
    addedAt: '2026-10-02',
    active: true,
  },
  {
    id: 'multi-size',
    category: 'Assets',
    path: '/multi-size',
    emoji: '📐',
    accent: '#ff9ad5',
    title: 'Multi-size Preview',
    description: 'One message laid out across social and display-ad sizes, with platform safe zones and a draggable focal point. Export every PNG.',
    addedAt: '2026-10-02',
    active: true,
  },
  {
    id: 'mobile-preview',
    category: 'UI',
    path: '/mobile-preview',
    emoji: '📱',
    accent: '#6ee7d2',
    title: 'Mobile Preview',
    description: 'Open any website inside iPhone, Pixel, Galaxy and iPad frames at their real viewport sizes. Rotate it or compare four devices at once.',
    addedAt: '2026-10-02',
    active: true,
  },
];

export function getExperiment(id) {
  return experiments.find(e => e.id === id);
}

export const HOME_META = {
  title: `Free Design & Accessibility Tools — ${SITE.name}`,
  description: SITE.description,
  path: '/',
  image: '/og/home.png',
  lang: 'en',
  alternates: { en: '/', es: '/es' },
};

export function getSeo(id, lang = 'en') {
  return (lang === 'es' ? ES[id] : SEO[id]) || {};
}

export function getPageMeta(exp, lang = 'en') {
  const seo = getSeo(exp.id, lang);
  const es = lang === 'es' && ES[exp.id];
  return {
    title: `${seo.title || exp.title} — ${SITE.name}`,
    description: seo.description || exp.description,
    path: es ? `/es/${ES[exp.id].slug}` : exp.path,
    image: `/og/${exp.id}.png`,
    lang,
    alternates: { en: exp.path, es: `/es/${ES[exp.id]?.slug}` },
  };
}

export const HOME_META_ES = { ...HOME_ES, path: '/es', image: '/og/home.png', lang: 'es', alternates: { en: '/', es: '/es' } };
