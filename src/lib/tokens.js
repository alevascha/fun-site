import { rgbToHex, rgbToHsl, hexToRgb } from './color';

/* Design token parsing + conversion.
   Inputs understood:
   - W3C Design Tokens (DTCG): { group: { token: { $value, $type } } }, $type inherited from groups
   - Tokens Studio: { group: { token: { value, type } } }
   - Figma Variables (plugin "collections" export): { collections: [{ name, modes: [{ name, variables: [{ name, type, value }] }] }] }
   - Flat maps: { "color/brand/500": "#8B6CF0", "space.sm": "8px" }
   Aliases like "{color.brand.500}" are resolved, and kept as references where the
   output format supports it (CSS / SCSS / Tailwind). */

const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const ALIAS = /^\{([^}]+)\}$/;

export function kebab(s) {
  return String(s)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_./]+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

export function camel(parts) {
  const words = parts.flatMap(p => kebab(p).split('-')).filter(Boolean);
  const out = words.map((w, i) => (i === 0 ? w : w[0].toUpperCase() + w.slice(1))).join('');
  return /^[0-9]/.test(out) ? '_' + out : out;
}

function inferType(value, path) {
  const name = path.join('.').toLowerCase();
  if (Array.isArray(value) && value.length === 4 && value.every(n => typeof n === 'number')) return 'cubicBezier';
  if (isObj(value) && ('r' in value && 'g' in value && 'b' in value)) return 'color';
  if (isObj(value) && 'colorSpace' in value) return 'color';
  if (typeof value === 'number') {
    if (/weight/.test(name)) return 'fontWeight';
    if (/duration|delay/.test(name)) return 'duration';
    if (/opacity|line-?height|ratio|z-?index/i.test(name)) return 'number';
    return 'dimension';
  }
  if (typeof value === 'string') {
    if (ALIAS.test(value)) return 'alias';
    if (/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value) || /^(rgb|hsl|oklch|color)a?\(/i.test(value)) return 'color';
    if (/^-?\d*\.?\d+(px|rem|em|%|vw|vh)$/.test(value)) return 'dimension';
    if (/^-?\d*\.?\d+m?s$/.test(value)) return 'duration';
    if (/font|family/.test(name)) return 'fontFamily';
  }
  return 'string';
}

const FIGMA_TYPES = { COLOR: 'color', FLOAT: 'number', STRING: 'string', BOOLEAN: 'boolean' };

// Tokens Studio / older type names → DTCG types.
const TYPE_ALIASES = {
  spacing: 'dimension', sizing: 'dimension', borderRadius: 'dimension', borderWidth: 'dimension',
  fontSizes: 'dimension', fontSize: 'dimension', letterSpacing: 'dimension', paragraphSpacing: 'dimension',
  fontFamilies: 'fontFamily', fontWeights: 'fontWeight', lineHeights: 'number', opacity: 'number',
  boxShadow: 'shadow', other: 'string', text: 'string',
};
const DIMENSION_NAME = /space|spacing|gap|radius|size|width|height|inset|offset/i;

/* ---------- parsing ---------- */

export function parseTokens(text, modeName) {
  const data = JSON.parse(text);
  if (Array.isArray(data?.collections)) return parseFigmaCollections(data, modeName);
  const tokens = [];
  walk(data, [], undefined, tokens);
  const format = tokens.some(t => t.dtcg) ? 'W3C Design Tokens (DTCG)' : tokens.some(t => t.studio) ? 'Tokens Studio' : 'Flat key/value map';
  return { tokens: expandComposites(tokens), format, modes: [], mode: null };
}

function walk(node, path, inheritedType, out) {
  if (isObj(node) && '$value' in node) {
    out.push({ path, type: node.$type || inheritedType, raw: node.$value, description: node.$description, dtcg: true });
    return;
  }
  if (isObj(node) && 'value' in node && ('type' in node || !isObj(node.value))) {
    out.push({ path, type: node.type, raw: node.value, description: node.description, studio: true });
    return;
  }
  if (isObj(node)) {
    const type = node.$type || inheritedType;
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('$')) continue;
      walk(v, [...path, ...k.split('/').filter(Boolean)], type, out);
    }
    return;
  }
  out.push({ path, type: inheritedType, raw: node });
}

