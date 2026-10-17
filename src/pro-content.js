// Lab Pro: plugins, pricing and FAQ. Plain data so the React page and the
// prerendered HTML (scripts/meta.js) show the same prices and wording.

export const FREE_USES = 10;

// The plugins, with what each one does (the same lists as their Figma
// Community pages). `tool` is the free web version, when there is one.
export const PRO_PLUGINS = [
  {
    emoji: '🎨', tool: '/palette-generator',
    en: { name: 'Palette Generator', pitch: 'One brand color in, a full color system out: OKLCH scales, semantic Light and Dark tokens as Variables, and code.',
      features: [['Scales', ['OKLCH: Tailwind 50-950, Material, Radix 1-12 or custom steps', 'Steps solved for the contrast targets you set', 'Hue shift, your exact color kept on its step', 'A neutral tinted with your brand']],
        ['System', ['Semantic Light and Dark tokens aliased to the scale', 'Alpha ramps as real RGBA', 'Updates Variables in place, with a preview first']],
        ['Checks and code', ['Step-on-step contrast grid, WCAG and APCA', 'Color-blind preview with warnings', 'CSS, Tailwind v3 and v4, SCSS, W3C tokens, OKLCH and P3']]] },
    es: { name: 'Generador de paletas', pitch: 'Un color de marca, un sistema completo: escalas OKLCH, tokens semánticos claro y oscuro como Variables, y código.',
      features: [['Escalas', ['OKLCH: Tailwind 50-950, Material, Radix 1-12 o pasos a medida', 'Pasos calculados para el contraste que pidas', 'Giro de tono, tu color exacto en su paso', 'Un neutro teñido con tu marca']],
        ['Sistema', ['Tokens semánticos claro y oscuro que apuntan a la escala', 'Rampas de transparencia en RGBA real', 'Actualiza las Variables en su lugar, con vista previa antes']],
        ['Revisión y código', ['Cuadrícula de contraste paso contra paso, WCAG y APCA', 'Vista con daltonismo y avisos', 'CSS, Tailwind v3 y v4, SCSS, tokens W3C, OKLCH y P3']]] },
  },
  {
    emoji: '🌗', tool: '/contrast-checker',
    en: { name: 'Contrast Checker', pitch: 'WCAG 2.2 and APCA for every text, border and icon, against what is really behind it, in every variable mode, fixed in place.',
      features: [['Measures', ['WCAG AA and AAA, never rounded up', 'APCA Lc side by side, or as the standard', 'Borders and icons at 3:1', 'Every variable mode: Light, Dark, high contrast']],
        ['Fixes', ['The closest passing color, same hue', 'The nearest passing token from your collection, rebound', 'Fix all in one undo step']],
        ['Works your way', ['Selection, page or every page', 'Two-color mode with a layer picker', 'Canvas marks, CSV and JSON']]] },
    es: { name: 'Verificador de contraste', pitch: 'WCAG 2.2 y APCA para cada texto, borde e ícono, contra lo que de verdad hay detrás, en cada modo de variables, corregido en el lugar.',
      features: [['Mide', ['WCAG AA y AAA, sin redondear hacia arriba', 'APCA Lc al lado, o como estándar', 'Bordes e íconos a 3:1', 'Cada modo de variables: claro, oscuro, alto contraste']],
        ['Corrige', ['El color más cercano que pasa, mismo tono', 'El token más cercano de tu colección que pasa, vinculado', 'Corrige todo con un solo deshacer']],
        ['A tu manera', ['Selección, página o todas las páginas', 'Modo de dos colores con selector de capas', 'Marcas en el lienzo, CSV y JSON']]] },
  },
  {
    emoji: '🔠', tool: '/type-scale',
    en: { name: 'Type Scale', pitch: 'A modular type scale as text styles and variables with Desktop, Tablet and Mobile modes, fluid clamp() for code.',
      features: [['Scale', ['Any ratio, rounding to 0.5, 1, even, 4pt or 8pt', 'Per-step overrides, baseline grid', 'Heading and body families']],
        ['Figma', ['Variables with a mode per breakpoint', 'Semantic aliases: Display, H1-H6, Body', 'A specimen per mode, updated in place', 'Audit the sizes in a file and snap them to the scale']],
        ['Code', ['CSS, SCSS, Tailwind v3 and v4, W3C tokens', 'Fluid space scale', 'Readability guardrails and a 200% preview']]] },
    es: { name: 'Escala tipográfica', pitch: 'Una escala tipográfica modular como estilos y variables con modos escritorio, tablet y móvil, y clamp() fluido para código.',
      features: [['Escala', ['Cualquier proporción, redondeo a 0.5, 1, pares, 4pt u 8pt', 'Ajustes por paso, retícula de línea base', 'Familia para títulos y para texto']],
        ['Figma', ['Variables con un modo por breakpoint', 'Alias semánticos: Display, H1-H6, Body', 'Un muestrario por modo, actualizado en su lugar', 'Audita los tamaños de un archivo y ajústalos a la escala']],
        ['Código', ['CSS, SCSS, Tailwind v3 y v4, tokens W3C', 'Escala de espaciado fluida', 'Alertas de legibilidad y vista al 200%']]] },
  },
  {
    emoji: '👁️', tool: '/color-blindness',
    en: { name: 'Color Blindness Simulator', pitch: 'Any frame, images included, as people with color blindness and low vision see it, with colors that collapse flagged.',
      features: [['Color vision', ['Protan, deutan and tritan, full and anomalous', 'Achromatopsia and achromatomaly', 'Severity slider, prevalence per type']],
        ['Low vision', ['Blur, cataract, contrast loss, bright light', 'Ghosting, tunnel vision, macular degeneration']],
        ['Checks', ['Colors that collapse, with a fix', 'Text whose contrast drops', 'Boards next to the frame, refreshed in place']]] },
    es: { name: 'Simulador de daltonismo', pitch: 'Cualquier frame, imágenes incluidas, como lo ven personas con daltonismo y baja visión, con los colores que se confunden marcados.',
      features: [['Visión del color', ['Protan, deutan y tritan, completos y anómalos', 'Acromatopsia y acromatomalía', 'Control de severidad, prevalencia de cada tipo']],
        ['Baja visión', ['Desenfoque, catarata, menos contraste, luz fuerte', 'Doble imagen, visión de túnel, degeneración macular']],
        ['Revisiones', ['Colores que se confunden, con una corrección', 'Texto cuyo contraste baja', 'Tableros junto al frame, actualizados en su lugar']]] },
  },
  {
    emoji: '🧭', accent: '#5cc8a8',
    en: { name: 'Token Drift', pitch: 'Finds every value that isn’t using your design system, across the whole file, and binds it to the closest token.',
      features: [['Finds', ['Colors, gradient stops, text and mixed runs', 'Effects, spacing, radius, stroke width, opacity', 'Detached instances, broken bindings, duplicate tokens']],
        ['Fixes', ['Closest token by role, with the distance shown', 'Bind every exact match in one undo step', 'Reattach instances keeping their text']],
        ['Your rules', ['Every page, any library or collection', 'Ignored values and allowed radii saved in the file', 'Coverage score and trend, CSV and Markdown']]] },
    es: { name: 'Token Drift', pitch: 'Encuentra cada valor que no usa tu design system, en todo el archivo, y lo vincula al token más cercano.',
      features: [['Encuentra', ['Colores, paradas de degradado, texto y tramos mixtos', 'Efectos, espaciado, radios, grosor de borde, opacidad', 'Instancias desvinculadas, variables rotas, tokens duplicados']],
        ['Corrige', ['El token más cercano según su rol, con la distancia', 'Vincula todas las coincidencias exactas con un solo deshacer', 'Revincula instancias conservando su texto']],
        ['Tus reglas', ['Todas las páginas, cualquier librería o colección', 'Valores ignorados y radios permitidos guardados en el archivo', 'Puntaje de cobertura y tendencia, CSV y Markdown']]] },
  },
  {
    emoji: '🔁', accent: '#7aa7ff',
    en: { name: 'Token Converter', pitch: 'Your variables and styles as code for any platform, on every Figma plan, with a changelog of what changed.',
      features: [['Outputs', ['CSS, SCSS, Tailwind v4 and v3, JS, TS, JSON', 'W3C tokens and Style Dictionary', 'SwiftUI, Android XML, Compose, Flutter', 'A Markdown table for docs and AI tools']],
        ['Control', ['Aliases kept or resolved, modes as selectors or media queries', 'Hex, RGB, HSL or OKLCH, rem with your base', 'Text, shadow and gradient styles as tokens', 'Saved profiles per platform']],
        ['Round trip', ['Changes since the last export, renames included', 'Import W3C tokens back into variables', 'Works in Dev Mode']]] },
    es: { name: 'Token Converter', pitch: 'Tus variables y estilos como código para cualquier plataforma, en cualquier plan de Figma, con un registro de lo que cambió.',
      features: [['Salidas', ['CSS, SCSS, Tailwind v4 y v3, JS, TS, JSON', 'Tokens W3C y Style Dictionary', 'SwiftUI, Android XML, Compose, Flutter', 'Una tabla en Markdown para documentación y herramientas de IA']],
        ['Control', ['Alias como referencias o resueltos, modos como selectores o media queries', 'Hex, RGB, HSL u OKLCH, rem con tu base', 'Estilos de texto, sombra y degradado como tokens', 'Perfiles guardados por plataforma']],
        ['Ida y vuelta', ['Cambios desde la última exportación, incluidos los renombres', 'Importa tokens W3C de vuelta a variables', 'Funciona en Dev Mode']]] },
  },
  {
    emoji: '♿', accent: '#ff9a6b',
    en: { name: 'A11y Handoff', pitch: 'Drafts the accessibility spec for a screen: focus order with roles, headings, alt text, forms and motion, for web, iOS or Android.',
      features: [['Drafts', ['Focus order with ARIA, VoiceOver or TalkBack names', 'Headings, landmarks and alt text', 'Form labels, required fields, autocomplete, errors', 'Motion that needs a reduced-motion note']],
        ['Checks', ['Touch targets for web, iOS and Android', 'Icon-only controls, heading jumps, small text', 'Violations, to review and passed']],
        ['Hands off', ['Canvas annotations, one layer per type', 'Native Dev Mode annotations', 'Tab through the stops, Markdown export']]] },
    es: { name: 'A11y Handoff', pitch: 'Redacta la especificación de accesibilidad de una pantalla: orden de foco con roles, títulos, texto alternativo, formularios y movimiento, para web, iOS o Android.',
      features: [['Redacta', ['Orden de foco con nombres de ARIA, VoiceOver o TalkBack', 'Títulos, regiones y texto alternativo', 'Etiquetas, campos obligatorios, autocompletado, errores', 'Movimiento que necesita una nota de movimiento reducido']],
        ['Revisa', ['Áreas táctiles para web, iOS y Android', 'Controles solo con ícono, saltos de títulos, texto pequeño', 'Fallas, por revisar y aprobados']],
        ['Entrega', ['Anotaciones en el lienzo, una capa por tipo', 'Anotaciones nativas de Dev Mode', 'Recorre el orden con Tab, exporta en Markdown']]] },
  },
  {
    emoji: '🌍', accent: '#ffce1f',
    en: { name: 'Text Stress Test', pitch: 'Your UI in German, Japanese, right-to-left and 11 more before it ships, with everything that breaks listed in pixels.',
      features: [['Languages', ['9 European languages, Russian, Chinese, Japanese, Korean', 'Pseudo-locale, right-to-left with mirrored layout', 'Tall scripts like Thai and Vietnamese']],
        ['Finds', ['Cut off, clipped, spilling, truncated, in pixels', 'Compound words wider than their box', 'Line heights too tight, frames that grow']],
        ['Works your way', ['Copies next to the frame, or in place with restore', 'Mixed styles kept, wrap or shrink to fit', 'CSV, JSON and Markdown report']]] },
    es: { name: 'Text Stress Test', pitch: 'Tu interfaz en alemán, japonés, de derecha a izquierda y 11 más antes de publicarla, con todo lo que se rompe en píxeles.',
      features: [['Idiomas', ['9 idiomas europeos, ruso, chino, japonés, coreano', 'Pseudo-idioma, de derecha a izquierda con el layout espejado', 'Escrituras altas como tailandés y vietnamita']],
        ['Encuentra', ['Texto cortado, recortado, desbordado o truncado, en píxeles', 'Palabras compuestas más anchas que su caja', 'Interlineado muy justo, frames que crecen']],
        ['A tu manera', ['Copias junto al frame, o en el lugar con restaurar', 'Conserva los estilos mixtos, ajusta o reduce para que entre', 'Reporte en CSV, JSON y Markdown']]] },
  },
];

