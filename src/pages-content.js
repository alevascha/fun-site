// Static pages (About, Privacy, Terms, Refunds). Plain data so the same text renders in the
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
    updated: '2026-10-14',
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
        heading: 'Purchases and plugin licenses',
        body: [
          'Lab Pro purchases are handled by Lemon Squeezy, our Merchant of Record. Your payment details go to Lemon Squeezy, not to us; we receive your name, email, country and order details so we can deliver and support your license. The Figma plugins send your license key to Lemon Squeezy to check that it is valid, and store it in Figma’s plugin storage on your account. The plugins keep a count of your free uses in that same storage.',
        ],
        links: [{ label: 'Lemon Squeezy privacy policy', href: 'https://www.lemonsqueezy.com/privacy' }],
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
  {
    id: 'terms',
    path: '/terms',
    title: 'Terms of Service',
    metaTitle: "Terms of Service — Ale's Fun Lab",
    description: "The terms for using Ale's Fun Lab and for buying Lab Pro licenses for the lab's Figma plugins.",
    updated: '2026-10-14',
    sections: [
      {
        heading: 'Who we are',
        body: [
          "Ale's Fun Lab (fun.alevasquez.dev) is built and run by Alejandro Vasquez. The web tools on this site are free to use. Lab Pro is a paid license that unlocks the Figma plugins built from these tools.",
        ],
      },
      {
        heading: 'Payments and our reseller',
        body: [
          'Our order process is conducted by our online reseller Lemon Squeezy (Lemon Squeezy, LLC). Lemon Squeezy is the Merchant of Record for all our orders: it handles payments, taxes, invoices and customer service for orders, and its own terms of sale apply to your purchase.',
          'Prices are shown in US dollars. Taxes (such as VAT or sales tax) are calculated at checkout based on your location.',
        ],
        links: [{ label: 'Lemon Squeezy buyer terms', href: 'https://www.lemonsqueezy.com/buyer-terms' }],
      },
      {
        heading: 'What you can buy',
        body: [
          'Single plugin (one-time payment): unlocks the full version of one plugin, including its future updates.',
          'Lab Pro yearly (subscription): unlocks the full version of every plugin, including plugins released while your subscription is active. It renews every year until you cancel. If you cancel, you keep access until the end of the period you paid for.',
          'Lab Pro lifetime (one-time payment): unlocks the full version of every current and future plugin for as long as Lab Pro exists.',
          'Every plugin can be installed for free from Figma Community and includes a limited number of free uses, so you can try it before buying.',
        ],
      },
      {
        heading: 'Your license',
        body: [
          'Each license is for one person. You can activate it on the Figma accounts and devices you personally use, up to the activation limit shown at checkout. Please do not share, resell or publish your license key; keys that are shared publicly may be deactivated.',
          'Plugins check your license key with Lemon Squeezy when you activate it and from time to time after that. They need an internet connection for this check.',
        ],
      },
      {
        heading: 'Availability and changes',
        body: [
          'The plugins run inside Figma and depend on Figma’s platform. If Figma changes or removes something a plugin relies on, we will do our best to update the plugin, but we cannot guarantee that every feature will keep working forever.',
          'We may improve, change or retire plugins over time. If Lab Pro is ever discontinued, we will give at least 60 days of notice and keep current versions working for as long as Figma allows.',
        ],
      },
      {
        heading: 'Refunds',
        body: ['Refunds are covered by our Refund Policy.'],
        links: [{ label: 'Refund Policy', href: '/refunds' }],
      },
      {
        heading: 'Liability',
        body: [
          'The tools and plugins are provided “as is”. Always review the results before using them in production work (for example, check contrast results and generated styles). To the extent the law allows, our total liability for any claim is limited to the amount you paid for the license in the 12 months before the claim.',
        ],
      },
      {
        heading: 'Contact',
        body: ['Questions about these terms or your license? Write to hi@alevasquez.dev.'],
        links: [{ label: 'hi@alevasquez.dev', href: 'mailto:hi@alevasquez.dev' }],
      },
    ],
  },
  {
    id: 'refunds',
    path: '/refunds',
    title: 'Refund Policy',
    metaTitle: "Refund Policy — Ale's Fun Lab",
    description: 'How refunds work for Lab Pro licenses and single Figma plugins from Ale’s Fun Lab.',
    updated: '2026-10-14',
    sections: [
      {
        heading: 'Try before you buy',
        body: [
          'Every plugin includes free uses before it asks for a license, so you can check that it works for your files first.',
        ],
      },
      {
        heading: '14-day refund',
        body: [
          'If a plugin doesn’t work for you, ask for a refund within 14 days of your purchase and you will get your money back. This applies to single plugins, Lab Pro lifetime and the first payment of Lab Pro yearly. You don’t need to give a reason, although it helps us improve.',
          'When a refund is issued, the license key is deactivated.',
        ],
      },
      {
        heading: 'Subscription renewals',
        body: [
          'You can cancel Lab Pro yearly at any time from the link in your receipt or customer portal, and it will not renew. Renewal payments can be refunded if you ask within 14 days of the renewal date and have not used the Pro features since it renewed.',
        ],
      },
      {
        heading: 'How to ask for a refund',
        body: [
          'Email hi@alevasquez.dev with your order number or the email you used to buy. Refunds are processed by our reseller, Lemon Squeezy, to your original payment method and usually appear within 5 to 10 business days, depending on your bank.',
        ],
        links: [{ label: 'hi@alevasquez.dev', href: 'mailto:hi@alevasquez.dev' }],
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
        heading: 'Compras y licencias de los plugins',
        body: ['Las compras de Lab Pro las gestiona Lemon Squeezy, nuestro Merchant of Record. Tus datos de pago van a Lemon Squeezy, no a nosotros; recibimos tu nombre, correo, país y los detalles del pedido para entregar tu licencia y darte soporte. Los plugins de Figma envían tu clave de licencia a Lemon Squeezy para comprobar que es válida y la guardan en el almacenamiento de plugins de Figma de tu cuenta. Ahí mismo llevan la cuenta de tus usos gratis.'],
        links: [{ label: 'Política de privacidad de Lemon Squeezy', href: 'https://www.lemonsqueezy.com/privacy' }],
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
  terms: {
    path: '/es/terminos',
    title: 'Términos de servicio',
    metaTitle: "Términos de servicio — Ale's Fun Lab",
    description: "Los términos para usar Ale's Fun Lab y para comprar licencias Lab Pro de los plugins de Figma del lab.",
    sections: [
      {
        heading: 'Quiénes somos',
        body: ["Ale's Fun Lab (fun.alevasquez.dev) lo construye y administra Alejandro Vasquez. Las herramientas web de este sitio son gratuitas. Lab Pro es una licencia de pago que desbloquea los plugins de Figma hechos a partir de estas herramientas."],
      },
      {
        heading: 'Pagos y nuestro revendedor',
        body: [
          'Nuestro proceso de compra lo realiza nuestro revendedor en línea Lemon Squeezy (Lemon Squeezy, LLC). Lemon Squeezy es el Merchant of Record de todos nuestros pedidos: se encarga de los pagos, impuestos, facturas y atención de pedidos, y sus propios términos de venta aplican a tu compra.',
          'Los precios se muestran en dólares estadounidenses. Los impuestos (como el IVA) se calculan al pagar según tu ubicación.',
        ],
        links: [{ label: 'Términos de compra de Lemon Squeezy', href: 'https://www.lemonsqueezy.com/buyer-terms' }],
      },
      {
        heading: 'Qué puedes comprar',
        body: [
          'Un plugin (pago único): desbloquea la versión completa de un plugin, incluidas sus actualizaciones futuras.',
          'Lab Pro anual (suscripción): desbloquea la versión completa de todos los plugins, incluidos los que salgan mientras tu suscripción esté activa. Se renueva cada año hasta que la canceles. Si cancelas, mantienes el acceso hasta el final del periodo que pagaste.',
          'Lab Pro de por vida (pago único): desbloquea la versión completa de todos los plugins actuales y futuros mientras Lab Pro exista.',
          'Cada plugin se instala gratis desde Figma Community e incluye una cantidad limitada de usos gratis, para que lo pruebes antes de comprar.',
        ],
      },
      {
        heading: 'Tu licencia',
        body: [
          'Cada licencia es para una persona. Puedes activarla en las cuentas de Figma y dispositivos que usas personalmente, hasta el límite de activaciones indicado al comprar. No compartas, revendas ni publiques tu clave de licencia; las claves compartidas públicamente pueden desactivarse.',
          'Los plugins verifican tu clave con Lemon Squeezy al activarla y de vez en cuando después. Para eso necesitan conexión a internet.',
        ],
      },
      {
        heading: 'Disponibilidad y cambios',
        body: [
          'Los plugins funcionan dentro de Figma y dependen de su plataforma. Si Figma cambia o elimina algo que un plugin necesita, haremos lo posible por actualizarlo, pero no podemos garantizar que cada función siga funcionando para siempre.',
          'Podemos mejorar, cambiar o retirar plugins con el tiempo. Si Lab Pro llegara a cerrar, avisaremos con al menos 60 días de anticipación y mantendremos funcionando las versiones actuales mientras Figma lo permita.',
        ],
      },
      {
        heading: 'Reembolsos',
        body: ['Los reembolsos se rigen por nuestra Política de reembolso.'],
        links: [{ label: 'Política de reembolso', href: '/es/reembolsos' }],
      },
      {
        heading: 'Responsabilidad',
        body: ['Las herramientas y plugins se ofrecen “tal cual”. Revisa siempre los resultados antes de usarlos en trabajo de producción (por ejemplo, los resultados de contraste y los estilos generados). En la medida en que la ley lo permita, nuestra responsabilidad total ante cualquier reclamo se limita a lo que pagaste por la licencia en los 12 meses anteriores al reclamo.'],
      },
      {
        heading: 'Contacto',
        body: ['¿Preguntas sobre estos términos o tu licencia? Escribe a hi@alevasquez.dev.'],
        links: [{ label: 'hi@alevasquez.dev', href: 'mailto:hi@alevasquez.dev' }],
      },
    ],
  },
  refunds: {
    path: '/es/reembolsos',
    title: 'Política de reembolso',
    metaTitle: "Política de reembolso — Ale's Fun Lab",
    description: 'Cómo funcionan los reembolsos de las licencias Lab Pro y de los plugins de Figma individuales de Ale’s Fun Lab.',
    sections: [
      {
        heading: 'Prueba antes de comprar',
        body: ['Cada plugin incluye usos gratis antes de pedir una licencia, para que compruebes primero que funciona con tus archivos.'],
      },
      {
        heading: 'Reembolso en 14 días',
        body: [
          'Si un plugin no te sirve, pide el reembolso dentro de los 14 días posteriores a tu compra y te devolvemos el dinero. Aplica a plugins individuales, a Lab Pro de por vida y al primer pago de Lab Pro anual. No necesitas dar un motivo, aunque nos ayuda a mejorar.',
          'Al emitir un reembolso, la clave de licencia se desactiva.',
        ],
      },
      {
        heading: 'Renovaciones de la suscripción',
        body: ['Puedes cancelar Lab Pro anual en cualquier momento desde el enlace de tu recibo o del portal de cliente, y no se renovará. Los pagos de renovación se pueden reembolsar si lo pides dentro de los 14 días posteriores a la renovación y no has usado las funciones Pro desde entonces.'],
      },
      {
        heading: 'Cómo pedir un reembolso',
        body: ['Escribe a hi@alevasquez.dev con tu número de pedido o el correo con el que compraste. Los reembolsos los procesa nuestro revendedor, Lemon Squeezy, a tu método de pago original, y normalmente aparecen en 5 a 10 días hábiles, según tu banco.'],
        links: [{ label: 'hi@alevasquez.dev', href: 'mailto:hi@alevasquez.dev' }],
      },
    ],
  },
};

export const getStaticPage = (id, lang = 'en') => {
  const page = STATIC_PAGES.find(p => p.id === id);
  return lang === 'es' && STATIC_PAGES_ES[id] ? { ...page, ...STATIC_PAGES_ES[id] } : page;
};
