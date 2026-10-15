// Lab Pro: plugins, pricing and FAQ. Plain data so the React page and the
// prerendered HTML (scripts/meta.js) show the same prices and wording.

export const FREE_USES = 10;

// The first plugins to launch; each one starts from a free web tool.
export const PRO_PLUGINS = [
  {
    emoji: '🎨', tool: '/palette-generator',
    en: { name: 'Palette Generator', pitch: 'Generate accessible tone scales and write them straight into Figma Variables and color styles, with contrast labels on every swatch.' },
    es: { name: 'Generador de paletas', pitch: 'Genera escalas de tonos accesibles y escríbelas directo en Variables y estilos de color de Figma, con etiquetas de contraste en cada muestra.' },
  },
  {
    emoji: '🌗', tool: '/contrast-checker',
    en: { name: 'Contrast Checker', pitch: 'Check every text layer in your selection against WCAG and fix failing pairs in place with the smallest color change.' },
    es: { name: 'Verificador de contraste', pitch: 'Revisa cada capa de texto de tu selección según WCAG y corrige en el lugar los pares que fallan con el menor cambio de color.' },
  },
  {
    emoji: '🔠', tool: '/type-scale',
    en: { name: 'Type Scale', pitch: 'Build a modular type scale and create the matching Figma text styles in one click, with fluid clamp() values ready for code.' },
    es: { name: 'Escala tipográfica', pitch: 'Arma una escala tipográfica modular y crea los estilos de texto de Figma en un clic, con valores clamp() fluidos listos para código.' },
  },
  {
    emoji: '👁️', tool: '/color-blindness',
    en: { name: 'Color Blindness Simulator', pitch: 'Preview any frame as people with protanopia, deuteranopia, tritanopia or achromatopsia see it, right next to the original.' },
    es: { name: 'Simulador de daltonismo', pitch: 'Mira cualquier frame como lo ven personas con protanopia, deuteranopia, tritanopia o acromatopsia, junto al original.' },
  },
];

// Shown as "coming next" to make the bundle's growth visible.
export const PRO_NEXT = {
  en: ['Image → Palette', 'Gradient & Mesh', 'Auto-Trim', 'Motion & Easing', 'Mini A11y Audit', 'Text Expansion'],
  es: ['Imagen → Paleta', 'Degradados y mesh', 'Auto-Trim', 'Movimiento y curvas', 'Mini auditoría a11y', 'Expansión de texto'],
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
    en: ['Yearly or lifetime?', 'Yearly is the cheapest way in and includes every new plugin while it is active. Lifetime costs more once, then covers every current and future plugin with no renewals.'],
    es: ['¿Anual o de por vida?', 'El anual es la forma más barata de empezar e incluye cada plugin nuevo mientras esté activo. El de por vida cuesta más una sola vez y cubre todos los plugins actuales y futuros, sin renovaciones.'],
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

export const PRO_CONTACT = 'hi@alevasquez.dev';

// Figma Community link for each tool's plugin. Leave null until the plugin is
// published; tool pages then show "coming soon" and link to /pro instead.
export const FIGMA_PLUGINS = {
  'palette-generator': null,
  'contrast-checker': null,
  'type-scale': null,
  'color-blindness': null,
};