// Shown as "coming next" to make the bundle's growth visible.
export const PRO_NEXT = {
  en: ['Image → Palette', 'Gradient & Mesh', 'Auto-Trim', 'Motion & Easing'],
  es: ['Imagen → Paleta', 'Degradados y mesh', 'Auto-Trim', 'Movimiento y curvas'],
};

export const PRO_PLANS = [
  {
    id: 'single',
    price: '$9', note: { en: 'one-time', es: 'pago único' },
    en: { name: 'One plugin', points: ['Full version of the plugin you choose', 'Updates for that plugin included', 'Upgrade to Lab Pro later for the difference'] },
    es: { name: 'Un plugin', points: ['Versión completa del plugin que elijas', 'Incluye las actualizaciones de ese plugin', 'Pasa a Lab Pro después pagando la diferencia'] },
  },
  {
    id: 'yearly', featured: true,
    price: '$29', note: { en: 'per year', es: 'al año' },
    en: { name: 'Lab Pro yearly', points: ['Every plugin, full version', 'New plugins included as they launch', 'Cancel anytime, keep access until the period ends'] },
    es: { name: 'Lab Pro anual', points: ['Todos los plugins, versión completa', 'Incluye los plugins nuevos a medida que salen', 'Cancela cuando quieras, mantienes el acceso hasta fin del periodo'] },
  },
  {
    id: 'lifetime',
    price: '$79', launch: '$49', note: { en: 'one-time', es: 'pago único' },
    en: { name: 'Lab Pro lifetime', points: ['Every current and future plugin', 'No renewals, ever', 'Launch price for the waitlist'] },
    es: { name: 'Lab Pro de por vida', points: ['Todos los plugins actuales y futuros', 'Sin renovaciones', 'Precio de lanzamiento para la lista de espera'] },
  },
];

