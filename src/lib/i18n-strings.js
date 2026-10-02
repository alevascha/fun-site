/* Sample UI strings in English plus real German and Spanish translations
   (German uses informal "du", as most product UIs do). Pseudo-localization
   is generated from English. */
export const STRINGS = {
  brand: { en: 'Lumen', de: 'Lumen', es: 'Lumen' },
  navHome: { en: 'Home', de: 'Startseite', es: 'Inicio' },
  navPricing: { en: 'Pricing', de: 'Preise', es: 'Precios' },
  navSettings: { en: 'Settings', de: 'Einstellungen', es: 'Configuración' },
  navSignOut: { en: 'Sign out', de: 'Abmelden', es: 'Cerrar sesión' },
  title: { en: 'Account settings', de: 'Kontoeinstellungen', es: 'Configuración de la cuenta' },
  tabOverview: { en: 'Overview', de: 'Übersicht', es: 'Resumen' },
  tabActivity: { en: 'Activity', de: 'Aktivität', es: 'Actividad' },
  tabBilling: { en: 'Billing', de: 'Abrechnung', es: 'Facturación' },
  label: { en: 'Email address', de: 'E-Mail-Adresse', es: 'Correo electrónico' },
  placeholder: { en: 'you@example.com', de: 'du@beispiel.de', es: 'tu@ejemplo.com' },
  help: { en: 'We’ll never share your email.', de: 'Wir geben deine E-Mail-Adresse niemals weiter.', es: 'Nunca compartiremos tu correo.' },
  save: { en: 'Save changes', de: 'Änderungen speichern', es: 'Guardar cambios' },
  cancel: { en: 'Cancel', de: 'Abbrechen', es: 'Cancelar' },
  badge: { en: 'New', de: 'Neu', es: 'Nuevo' },
  cardTitle: { en: 'Upgrade your plan', de: 'Tarif upgraden', es: 'Mejora tu plan' },
  cardBody: { en: 'Get unlimited projects and priority support.', de: 'Erhalte unbegrenzte Projekte und bevorzugten Support.', es: 'Obtén proyectos ilimitados y soporte prioritario.' },
  addToCart: { en: 'Add to cart', de: 'In den Warenkorb', es: 'Añadir al carrito' },
  colStatus: { en: 'Status', de: 'Status', es: 'Estado' },
  colUpdated: { en: 'Last updated', de: 'Zuletzt aktualisiert', es: 'Última actualización' },
  colActions: { en: 'Actions', de: 'Aktionen', es: 'Acciones' },
  rowStatus: { en: 'Active', de: 'Aktiv', es: 'Activo' },
  rowUpdated: { en: '2 days ago', de: 'vor 2 Tagen', es: 'hace 2 días' },
  rowAction: { en: 'Edit', de: 'Bearbeiten', es: 'Editar' },
  toast: { en: 'Your changes were saved', de: 'Deine Änderungen wurden gespeichert', es: 'Tus cambios se guardaron' },
  toastAction: { en: 'Undo', de: 'Rückgängig machen', es: 'Deshacer' },
};

const ACCENTS = {
  a: 'á', b: 'ƀ', c: 'ç', d: 'ð', e: 'é', f: 'ƒ', g: 'ĝ', h: 'ĥ', i: 'í', j: 'ĵ', k: 'ķ', l: 'ļ', m: 'ɱ',
  n: 'ñ', o: 'ö', p: 'þ', q: 'ǫ', r: 'ŕ', s: 'š', t: 'ţ', u: 'û', v: 'ṽ', w: 'ŵ', x: 'ẋ', y: 'ý', z: 'ž',
  A: 'Å', B: 'Ɓ', C: 'Ç', D: 'Ð', E: 'É', F: 'Ƒ', G: 'Ĝ', H: 'Ĥ', I: 'Í', J: 'Ĵ', K: 'Ķ', L: 'Ļ', M: 'Ṁ',
  N: 'Ñ', O: 'Ö', P: 'Þ', Q: 'Ǫ', R: 'Ŕ', S: 'Š', T: 'Ţ', U: 'Û', V: 'Ṽ', W: 'Ŵ', X: 'Ẋ', Y: 'Ý', Z: 'Ž',
};

/* IBM's guideline for how much English grows when translated, by length. */
function expansionFor(len) {
  if (len <= 10) return 1.0;
  if (len <= 20) return 0.8;
  if (len <= 30) return 0.6;
  if (len <= 50) return 0.5;
  if (len <= 70) return 0.4;
  return 0.3;
}

const FILLER = ' lorem ipsum dolor sit amet consectetur';

export function pseudo(text, intensity = 1) {
  const accented = [...text].map(ch => ACCENTS[ch] || ch).join('');
  const extra = Math.round(text.length * expansionFor(text.length) * intensity);
  let pad = '';
  while (pad.length < extra) pad += FILLER;
  return `⟦${accented}${pad.slice(0, extra).replace(/[a-z]/g, ch => ACCENTS[ch] || ch)}⟧`;
}

export function translate(key, lang, intensity) {
  const s = STRINGS[key];
  if (lang === 'pseudo') return pseudo(s.en, intensity);
  return s[lang] || s.en;
}

export const LANGS = [
  { value: 'en', label: 'English', lang: 'en' },
  { value: 'de', label: 'Deutsch', lang: 'de' },
  { value: 'es', label: 'Español', lang: 'es' },
  { value: 'pseudo', label: 'Pseudo', lang: 'en' },
];
