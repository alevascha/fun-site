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
          'I’m Alejandro Vasquez, a Design Systems Architect and UX & AI Interface Engineer with more than eight years of experience bridging design and engineering. These experiments are the fun side of that work — small tools I wished I had while building design systems.',
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
        heading: 'Newsletter and waitlist',
        body: [
          'If you subscribe to the newsletter or join the Lab Pro waitlist, your email address is stored by our email provider and used only to send you updates about the lab. You will receive a confirmation email first (when the provider supports it), every email includes an unsubscribe link, and you can ask for your address to be deleted at any time.',
        ],
      },
      {
        heading: 'Feedback',
        body: [
          'The “Was this tool useful?” buttons and the optional suggestion box send anonymous events to our analytics. Suggestions are stored as text, so please don’t include personal information in them.',
        ],
      },
      {
        heading: 'Storage in your browser',
        body: [
          'The site stores a few preferences in your browser’s local storage: your light/dark theme choice, your language, and which experiments you have already opened (for the “New” badges). This never leaves your device and you can clear it at any time from your browser settings.',
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

export const STATIC_PAGES_ES = {
  about: {
    path: '/es/acerca-de',
    title: 'Acerca de',
    metaTitle: "Acerca de Ale's Fun Lab",
    description: "Quién construye Ale's Fun Lab, por qué existen estas herramientas gratuitas de diseño y accesibilidad, y cómo contactarme.",
    sections: [
      {
        heading: 'Qué es esto',
        body: [
          "Ale's Fun Lab es una colección de herramientas gratuitas para diseñadores y desarrolladores front-end: paletas de colores accesibles, un verificador de contraste WCAG, un convertidor de design tokens, escalas tipográficas, curvas de animación, recorte de imágenes, una auditoría de accesibilidad y más.",
          'Todas las herramientas funcionan por completo en tu navegador. No hay cuentas, y los archivos que abres (imágenes, HTML, archivos de tokens) se procesan en tu dispositivo y nunca se suben.',
        ],
      },
      {
        heading: 'Quién lo construye',
        body: [
          'Soy Alejandro Vasquez, Design Systems Architect y UX & AI Interface Engineer con más de ocho años de experiencia uniendo diseño e ingeniería. Estos experimentos son el lado divertido de ese trabajo: pequeñas herramientas que me hubiera gustado tener mientras construía design systems.',
          'Puedes ver mi trabajo con clientes y mis casos de estudio en alevasquez.dev.',
        ],
      },
      {
        heading: 'Contacto',
        body: ['¿Encontraste un error, tienes una idea para una herramienta nueva o quieres trabajar conmigo? Escríbeme por LinkedIn o desde mi portafolio; los enlaces están abajo.'],
        links: [
          { label: 'alevasquez.dev', href: 'https://www.alevasquez.dev/' },
          { label: 'LinkedIn', href: 'https://www.linkedin.com/in/aledvascha/' },
        ],
      },
    ],
  },
  privacy: {
    path: '/es/privacidad',
    title: 'Política de privacidad',
    metaTitle: "Política de privacidad — Ale's Fun Lab",
    description: "Cómo trata tus datos Ale's Fun Lab: herramientas en el navegador, analítica sin cookies, newsletter, publicidad de Google AdSense y tus opciones.",
    sections: [
      {
        heading: 'En resumen',
        body: ['Las herramientas de este sitio funcionan en tu navegador. Las imágenes, el HTML, los archivos de tokens y los colores con los que trabajas se procesan en tu dispositivo y nunca se envían a un servidor. No hay cuentas.'],
      },
      {
        heading: 'Analítica',
        body: ['Usamos Umami Cloud para contar visitas y entender qué herramientas se usan. Umami no usa cookies ni recopila datos personales; registra información anónima como la página visitada, el sitio de origen, el navegador, el tipo de dispositivo y el país. También registramos eventos anónimos como “copió CSS” o “descargó un archivo”, sin su contenido.'],
      },
      {
        heading: 'Newsletter y lista de espera',
        body: ['Si te suscribes a la newsletter o te unes a la lista de espera de Lab Pro, tu correo se guarda en nuestro proveedor de email y se usa solo para enviarte novedades del lab. Primero recibirás un correo de confirmación (si el proveedor lo permite), cada correo incluye un enlace para darte de baja y puedes pedir que se borre tu dirección en cualquier momento.'],
      },
      {
        heading: 'Comentarios',
        body: ['Los botones “¿Te sirvió esta herramienta?” y el cuadro opcional de sugerencias envían eventos anónimos a nuestra analítica. Las sugerencias se guardan como texto, así que no incluyas datos personales.'],
      },
      {
        heading: 'Publicidad (Google AdSense)',
        body: [
          'Este sitio puede mostrar anuncios de Google AdSense. Proveedores externos, incluido Google, usan cookies para mostrar anuncios basados en tus visitas anteriores a este u otros sitios web.',
          'El uso de cookies publicitarias permite a Google y a sus socios mostrarte anuncios basados en tus visitas a este sitio y/u otros sitios de Internet. Puedes desactivar la publicidad personalizada en la Configuración de anuncios de Google, y desactivar el uso de cookies de algunos proveedores externos en aboutads.info.',
          'Donde la ley lo exige (por ejemplo en el Espacio Económico Europeo, el Reino Unido y Suiza), se te pedirá consentimiento antes de usar anuncios personalizados o cookies publicitarias.',
        ],
        links: [
          { label: 'Cómo usa Google los datos de los sitios que usan sus servicios', href: 'https://policies.google.com/technologies/partner-sites?hl=es' },
          { label: 'Configuración de anuncios de Google', href: 'https://adssettings.google.com/' },
          { label: 'Exclusión en aboutads.info', href: 'https://www.aboutads.info/choices/' },
        ],
      },
      {
        heading: 'Almacenamiento en tu navegador',
        body: ['El sitio guarda algunas preferencias en el almacenamiento local de tu navegador: tu tema claro/oscuro, tu idioma y qué experimentos ya abriste (para las etiquetas “Nuevo”). Nunca sale de tu dispositivo y puedes borrarlo cuando quieras desde la configuración de tu navegador.'],
      },
      {
        heading: 'Alojamiento',
        body: ['El sitio está alojado en un proveedor de hosting estático, que puede guardar registros estándar del servidor (como la dirección IP y el navegador) por seguridad y fiabilidad, según su propia política de privacidad.'],
      },
      {
        heading: 'Cambios y contacto',
        body: ['Si esta política cambia, también cambiará la fecha al inicio de esta página. Para preguntas sobre privacidad, contacta a Alejandro Vasquez a través de alevasquez.dev o LinkedIn.'],
        links: [
          { label: 'alevasquez.dev', href: 'https://www.alevasquez.dev/' },
          { label: 'LinkedIn', href: 'https://www.linkedin.com/in/aledvascha/' },
        ],
      },
    ],
  },
};

export const getStaticPage = (id, lang = 'en') => {
  const page = STATIC_PAGES.find(p => p.id === id);
  return lang === 'es' && STATIC_PAGES_ES[id] ? { ...page, ...STATIC_PAGES_ES[id] } : page;
};
