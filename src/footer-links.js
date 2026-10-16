// Footer links, used by both footers: the app's (src/components/SiteFooter.jsx)
// and the prerendered HTML crawlers read first (scripts/meta.js). Add, remove
// or reorder links here only.
//   path: a page of this site (translated to its /es path automatically)
//   href: an external link (hrefEs for a different Spanish URL)
//   track: optional analytics event name for clicks
export const PORTFOLIO_URL = 'https://www.alevasquez.dev';

export const FOOTER_LINKS = [
  { path: '/guides', en: 'Guides', es: 'Guías' },
  { path: '/changelog', en: "What's new", es: 'Novedades' },
  { path: '/pro', en: 'Pro', es: 'Pro', track: 'Pro link' },
  { path: '/about', en: 'About', es: 'Acerca de' },
  // The portfolio's work and contact pages (links between the two sites
  // help search engines find both).
  { href: `${PORTFOLIO_URL}/projects`, en: 'Portfolio', es: 'Portafolio' },
  { href: `${PORTFOLIO_URL}/contact`, en: 'Contact', es: 'Contacto' },
  { path: '/privacy', en: 'Privacy', es: 'Privacidad' },
  { path: '/terms', en: 'Terms', es: 'Términos' },
  { path: '/refunds', en: 'Refunds', es: 'Reembolsos' },
  { href: '/rss.xml', hrefEs: '/es/rss.xml', en: 'RSS', es: 'RSS' },
];
