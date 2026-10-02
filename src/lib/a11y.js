import { contrastRatio } from './color';

/* A small, honest accessibility linter. It runs against a rendered document
   (a sandboxed iframe with scripts disabled), so it can check real layout:
   tap-target sizes and text contrast, not just markup.
   It catches common, mechanical problems — it is not a full WCAG audit. */

const MAX_PER_RULE = 40;

function snippet(el) {
  const html = el.outerHTML.replace(/\s+/g, ' ');
  const open = html.match(/^<[^>]+>/)?.[0] || html;
  return open.length > 140 ? open.slice(0, 137) + '…' : open;
}

const textOf = el => (el?.textContent || '').replace(/\s+/g, ' ').trim();

function byIds(doc, ids) {
  return ids.split(/\s+/).map(id => doc.getElementById(id)).filter(Boolean).map(textOf).join(' ').trim();
}

/* Simplified accessible-name computation (aria-labelledby → aria-label →
   native label/alt → content → title). */
export function accessibleName(el) {
  const doc = el.ownerDocument;
  if (el.getAttribute('aria-labelledby')) {
    const n = byIds(doc, el.getAttribute('aria-labelledby'));
    if (n) return n;
  }
  const aria = el.getAttribute('aria-label')?.trim();
  if (aria) return aria;
  const tag = el.tagName;
  if (tag === 'IMG' || (tag === 'INPUT' && el.type === 'image')) return el.getAttribute('alt')?.trim() || '';
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(tag)) {
    if (el.id) {
      const lbl = doc.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (lbl && textOf(lbl)) return textOf(lbl);
    }
    const wrap = el.closest('label');
    if (wrap && textOf(wrap)) return textOf(wrap);
    if (tag === 'INPUT' && ['submit', 'button', 'reset'].includes(el.type)) return el.value || (el.type === 'submit' ? 'Submit' : '');
    return el.getAttribute('title')?.trim() || '';
  }
  // Content: text plus alt text of images inside.
  let content = '';
  el.childNodes.forEach(node => {
    if (node.nodeType === 3) content += node.textContent;
    else if (node.nodeType === 1) {
      if (node.getAttribute('aria-hidden') === 'true') return;
      content += node.tagName === 'IMG' ? ` ${node.getAttribute('alt') || ''} ` : ` ${accessibleName(node) || textOf(node)} `;
    }
  });
  content = content.replace(/\s+/g, ' ').trim();
  return content || el.getAttribute('title')?.trim() || '';
}

function isHidden(el) {
  const win = el.ownerDocument.defaultView;
  for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
    if (n.hidden || n.getAttribute('aria-hidden') === 'true') return true;
    const cs = win.getComputedStyle(n);
    if (cs.display === 'none' || cs.visibility === 'hidden') return true;
  }
  return false;
}

function parseRgb(str) {
  const m = str.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const [r, g, b, a = 1] = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
  return { r, g, b, a };
}

function blend(top, bottom) {
  const a = top.a;
  return { r: top.r * a + bottom.r * (1 - a), g: top.g * a + bottom.g * (1 - a), b: top.b * a + bottom.b * (1 - a), a: 1 };
}

// Effective background: composite translucent layers up the tree; give up on images/gradients.
function backgroundOf(el) {
  const win = el.ownerDocument.defaultView;
  const layers = [];
  for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
    const cs = win.getComputedStyle(n);
    if (cs.backgroundImage && cs.backgroundImage !== 'none') return null;
    const c = parseRgb(cs.backgroundColor);
    if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; }
  }
  let bg = { r: 255, g: 255, b: 255, a: 1 };
  for (let i = layers.length - 1; i >= 0; i--) bg = blend(layers[i], bg);
  return bg;
}

const FOCUSABLE = 'a[href], button, input:not([type=hidden]), select, textarea, [tabindex], summary, [contenteditable="true"]';
const INTERACTIVE = 'a[href], button, input:not([type=hidden]), select, textarea, [role=button], [role=link], [role=checkbox], [role=switch], [role=tab], summary';