export const PRO_FAQ = [
  {
    en: ['How does it work?', `Every plugin is free to install from Figma Community and includes ${FREE_USES} free uses. Exploring and previewing never counts; a use is when the plugin writes to your file (creates styles or Variables, applies colors, generates frames). After that, a license unlocks the full version.`],
    es: ['¿Cómo funciona?', `Cada plugin se instala gratis desde Figma Community e incluye ${FREE_USES} usos gratis. Explorar y previsualizar nunca cuenta; un uso es cuando el plugin escribe en tu archivo (crea estilos o Variables, aplica colores, genera frames). Después, una licencia desbloquea la versión completa.`],
  },
  {
    en: ['How do I use my license after paying?', 'Your license key arrives by email. Open any of the plugins in Figma, choose “Enter license” and paste it. With Lab Pro, paste the same key once in each plugin you use; each one remembers it on your Figma account.'],
    es: ['¿Cómo uso mi licencia después de pagar?', 'Tu clave de licencia llega por correo. Abre cualquiera de los plugins en Figma, elige “Ingresar licencia” y pégala. Con Lab Pro, pega la misma clave una vez en cada plugin que uses; cada uno la recuerda en tu cuenta de Figma.'],
  },
  {
    en: ['Can I use it on more than one computer?', 'Yes. Your license is linked to your Figma account, not to a computer, so it works anywhere you sign in to Figma. It can be linked to up to 2 Figma accounts you use yourself (for example, personal and work). Keys shared with other people stop working.'],
    es: ['¿Puedo usarla en más de una computadora?', 'Sí. Tu licencia queda vinculada a tu cuenta de Figma, no a una computadora, así que funciona donde sea que inicies sesión en Figma. Puede vincularse a hasta 2 cuentas de Figma que uses tú (por ejemplo, personal y del trabajo). Las claves compartidas con otras personas dejan de funcionar.'],
  },
  {
    en: ['I bought one plugin. Can I upgrade to Lab Pro?', 'Yes. Write to us and we will send you a discount code worth what you paid, so you only pay the difference.'],
    es: ['Compré un plugin. ¿Puedo pasar a Lab Pro?', 'Sí. Escríbenos y te enviamos un código de descuento por lo que pagaste, así solo pagas la diferencia.'],
  },
  {
    en: ['I lost my license key', 'Search your inbox for the email from Lemon Squeezy, or open my orders page at app.lemonsqueezy.com/my-orders with the email you used to buy. If you still can’t find it, write to us.'],
    es: ['Perdí mi clave de licencia', 'Busca en tu correo el email de Lemon Squeezy, o entra a app.lemonsqueezy.com/my-orders con el correo con el que compraste. Si aun así no la encuentras, escríbenos.'],
  },
  {
    en: ['Yearly or lifetime?', 'Yearly is the cheapest way in and includes every new plugin while it is active. Lifetime costs more once, then covers every current and future plugin with no renewals.'],
    es: ['¿Anual o de por vida?', 'El anual es la forma más barata de empezar e incluye cada plugin nuevo mientras esté activo. El de por vida cuesta más una sola vez y cubre todos los plugins actuales y futuros, sin renovaciones.'],
  },
  {
    en: ['Will the price go up?', 'Yes, as new plugins join Lab Pro the price for new buyers goes up. If you already bought, you keep everything with the same key, and yearly subscribers keep the price they signed up with while their subscription stays active.'],
    es: ['¿El precio va a subir?', 'Sí. A medida que se suman plugins nuevos a Lab Pro, el precio sube para quienes compren después. Si ya compraste, conservas todo con la misma clave, y quienes tienen el plan anual mantienen el precio con el que se suscribieron mientras su suscripción siga activa.'],
  },
  {
    en: ['Who processes the payment?', 'Lemon Squeezy, our merchant of record. They handle the checkout, taxes and invoices, and email you the license key right after you pay.'],
    es: ['¿Quién procesa el pago?', 'Lemon Squeezy, nuestro merchant of record. Se encargan del pago, los impuestos y las facturas, y te envían la clave de licencia por correo apenas pagas.'],
  },
  {
    en: ['Can I get a refund?', 'Yes. If a plugin doesn’t work for you, ask within 14 days of buying and you get your money back. See the Refund Policy for the details.'],
    es: ['¿Puedo pedir un reembolso?', 'Sí. Si un plugin no te sirve, pídelo dentro de los 14 días posteriores a la compra y te devolvemos el dinero. Los detalles están en la Política de reembolso.'],
  },
  {
    en: ['Will the web tools stay free?', 'Yes. Everything on this site stays free. Pro is for what only a plugin can do inside your Figma file.'],
    es: ['¿Las herramientas web seguirán siendo gratis?', 'Sí. Todo lo que hay en este sitio sigue siendo gratis. Pro es para lo que solo un plugin puede hacer dentro de tu archivo de Figma.'],
  },
];

