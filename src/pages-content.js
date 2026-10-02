// Static pages (About, Privacy). Plain data so the same text renders in the
// React page and in the prerendered HTML (scripts/meta.js).

export const STATIC_PAGES = [
  {
    id: 'about',
    path: '/about',
    title: 'About',
    metaTitle: "About Ale's Fun Lab",
    description: "Who builds Ale's Fun Lab, why these free design and accessibility tools exist, and how to get in touch.",
    updated: '2026-10-02',
    sections: [
      {
        heading: 'What this is',
        body: [
          "Ale's Fun Lab is a collection of free tools for designers and front-end developers: accessible color palettes, a WCAG contrast checker, a design token converter, type scales, easing curves, image trimming, an accessibility audit and more.",
          'Every tool runs entirely in your browser. There are no accounts, and files you open (images, HTML, token files) are processed on your device and never uploaded.',
        ],
      },
      {
        heading: 'Who builds it',
        body: [
          'I’m Alejandro Vasquez, a UX Engineer and Design Systems Engineer with more than eight years of experience bridging design and engineering. These experiments are the fun side of that work — small tools I wished I had while building design systems.',
          'You can see my client work and case studies at alevasquez.dev.',
        ],
      },
      {
        heading: 'Get in touch',
        body: [
          'Found a bug, have an idea for a new tool, or want to work together? Reach out through LinkedIn or my portfolio — links below.',
        ],
        links: [
          { label: 'alevasquez.dev', href: 'https://www.alevasquez.dev/' },
          { label: 'LinkedIn', href: 'https://www.linkedin.com/in/aledvascha/' },
        ],
      },
    ],
  },
  {
    id: 'privacy',
    path: '/privacy',
    title: 'Privacy Policy',
    metaTitle: "Privacy Policy — Ale's Fun Lab",
    description: "How Ale's Fun Lab handles your data: in-browser tools, cookieless analytics, Google AdSense advertising and your choices.",
    updated: '2026-10-02',
    sections: [
      {
        heading: 'The short version',
        body: [
          'The tools on this site run in your browser. Images, HTML, token files and colors you work with are processed on your device and are never sent to a server. There are no accounts and no forms that collect personal information.',
        ],
      },
      {
        heading: 'Analytics',
        body: [
          'We use Umami Cloud to count visits and understand which tools are used. Umami does not use cookies and does not collect personal data; it records anonymized information such as the page visited, referrer, browser, device type and country. We also record anonymous events such as “copied CSS” or “downloaded a file”, without the content itself.',
        ],
      },
      {
        heading: 'Advertising (Google AdSense)',
        body: [
          'This site may show ads served by Google AdSense. Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this website or other websites.',
          'Google’s use of advertising cookies enables it and its partners to serve ads to you based on your visit to this site and/or other sites on the Internet. You can opt out of personalized advertising in Google’s Ads Settings, and opt out of some third-party vendors’ use of cookies for personalized advertising at aboutads.info.',
          'Where the law requires it (for example in the European Economic Area, the United Kingdom and Switzerland), you will be asked for consent before personalized ads or advertising cookies are used.',
        ],
        links: [
          { label: 'How Google uses data from sites that use its services', href: 'https://policies.google.com/technologies/partner-sites' },
          { label: 'Google Ads Settings', href: 'https://adssettings.google.com/' },
          { label: 'aboutads.info opt-out', href: 'https://www.aboutads.info/choices/' },
        ],
      },
      {
        heading: 'Storage in your browser',
        body: [
          'The site stores a few preferences in your browser’s local storage: your light/dark theme choice and which experiments you have already opened (for the “New” badges). This never leaves your device and you can clear it at any time from your browser settings.',
        ],
      },
      {
        heading: 'Hosting',
        body: [
          'The site is hosted by a static hosting provider, which may keep standard server logs (such as IP address and user agent) for security and reliability, under its own privacy policy.',
        ],
      },
      {
        heading: 'Changes and contact',
        body: [
          'If this policy changes, the date at the top of this page will change too. For questions about privacy, contact Alejandro Vasquez through alevasquez.dev or LinkedIn.',
        ],
        links: [
          { label: 'alevasquez.dev', href: 'https://www.alevasquez.dev/' },
          { label: 'LinkedIn', href: 'https://www.linkedin.com/in/aledvascha/' },
        ],
      },
    ],
  },
];

export const getStaticPage = id => STATIC_PAGES.find(p => p.id === id);