export function audit(doc, lang = 'en') {
  const L = (en, es) => (lang === 'es' ? es : en);
  const issues = [];
  const counts = {};
  const add = (rule, severity, wcag, message, el, fix) => {
    counts[rule] = (counts[rule] || 0) + 1;
    if (counts[rule] > MAX_PER_RULE) return;
    issues.push({ id: issues.length, rule, severity, wcag, message, fix, el, snippet: el ? snippet(el) : null });
  };
  const body = doc.body;
  if (!body) return { issues, passed: [] };
  const passed = new Set();

  // Document language
  const isFullDoc = !!doc.documentElement.getAttribute('data-full-doc');
  if (isFullDoc && !doc.documentElement.getAttribute('lang')) {
    add('html-lang', 'error', '3.1.1', L('The page has no lang attribute, so screen readers may use the wrong pronunciation.', 'La página no tiene atributo lang, así que los lectores de pantalla pueden pronunciar mal.'), null, L('Add lang="en" (or the right language) to <html>.', 'Agrega lang="es" (o el idioma correcto) a <html>.'));
  } else passed.add('Page language');

  // Images
  body.querySelectorAll('img').forEach(img => {
    if (isHidden(img)) return;
    const alt = img.getAttribute('alt');
    if (alt === null && !img.getAttribute('aria-label') && img.getAttribute('role') !== 'presentation') {
      add('img-alt', 'error', '1.1.1', L('Image has no alt attribute.', 'La imagen no tiene atributo alt.'), img, L('Describe the image in alt="…", or use alt="" if it is purely decorative.', 'Describe la imagen en alt="…", o usa alt="" si es solo decorativa.'));
    } else if (alt && /^(image|img|photo|picture|graphic|icon|logo)$|\.(png|jpe?g|gif|svg|webp)$/i.test(alt.trim())) {
      add('img-alt-quality', 'warning', '1.1.1', L(`Alt text “${alt}” doesn’t describe anything.`, `El texto alternativo “${alt}” no describe nada.`), img, L('Write what the image shows or does, not that it is an image.', 'Escribe qué muestra o hace la imagen, no que es una imagen.'));
    }
  });
  passed.add('Image alt text');

  // Form fields
  body.querySelectorAll('input:not([type=hidden]):not([type=submit]):not([type=button]):not([type=reset]):not([type=image]), select, textarea').forEach(field => {
    if (isHidden(field)) return;
    if (!accessibleName(field)) {
      const ph = field.getAttribute('placeholder');
      add('label', 'error', '1.3.1 · 4.1.2', ph ? L(`Field relies on its placeholder (“${ph}”) as a label.`, `El campo usa su placeholder (“${ph}”) como etiqueta.`) : L('Form field has no label.', 'El campo del formulario no tiene etiqueta.'), field, L('Add a visible <label for="…">. Placeholders disappear as soon as people type.', 'Agrega un <label for="…"> visible. Los placeholders desaparecen en cuanto la persona escribe.'));
    }
  });
  passed.add('Form labels');

  // Buttons & links need names
  body.querySelectorAll('button, [role=button], input[type=submit], input[type=button], input[type=image]').forEach(b => {
    if (isHidden(b)) return;
    if (!accessibleName(b)) add('button-name', 'error', '4.1.2', L('Button has no accessible name (icon-only?).', 'El botón no tiene nombre accesible (¿solo icono?).'), b, L('Add visible text, or aria-label="…" for icon buttons.', 'Agrega texto visible, o aria-label="…" en botones de solo icono.'));
  });
  body.querySelectorAll('a').forEach(a => {
    if (isHidden(a)) return;
    const name = accessibleName(a);
    if (!a.hasAttribute('href')) {
      if (a.getAttribute('role') !== 'button' && (a.getAttribute('onclick') || a.getAttribute('tabindex'))) add('link-href', 'warning', '2.1.1', L('Link without href — it can’t be reached by keyboard reliably.', 'Enlace sin href: no se puede alcanzar con el teclado de forma confiable.'), a, L('Use <button> for actions, or give the link a real href.', 'Usa <button> para acciones, o da al enlace un href real.'));
      return;
    }
    if (!name) add('link-name', 'error', '2.4.4 · 4.1.2', L('Link has no accessible name.', 'El enlace no tiene nombre accesible.'), a, L('Add link text, or alt text to the image inside it.', 'Agrega texto al enlace, o texto alternativo a la imagen que contiene.'));
    else if (/^(click here|here|read more|more|learn more|link|this)$/i.test(name)) add('link-purpose', 'warning', '2.4.4', L(`Link text “${name}” doesn’t say where it goes.`, `El texto del enlace “${name}” no dice a dónde lleva.`), a, L('Use descriptive text, e.g. “Read the pricing guide”.', 'Usa un texto descriptivo, por ejemplo “Lee la guía de precios”.'));
    if (a.getAttribute('href') === '#') add('link-href', 'warning', '2.1.1', L('Link points to "#".', 'El enlace apunta a "#".'), a, L('Use a <button> if this triggers an action.', 'Usa un <button> si esto ejecuta una acción.'));
  });
  passed.add('Button and link names');

  // Headings
  const headings = [...body.querySelectorAll('h1, h2, h3, h4, h5, h6, [role=heading]')].filter(h => !isHidden(h));
  const h1s = headings.filter(h => h.tagName === 'H1' || h.getAttribute('aria-level') === '1');
  if (headings.length && !h1s.length) add('heading-h1', 'warning', '1.3.1', L('There is no <h1>.', 'No hay ningún <h1>.'), headings[0], L('Give the page one <h1> that names it.', 'Dale a la página un <h1> que la nombre.'));
  if (h1s.length > 1) add('heading-h1', 'notice', '1.3.1', L(`There are ${h1s.length} <h1> elements.`, `Hay ${h1s.length} elementos <h1>.`), h1s[1], L('Usually one h1 per page reads best.', 'Normalmente se lee mejor con un solo h1 por página.'));
  let prev = 0;
  headings.forEach(h => {
    const level = Number(h.getAttribute('aria-level') || h.tagName.slice(1));
    if (prev && level > prev + 1) add('heading-order', 'warning', '1.3.1', L(`Heading jumps from h${prev} to h${level}.`, `El título salta de h${prev} a h${level}.`), h, L(`Use h${prev + 1} here, and style it with CSS if it should look smaller.`, `Usa h${prev + 1} aquí y dale estilo con CSS si debe verse más pequeño.`));
    if (!textOf(h)) add('heading-empty', 'error', '2.4.6', L('Empty heading.', 'Título vacío.'), h, L('Remove it or give it text.', 'Quítalo o dale texto.'));
    prev = level;
  });
  passed.add('Heading structure');

  // Duplicate ids
  const seen = new Map();
  body.querySelectorAll('[id]').forEach(el => {
    if (seen.has(el.id)) add('duplicate-id', 'warning', '4.1.1', L(`Duplicate id “${el.id}”.`, `id duplicado “${el.id}”.`), el, L('ids must be unique — labels and aria references break otherwise.', 'Los id deben ser únicos; si no, las etiquetas y referencias aria se rompen.'));
    else seen.set(el.id, el);
  });
  passed.add('Unique ids');

  // tabindex and aria-hidden on focusable
  body.querySelectorAll('[tabindex]').forEach(el => {
    if (Number(el.getAttribute('tabindex')) > 0) add('tabindex', 'warning', '2.4.3', L(`tabindex="${el.getAttribute('tabindex')}" changes the natural tab order.`, `tabindex="${el.getAttribute('tabindex')}" cambia el orden natural de tabulación.`), el, L('Use tabindex="0" (or nothing) and fix the order in the DOM instead.', 'Usa tabindex="0" (o nada) y corrige el orden en el DOM.'));
  });
  body.querySelectorAll('[aria-hidden="true"]').forEach(el => {
    const f = el.matches(FOCUSABLE) ? el : el.querySelector(FOCUSABLE);
    if (f && f.getAttribute('tabindex') !== '-1') add('aria-hidden-focus', 'error', '4.1.2', L('A focusable element is hidden from screen readers (aria-hidden).', 'Un elemento enfocable está oculto para los lectores de pantalla (aria-hidden).'), f, L('Remove aria-hidden, or take the element out of the tab order.', 'Quita aria-hidden, o saca el elemento del orden de tabulación.'));
  });
  passed.add('Focus order');

  // Tap targets (WCAG 2.2: 24×24 minimum, 44×44 enhanced)
  const win = doc.defaultView;
  body.querySelectorAll(INTERACTIVE).forEach(el => {
    if (isHidden(el)) return;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    // Inline links inside running text are exempt.
    if (el.tagName === 'A' && win.getComputedStyle(el).display === 'inline' && textOf(el.parentElement).length > textOf(el).length + 3) return;
    const size = `${Math.round(r.width)}×${Math.round(r.height)}px`;
    if (r.width < 24 || r.height < 24) add('target-size', 'error', '2.5.8', L(`Tap target is only ${size}.`, `El objetivo táctil mide solo ${size}.`), el, L('Make it at least 24×24px (44×44 is better) with padding or min-height.', 'Hazlo de al menos 24×24px (mejor 44×44) con padding o min-height.'));
    else if (r.width < 44 || r.height < 44) add('target-size-enhanced', 'notice', '2.5.5 (AAA)', L(`Tap target is ${size} — below the comfortable 44×44px.`, `El objetivo táctil mide ${size}, por debajo de los cómodos 44×44px.`), el, L('Consider 44×44px for touch, especially for primary actions.', 'Considera 44×44px para pantallas táctiles, sobre todo en acciones principales.'));
  });
  passed.add('Tap target size');

  // Text contrast
  const walker = doc.createTreeWalker(body, NodeFilter.SHOW_TEXT);
  const checked = new Set();
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const el = node.parentElement;
    if (!el || checked.has(el) || !node.textContent.trim() || isHidden(el)) continue;
    if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'TITLE'].includes(el.tagName)) continue;
    checked.add(el);
    const cs = win.getComputedStyle(el);
    const fg = parseRgb(cs.color);
    const bg = backgroundOf(el);
    if (!fg || !bg) continue;
    const color = fg.a < 1 ? blend(fg, bg) : fg;
    const ratio = contrastRatio(color, bg);
    const px = parseFloat(cs.fontSize);
    const large = px >= 24 || (px >= 18.66 && Number(cs.fontWeight) >= 700);
    const need = large ? 3 : 4.5;
    const disabled = el.closest('[disabled], [aria-disabled="true"]');
    if (ratio < need && !disabled) add('contrast', 'error', '1.4.3', L(`Text contrast is ${ratio.toFixed(2)}:1 (needs ${need}:1).`, `El contraste del texto es ${ratio.toFixed(2)}:1 (requiere ${need}:1).`), el, L('Darken the text or lighten the background — try the Contrast Checker in the lab.', 'Oscurece el texto o aclara el fondo; prueba el Verificador de contraste del lab.'));
  }
  passed.add('Text contrast');

  const failedRules = new Set(issues.map(i => i.rule));
  const ruleToPassed = {
    'Page language': ['html-lang'], 'Image alt text': ['img-alt', 'img-alt-quality'], 'Form labels': ['label'],
    'Button and link names': ['button-name', 'link-name', 'link-purpose', 'link-href'], 'Heading structure': ['heading-h1', 'heading-order', 'heading-empty'],
    'Unique ids': ['duplicate-id'], 'Focus order': ['tabindex', 'aria-hidden-focus'], 'Tap target size': ['target-size'], 'Text contrast': ['contrast'],
  };
  const passedList = [...passed].filter(p => !(ruleToPassed[p] || []).some(r => failedRules.has(r)));
  return { issues, passed: passedList };
}