function parseFigmaCollections(data, modeName) {
  // Modes worth switching between come from collections that have more than one.
  const themed = data.collections.filter(c => (c.modes || []).length > 1);
  const modes = [...new Set((themed.length ? themed : data.collections).flatMap(c => (c.modes || []).map(m => m.name)))];
  const mode = modes.includes(modeName) ? modeName : modes[0];
  const tokens = [];
  for (const col of data.collections) {
    const m = (col.modes || []).find(x => x.name === mode) || col.modes?.[0];
    for (const v of m?.variables || []) {
      let raw = v.value;
      if (isObj(raw) && raw.name && (raw.collection || v.isAlias)) raw = `{${[raw.collection || col.name, raw.name].join('/').split('/').join('.')}}`;
      tokens.push({ path: [col.name, ...String(v.name).split('/')], type: FIGMA_TYPES[v.type] || v.type?.toLowerCase(), raw });
    }
  }
  return { tokens: expandComposites(tokens), format: 'Figma Variables (collections)', modes, mode };
}

// Typography composites become one token per property, so every format can express them.
function expandComposites(tokens) {
  const out = [];
  for (const t of tokens) {
    if ((t.type === 'typography' || (!t.type && isObj(t.raw) && 'fontSize' in t.raw)) && isObj(t.raw)) {
      const map = { fontFamily: 'fontFamily', fontSize: 'dimension', fontWeight: 'fontWeight', lineHeight: 'number', letterSpacing: 'dimension' };
      for (const [k, type] of Object.entries(map)) {
        if (t.raw[k] !== undefined) out.push({ ...t, path: [...t.path, k], type, raw: t.raw[k] });
      }
    } else out.push(t);
  }
  return out;
}

/* ---------- resolution + normalization ---------- */

const keyOf = path => path.map(p => kebab(p)).join('.');

export function resolveTokens(tokens) {
  const byKey = new Map(tokens.map(t => [keyOf(t.path), t]));
  const issues = [];

  function resolve(t, depth = 0) {
    const m = typeof t.raw === 'string' && t.raw.match(ALIAS);
    if (!m) return { value: t.raw, type: t.type, ref: null };
    const target = byKey.get(m[1].split(/[./]/).map(kebab).join('.'));
    if (!target) { issues.push(`Unresolved alias ${t.raw} in ${t.path.join('.')}`); return { value: null, type: t.type, ref: null }; }
    if (depth > 10) { issues.push(`Alias loop at ${t.path.join('.')}`); return { value: null, type: t.type, ref: null }; }
    const r = resolve(target, depth + 1);
    return { value: r.value, type: t.type || r.type || target.type, ref: target.path };
  }

  const resolved = tokens.map(t => {
    const r = resolve(t);
    let type = TYPE_ALIASES[r.type] || r.type;
    if (!type || type === 'alias') type = inferType(r.value, t.path);
    if (type === 'number' && DIMENSION_NAME.test(t.path.join('.')) && !/line-?height/i.test(t.path.join('.'))) type = 'dimension';
    return { ...t, type, value: r.value, ref: r.ref, css: toCss(r.value, type) };
  }).filter(t => t.value !== null && t.value !== undefined);

  return { tokens: resolved, issues };
}

function toRgba(value) {
  if (typeof value === 'string') {
    const hex = value.match(/^#([0-9a-f]{3,8})$/i);
    if (hex) {
      let h = hex[1];
      if (h.length === 3 || h.length === 4) h = h.split('').map(c => c + c).join('');
      const rgb = hexToRgb(h.slice(0, 6));
      return rgb && { ...rgb, a: h.length === 8 ? parseInt(h.slice(6), 16) / 255 : 1 };
    }
    return null;
  }
  if (isObj(value) && 'colorSpace' in value) {
    if (value.hex) return { ...hexToRgb(value.hex), a: value.alpha ?? 1 };
    const [r, g, b] = value.components || [];
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255), a: value.alpha ?? 1 };
  }
  if (isObj(value) && 'r' in value) {
    const scale = value.r <= 1 && value.g <= 1 && value.b <= 1 ? 255 : 1;
    return { r: Math.round(value.r * scale), g: Math.round(value.g * scale), b: Math.round(value.b * scale), a: value.a ?? 1 };
  }
  return null;
}