// After paying: what happens with the license key, step by step.
export const PRO_STEPS = [
  {
    en: ['Choose a plan', 'Pay securely through Lemon Squeezy with a card or PayPal. Taxes are calculated at checkout.'],
    es: ['Elige un plan', 'Paga de forma segura con Lemon Squeezy, con tarjeta o PayPal. Los impuestos se calculan al pagar.'],
  },
  {
    en: ['Get your key by email', 'Your license key arrives in your inbox right after the payment. You can also find it in your Lemon Squeezy order page.'],
    es: ['Recibe tu clave por correo', 'Tu clave de licencia llega a tu correo apenas pagas. También la encuentras en la página de tu pedido en Lemon Squeezy.'],
  },
  {
    en: ['Paste it in any plugin', 'Open a plugin in Figma, choose “Enter license” and paste the key. It unlocks right away.'],
    es: ['Pégala en cualquier plugin', 'Abre un plugin en Figma, elige “Ingresar licencia” y pega la clave. Se desbloquea al instante.'],
  },
  {
    en: ['Use the same key everywhere', 'With Lab Pro, paste the same key once in each plugin you open. It stays linked to your Figma account, on up to 2 accounts.'],
    es: ['Usa la misma clave en todos', 'Con Lab Pro, pega la misma clave una vez en cada plugin que abras. Queda vinculada a tu cuenta de Figma, en hasta 2 cuentas.'],
  },
];

export const PRO_CONTACT = 'hi@alevasquez.dev';

// Figma Community link for each tool's plugin. Leave null until the plugin is
// published; tool pages then show "coming soon" and link to /pro instead.
export const FIGMA_PLUGINS = {
  'palette-generator': null,
  'contrast-checker': null,
  'type-scale': null,
  'color-blindness': null,
};