export function score(issues) {
  const errors = issues.filter(i => i.severity === 'error').length;
  const warnings = issues.filter(i => i.severity === 'warning').length;
  return Math.max(0, Math.round(100 - errors * 9 - warnings * 3));
}

export const SAMPLE_HTML = `<!doctype html>
<html>
<head>
  <style>
    body { font-family: system-ui, sans-serif; margin: 24px; color: #222; }
    .card { max-width: 380px; padding: 24px; border-radius: 16px; background: #f6f4f2; }
    .muted { color: #aaa; font-size: 13px; }
    .icon-btn { width: 20px; height: 20px; border: 0; background: #ddd; border-radius: 6px; }
    .cta { padding: 12px 18px; border: 0; border-radius: 10px; background: #8b6cf0; color: #fff; }
    input { width: 100%; padding: 10px; margin: 8px 0; box-sizing: border-box; }
  </style>
</head>
<body>
  <div class="card">
    <img src="https://picsum.photos/seed/lab/80/80" width="80" height="80">
    <h1>Join the lab</h1>
    <h4>Get new experiments by email</h4>
    <p class="muted">No spam. Unsubscribe whenever you want.</p>
    <input type="email" placeholder="Email address">
    <input type="text" id="name" placeholder="Your name">
    <label for="name">Name</label>
    <button class="cta">Subscribe</button>
    <button class="icon-btn"><svg width="12" height="12"></svg></button>
    <p>Already a member? <a href="#">Click here</a></p>
  </div>
</body>
</html>`;

export const PASSED_ES = {
  'Page language': 'Idioma de la página', 'Image alt text': 'Texto alternativo', 'Form labels': 'Etiquetas de formularios',
  'Button and link names': 'Nombres de botones y enlaces', 'Heading structure': 'Estructura de títulos', 'Unique ids': 'ids únicos',
  'Focus order': 'Orden de foco', 'Tap target size': 'Tamaño de objetivos táctiles', 'Text contrast': 'Contraste del texto',
};