export function formatColor(value, mode = 'hex') {
  const c = toRgba(value);
  if (!c) return String(value);
  const a = Math.round(c.a * 1000) / 1000;
  if (mode === 'rgb') return a < 1 ? `rgb(${c.r} ${c.g} ${c.b} / ${a})` : `rgb(${c.r} ${c.g} ${c.b})`;
  if (mode === 'hsl') {
    const h = rgbToHsl(c.r, c.g, c.b);
    const s = `${Math.round(h.h)} ${Math.round(h.s)}% ${Math.round(h.l)}%`;
    return a < 1 ? `hsl(${s} / ${a})` : `hsl(${s})`;
  }
  const hex = rgbToHex(c.r, c.g, c.b);
  return a < 1 ? hex + Math.round(a * 255).toString(16).padStart(2, '0').toUpperCase() : hex;
}

export function colorRgba(value) { return toRgba(value); }

function dim(value) {
  if (typeof value === 'number' || /^-?\d*\.?\d+$/.test(String(value))) return `${value}px`;
  if (isObj(value) && 'value' in value) return `${value.value}${value.unit || 'px'}`;
  return String(value);
}

function toCss(value, type) {
  switch (type) {
    case 'color': return formatColor(value);
    case 'dimension': return dim(value);
    case 'duration': return typeof value === 'number' ? `${value}ms` : isObj(value) ? `${value.value}${value.unit}` : String(value);
    case 'cubicBezier': return Array.isArray(value) ? `cubic-bezier(${value.join(', ')})` : String(value);
    case 'fontFamily': return (Array.isArray(value) ? value : [value]).map(f => (/\s/.test(f) && !/^["']/.test(f) ? `"${f}"` : f)).join(', ');
    case 'shadow': {
      const list = Array.isArray(value) ? value : [value];
      return list.map(s => (isObj(s)
        ? `${s.inset ? 'inset ' : ''}${dim(s.offsetX ?? 0)} ${dim(s.offsetY ?? 0)} ${dim(s.blur ?? 0)} ${dim(s.spread ?? 0)} ${formatColor(s.color ?? '#000')}`
        : String(s))).join(', ');
    }
    default: return isObj(value) || Array.isArray(value) ? JSON.stringify(value) : String(value);
  }
}

/* ---------- outputs ---------- */

const varName = (path, prefix) => kebab([prefix, ...path].filter(Boolean).join('-'));

function cssValue(t, opts, refFn) {
  if (opts.keepAliases && t.ref) return refFn(t.ref);
  return t.type === 'color' ? formatColor(t.value, opts.colorFormat) : t.css;
}

export function toCSS(tokens, opts) {
  const lines = tokens.map(t => `  --${varName(t.path, opts.prefix)}: ${cssValue(t, opts, ref => `var(--${varName(ref, opts.prefix)})`)};`);
  return `:root {\n${lines.join('\n')}\n}\n`;
}

export function toSCSS(tokens, opts) {
  return tokens.map(t => `$${varName(t.path, opts.prefix)}: ${cssValue(t, opts, ref => `$${varName(ref, opts.prefix)}`)};`).join('\n') + '\n';
}

// Tailwind v4: @theme namespaces decide which utilities get generated.
function twNamespace(t) {
  const p = t.path.join('.').toLowerCase();
  if (t.type === 'color') return 'color';
  if (t.type === 'shadow') return 'shadow';
  if (t.type === 'fontFamily') return 'font';
  if (t.type === 'fontWeight') return 'font-weight';
  if (t.type === 'cubicBezier') return 'ease';
  if (t.type === 'dimension') {
    if (/radius|rounded/.test(p)) return 'radius';
    if (/font-?size|text|type/.test(p)) return 'text';
    if (/breakpoint|screen/.test(p)) return 'breakpoint';
    return 'spacing';
  }
  return null;
}

const GROUP_WORDS = /^(color|colors|space|spacing|size|sizes|radius|radii|rounded|border-?radius|font|fonts|family|font-?size|font-?weight|typography|shadow|shadows|motion|easing|ease|duration|breakpoints?)$/i;

function twKey(t) {
  const parts = t.path.map(kebab).filter(Boolean);
  while (parts.length > 1 && GROUP_WORDS.test(parts[0])) parts.shift();
  // "heading-font-size" → "heading": the namespace already says what it is.
  if (parts.length > 1 && /^(font-size|font-weight|font-family)$/.test(parts[parts.length - 1])) parts.pop();
  return parts.join('-');
}

export function toTailwind(tokens, opts) {
  const lines = [];
  const skipped = [];
  for (const t of tokens) {
    const ns = twNamespace(t);
    if (!ns) { skipped.push(t.path.join('.')); continue; }
    const value = t.type === 'color' ? formatColor(t.value, opts.colorFormat) : t.css;
    lines.push(`  --${ns}-${twKey(t)}: ${value};`);
  }
  let out = `@import "tailwindcss";\n\n@theme {\n${lines.join('\n')}\n}\n`;
  if (skipped.length) out += `\n/* No Tailwind namespace for: ${skipped.slice(0, 8).join(', ')}${skipped.length > 8 ? '…' : ''} — see the CSS tab. */\n`;
  return out;
}

const SWIFT_WEIGHTS = { 100: '.ultraLight', 200: '.thin', 300: '.light', 400: '.regular', 500: '.medium', 600: '.semibold', 700: '.bold', 800: '.heavy', 900: '.black' };

export function toSwift(tokens, opts) {
  const colors = [], consts = [];
  for (const t of tokens) {
    const name = camel([opts.prefix, ...t.path].filter(Boolean));
    if (t.type === 'color') {
      const c = toRgba(t.value);
      if (!c) continue;
      const f = n => (n / 255).toFixed(3);
      colors.push(`    static let ${name} = Color(red: ${f(c.r)}, green: ${f(c.g)}, blue: ${f(c.b)}, opacity: ${c.a.toFixed(2)})`);
    } else if (t.type === 'dimension') {
      const m = String(t.css).match(/^(-?\d*\.?\d+)(px|rem|em)?$/);
      if (m) consts.push(`    static let ${name}: CGFloat = ${+(m[2] === 'rem' || m[2] === 'em' ? m[1] * 16 : m[1])}`);
    } else if (t.type === 'number') {
      consts.push(`    static let ${name}: Double = ${Number(t.value)}`);
    } else if (t.type === 'fontWeight') {
      consts.push(`    static let ${name}: Font.Weight = ${SWIFT_WEIGHTS[Math.round(Number(t.value) / 100) * 100] || '.regular'}`);
    } else if (t.type === 'duration') {
      const m = String(t.css).match(/^(\d*\.?\d+)(ms|s)$/);
      if (m) consts.push(`    static let ${name}: TimeInterval = ${m[2] === 'ms' ? +m[1] / 1000 : +m[1]}`);
    } else if (t.type === 'cubicBezier' && Array.isArray(t.value)) {
      consts.push(`    static func ${name}(duration: Double = 0.3) -> Animation { .timingCurve(${t.value.join(', ')}, duration: duration) }`);
    } else if (t.type === 'fontFamily') {
      consts.push(`    static let ${name} = "${(Array.isArray(t.value) ? t.value[0] : t.value).replace(/"/g, '')}"`);
    }
  }
  return `import SwiftUI\n\nextension Color {\n${colors.join('\n') || '    // no color tokens'}\n}\n\nenum DesignTokens {\n${consts.join('\n') || '    // no dimension / number tokens'}\n}\n`;
}

export function toJSON(tokens, opts) {
  return JSON.stringify(Object.fromEntries(tokens.map(t => [varName(t.path, opts.prefix), t.type === 'color' ? formatColor(t.value, opts.colorFormat) : t.css])), null, 2) + '\n';
}

export const FORMATS = [
  { value: 'css', label: 'CSS', fn: toCSS, ext: 'css' },
  { value: 'scss', label: 'SCSS', fn: toSCSS, ext: 'scss' },
  { value: 'tailwind', label: 'Tailwind v4', fn: toTailwind, ext: 'css' },
  { value: 'swift', label: 'SwiftUI', fn: toSwift, ext: 'swift' },
  { value: 'json', label: 'Flat JSON', fn: toJSON, ext: 'json' },
];

/* ---------- samples ---------- */

export const SAMPLES = {
  dtcg: {
    label: 'W3C / DTCG',
    text: JSON.stringify({
      color: {
        $type: 'color',
        brand: { 100: { $value: '#EFE9FF' }, 500: { $value: '#8B6CF0' }, 900: { $value: '#2B1A4F' } },
        accent: { $value: '#FFCE1F' },
        text: { default: { $value: '{color.brand.900}', $description: 'Body text on light surfaces' } },
        action: { primary: { $value: '{color.brand.500}' } },
      },
      space: { $type: 'dimension', xs: { $value: '4px' }, sm: { $value: '8px' }, md: { $value: '16px' }, lg: { $value: '24px' } },
      radius: { $type: 'dimension', md: { $value: '14px' }, pill: { $value: '999px' } },
      font: {
        family: { display: { $type: 'fontFamily', $value: ['Crimson Pro', 'Georgia', 'serif'] } },
        heading: { $type: 'typography', $value: { fontFamily: '{font.family.display}', fontSize: '48px', fontWeight: 300, lineHeight: 1.05 } },
      },
      shadow: { card: { $type: 'shadow', $value: { color: '#00000040', offsetX: '0px', offsetY: '12px', blur: '32px', spread: '-12px' } } },
      motion: {
        ease: { standard: { $type: 'cubicBezier', $value: [0.16, 1, 0.3, 1] } },
        duration: { fast: { $type: 'duration', $value: '150ms' }, base: { $type: 'duration', $value: '300ms' } },
      },
    }, null, 2),
  },
  studio: {
    label: 'Tokens Studio',
    text: JSON.stringify({
      global: {
        colors: { purple: { value: '#8B6CF0', type: 'color' }, yellow: { value: '#FFCE1F', type: 'color' } },
        spacing: { 1: { value: '4', type: 'spacing' }, 2: { value: '8', type: 'spacing' }, 4: { value: '16', type: 'spacing' } },
        borderRadius: { lg: { value: '16', type: 'borderRadius' } },
        primary: { value: '{global.colors.purple}', type: 'color' },
      },
    }, null, 2),
  },
  figma: {
    label: 'Figma Variables',
    text: JSON.stringify({
      collections: [
        {
          name: 'Primitives',
          modes: [{ name: 'Value', variables: [
            { name: 'violet/500', type: 'COLOR', value: { r: 0.545, g: 0.424, b: 0.941, a: 1 } },
            { name: 'ink/900', type: 'COLOR', value: { r: 0.067, g: 0.063, b: 0.067, a: 1 } },
            { name: 'paper/50', type: 'COLOR', value: { r: 0.969, g: 0.957, b: 0.949, a: 1 } },
            { name: 'space/4', type: 'FLOAT', value: 16 },
          ] }],
        },
        {
          name: 'Theme',
          modes: [
            { name: 'Light', variables: [
              { name: 'surface', type: 'COLOR', value: { collection: 'Primitives', name: 'paper/50' } },
              { name: 'text', type: 'COLOR', value: { collection: 'Primitives', name: 'ink/900' } },
              { name: 'accent', type: 'COLOR', value: { collection: 'Primitives', name: 'violet/500' } },
            ] },
            { name: 'Dark', variables: [
              { name: 'surface', type: 'COLOR', value: { collection: 'Primitives', name: 'ink/900' } },
              { name: 'text', type: 'COLOR', value: { collection: 'Primitives', name: 'paper/50' } },
              { name: 'accent', type: 'COLOR', value: { collection: 'Primitives', name: 'violet/500' } },
            ] },
          ],
        },
      ],
    }, null, 2),
  },
};
