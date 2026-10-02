import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { bestTextColor, clamp, contrastRatio, formatRatio, hexToHsl, hexToRgb, hslToHex } from '../lib/color';
import ToolPage from '../components/ToolPage';
import { ColorField, CopyButton, RangeField, Reveal, Segmented } from '../components/ui';
import { EASE, REVEAL_VIEWPORT } from '../lib/motion';
import useCopy from '../hooks/useCopy';

const SURFACES = {
  light: { bg: '#FFFFFF', text: '#111011', muted: '#6B6866', border: '#8E8A86', disabledBg: '#ECE9E5', disabledText: '#A19D98', error: '#C62828', field: '#FFFFFF' },
  dark: { bg: '#1D1C1B', text: '#F7F7F7', muted: '#B5B2AE', border: '#77736F', disabledBg: '#2E2D2B', disabledText: '#6F6C69', error: '#FF7A7A', field: '#121212' },
};

const SIZES = {
  sm: { pad: '8px 14px', font: 13, h: 36 },
  md: { pad: '12px 20px', font: 15, h: 44 },
  lg: { pad: '16px 26px', font: 17, h: 52 },
};

function deriveTokens(accent, surfaceKey) {
  const s = SURFACES[surfaceKey];
  const hsl = hexToHsl(accent);
  const dir = hsl.l < 30 ? 1 : -1; // very dark accents get lighter on hover instead
  const hover = hslToHex(hsl.h, hsl.s, clamp(hsl.l + dir * 8, 0, 100));
  const active = hslToHex(hsl.h, hsl.s, clamp(hsl.l + dir * 16, 0, 100));
  const fg = bestTextColor(hexToRgb(accent)).toUpperCase();
  // Outline/secondary text uses the accent if it's readable on the surface,
  // otherwise a nudged version that passes 4.5:1.
  let outline = accent;
  for (let l = hsl.l, i = 0; contrastRatio(hexToRgb(outline), hexToRgb(s.bg)) < 4.5 && i < 100; i++) {
    l += surfaceKey === 'light' ? -1 : 1;
    outline = hslToHex(hsl.h, hsl.s, clamp(l, 0, 100));
  }
  return { ...s, accent, hover, active, fg, outline, ring: outline };
}

function ratioBadge(fg, bg, target, label) {
  const r = contrastRatio(hexToRgb(fg), hexToRgb(bg));
  const pass = r >= target;
  return { label, text: `${formatRatio(r)}:1`, pass, target };
}

const BUTTON_STATES = ['default', 'hover', 'focus', 'pressed', 'loading', 'disabled'];
const INPUT_STATES = ['default', 'hover', 'focus', 'filled', 'error', 'disabled'];
const CARD_STATES = ['default', 'hover', 'focus', 'selected', 'disabled'];

function Spinner({ color }) {
  return (
    <motion.span
      aria-hidden="true"
      style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${color}`, borderTopColor: 'transparent', display: 'inline-block' }}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
    />
  );
}

function ButtonPreview({ t, variant, state, size, radius, interactive }) {
  const sz = SIZES[size];
  const primary = variant === 'primary';
  let bg = primary ? t.accent : 'transparent';
  let fg = primary ? t.fg : t.outline;
  let border = primary ? 'transparent' : t.outline;
  if (state === 'hover') { bg = primary ? t.hover : `color-mix(in srgb, ${t.outline} 10%, transparent)`; }
  if (state === 'pressed') { bg = primary ? t.active : `color-mix(in srgb, ${t.outline} 18%, transparent)`; }
  if (state === 'disabled') { bg = primary ? t.disabledBg : 'transparent'; fg = t.disabledText; border = primary ? 'transparent' : t.disabledBg; }
  const focus = state === 'focus' ? `0 0 0 2px ${t.bg}, 0 0 0 4px ${t.ring}` : 'none';
  const style = interactive
    ? { '--b-bg': primary ? t.accent : 'transparent', '--b-hover': primary ? t.hover : `color-mix(in srgb, ${t.outline} 10%, transparent)`, '--b-active': primary ? t.active : `color-mix(in srgb, ${t.outline} 18%, transparent)`, '--b-ring': t.ring, '--b-surface': t.bg, color: fg, borderColor: border }
    : { background: bg, color: fg, borderColor: border, boxShadow: focus, transform: state === 'pressed' ? 'scale(0.97)' : undefined };
  return (
    <button
      type="button"
      className={interactive ? 'cs-btn cs-live' : 'cs-btn'}
      disabled={state === 'disabled'}
      tabIndex={interactive ? 0 : -1}
      aria-hidden={interactive ? undefined : true}
      style={{ ...style, padding: sz.pad, fontSize: sz.font, borderRadius: radius, minHeight: sz.h }}
    >
      {state === 'loading' && <Spinner color={fg} />}
      {state === 'loading' ? 'Saving…' : primary ? 'Save changes' : 'Cancel'}
    </button>
  );
}

function InputPreview({ t, state, size, radius, interactive }) {
  const sz = SIZES[size];
  let border = t.border, shadow = 'none', color = t.text, bg = t.field;
  if (state === 'hover') border = t.text;
  if (state === 'focus') { border = t.ring; shadow = `0 0 0 3px color-mix(in srgb, ${t.ring} 30%, transparent)`; }
  if (state === 'error') { border = t.error; }
  if (state === 'disabled') { border = t.disabledBg; bg = t.disabledBg; color = t.disabledText; }
  const value = state === 'filled' || state === 'error' ? (state === 'error' ? 'ale@' : 'ale@alevasquez.dev') : '';
  return (
    <div style={{ display: 'grid', gap: 6, width: '100%', fontFamily: 'var(--font-body)' }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: state === 'disabled' ? t.disabledText : t.text }}>Email</span>
      <input
        className={interactive ? 'cs-input cs-live' : 'cs-input'}
        readOnly={!interactive}
        tabIndex={interactive ? 0 : -1}
        aria-hidden={interactive ? undefined : true}
        disabled={state === 'disabled'}
        placeholder="you@example.com"
        defaultValue={interactive ? undefined : value}
        style={interactive
          ? { '--i-border': t.border, '--i-hover': t.text, '--i-ring': t.ring, borderRadius: radius / 1.5, height: sz.h, fontSize: sz.font, background: t.field, color: t.text, '--i-placeholder': t.muted }
          : { borderColor: border, boxShadow: shadow, color, background: bg, borderRadius: radius / 1.5, height: sz.h, fontSize: sz.font, '--i-placeholder': t.muted }}
      />
      <span style={{ fontSize: 12, color: state === 'error' ? t.error : t.muted, minHeight: 16 }}>
        {state === 'error' ? '✕ Enter a complete email address' : 'We’ll never share it.'}
      </span>
    </div>
  );
}

function CardPreview({ t, state, radius, interactive }) {
  const selected = state === 'selected';
  let border = `color-mix(in srgb, ${t.text} 14%, transparent)`;
  let shadow = 'none', transform;
  if (state === 'hover') { shadow = '0 18px 30px -18px rgba(0,0,0,.5)'; transform = 'translateY(-3px)'; }
  if (state === 'focus') shadow = `0 0 0 2px ${t.bg}, 0 0 0 4px ${t.ring}`;
  if (selected) border = t.outline;
  const disabled = state === 'disabled';
  return (
    <div
      className={interactive ? 'cs-card cs-live' : 'cs-card'}
      tabIndex={interactive ? 0 : -1}
      aria-hidden={interactive ? undefined : true}
      style={interactive
        ? { '--c-ring': t.ring, '--c-surface': t.bg, borderRadius: radius, borderColor: border, color: t.text, background: t.bg }
        : { borderRadius: radius, borderColor: border, borderWidth: selected ? 2 : 1, boxShadow: shadow, transform, color: disabled ? t.disabledText : t.text, background: disabled ? t.disabledBg : t.bg }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <strong style={{ fontSize: 15 }}>Pro plan</strong>
        {selected && <span style={{ width: 20, height: 20, borderRadius: '50%', background: t.accent, color: t.fg, display: 'grid', placeItems: 'center', fontSize: 12 }}>✓</span>}
      </div>
      <span style={{ fontSize: 13, color: disabled ? t.disabledText : t.muted }}>Unlimited experiments</span>
    </div>
  );
}

function StateCell({ name, notes, children, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={REVEAL_VIEWPORT}
      transition={{ duration: 0.45, ease: EASE, delay: index * 0.04 }}
      style={{ display: 'grid', gap: 10, alignContent: 'start' }}
    >
      <div className="cs-stage">{children}</div>
      <div>
        <div style={{ fontFamily: 'var(--font-label)', fontWeight: 600, fontSize: 14, textTransform: 'capitalize' }}>{name}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
          {notes.map(n => (
            <span key={n.label} className={'badge ' + (n.pass === undefined ? 'badge-neutral' : n.pass ? 'badge-pass' : 'badge-fail')} title={n.target ? `Needs ${n.target}:1` : undefined}>
              {n.pass === undefined ? '' : n.pass ? '✓ ' : '✕ '}{n.label}{n.text ? ` ${n.text}` : ''}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function ComponentStates() {
  const [accent, setAccent] = useState('#8B6CF0');
  const [surface, setSurface] = useState('light');
  const [size, setSize] = useState('md');
  const [radius, setRadius] = useState(14);
  const [component, setComponent] = useState('button');
  const [copied, copy] = useCopy();

  const t = useMemo(() => deriveTokens(accent, surface), [accent, surface]);

  const buttonNotes = state => {
    if (state === 'disabled') return [{ label: 'Contrast exempt (WCAG 1.4.3)' }];
    const bg = state === 'hover' ? t.hover : state === 'pressed' ? t.active : t.accent;
    const notes = [ratioBadge(t.fg, bg, 4.5, 'Label')];
    if (state === 'focus') notes.push(ratioBadge(t.ring, t.bg, 3, 'Ring'));
    if (state === 'default') notes.push(ratioBadge(t.accent, t.bg, 3, 'Shape'));
    return notes;
  };
  const inputNotes = state => {
    if (state === 'disabled') return [{ label: 'Contrast exempt' }];
    if (state === 'error') return [ratioBadge(t.error, t.bg, 4.5, 'Message'), { label: 'Icon + text, not color alone' }];
    if (state === 'focus') return [ratioBadge(t.ring, t.bg, 3, 'Focus border')];
    if (state === 'hover') return [ratioBadge(t.text, t.bg, 3, 'Border')];
    return [ratioBadge(t.border, t.bg, 3, 'Border'), ratioBadge(t.muted, t.field, 4.5, 'Placeholder')];
  };
  const cardNotes = state => {
    if (state === 'disabled') return [{ label: 'Contrast exempt' }];
    if (state === 'focus') return [ratioBadge(t.ring, t.bg, 3, 'Ring')];
    if (state === 'selected') return [ratioBadge(t.outline, t.bg, 3, 'Border'), { label: 'Checkmark, not color alone' }];
    return [ratioBadge(t.muted, t.bg, 4.5, 'Meta text')];
  };

  const states = component === 'button' ? BUTTON_STATES : component === 'input' ? INPUT_STATES : CARD_STATES;

  const css = `:root {
  --color-accent: ${t.accent};
  --color-accent-hover: ${t.hover};
  --color-accent-pressed: ${t.active};
  --color-on-accent: ${t.fg};
  --color-accent-text: ${t.outline};
  --color-focus-ring: ${t.ring};
  --color-border: ${t.border};
  --color-error: ${t.error};
  --color-disabled-bg: ${t.disabledBg};
  --color-disabled-text: ${t.disabledText};
  --radius-control: ${radius}px;
}`;

  return (
    <ToolPage id="component-states" intro="One accent color in, every interactive state out. Hover, pressed, focus and disabled are derived for you, and each state is checked against WCAG (text 4.5:1, focus rings and borders 3:1). The bottom row is live — hover, click and tab through it.">
      <style>{`
        .cs-stage { min-height: 130px; border-radius: 20px; display: grid; place-items: center; padding: 22px 18px; background: ${t.bg}; box-shadow: inset 0 0 0 1px var(--border); transition: background-color .35s ease; }
        .cs-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: 1.5px solid transparent; font-family: var(--font-body); font-weight: 600; letter-spacing: -0.01em; transition: background-color .18s ease, box-shadow .18s ease, transform .12s ease; }
        .cs-btn:disabled { cursor: not-allowed; }
        .cs-live.cs-btn { background: var(--b-bg); }
        .cs-live.cs-btn:hover { background: var(--b-hover); }
        .cs-live.cs-btn:active { background: var(--b-active); transform: scale(0.97); }
        .cs-live.cs-btn:focus-visible { outline: none; box-shadow: 0 0 0 2px var(--b-surface), 0 0 0 4px var(--b-ring); }
        .cs-input { width: 100%; padding: 0 14px; border: 1.5px solid var(--i-border, transparent); font-family: var(--font-body); transition: border-color .18s ease, box-shadow .18s ease; }
        .cs-input::placeholder { color: var(--i-placeholder); }
        .cs-input:disabled { cursor: not-allowed; }
        .cs-live.cs-input:hover { border-color: var(--i-hover); }
        .cs-live.cs-input:focus { outline: none; border-color: var(--i-ring); box-shadow: 0 0 0 3px color-mix(in srgb, var(--i-ring) 30%, transparent); }
        .cs-card { width: 100%; max-width: 240px; display: grid; gap: 4px; padding: 16px 18px; border: 1px solid; text-align: left; font-family: var(--font-body); transition: transform .25s var(--ease-out), box-shadow .25s ease, border-color .2s ease; }
        .cs-live.cs-card { cursor: pointer; }
        .cs-live.cs-card:hover { transform: translateY(-3px); box-shadow: 0 18px 30px -18px rgba(0,0,0,.5); }
        .cs-live.cs-card:focus-visible { outline: none; box-shadow: 0 0 0 2px var(--c-surface), 0 0 0 4px var(--c-ring); }
      `}</style>
      <div className="grid-sidebar">
        <div className="stack sticky-col">
          <Reveal className="card">
            <h2 className="eyebrow">Tokens in</h2>
            <div className="stack" style={{ gap: 16 }}>
              <ColorField label="Accent" value={accent} onChange={setAccent} />
              <div style={{ display: 'flex', gap: 8 }}>
                {['#8B6CF0', '#CD57FF', '#FFCE1F', '#1A73E8', '#11804A', '#111011'].map(c => (
                  <motion.button key={c} type="button" aria-label={`Use ${c}`} onClick={() => setAccent(c)} whileHover={{ y: -3 }} whileTap={{ scale: 0.85 }}
                    style={{ width: 30, height: 30, borderRadius: 10, border: 'none', background: c, boxShadow: accent === c ? '0 0 0 2px var(--surface), 0 0 0 4px var(--focus)' : 'inset 0 0 0 1px rgba(127,127,127,.3)' }} />
                ))}
              </div>
              <div className="field">
                <span className="field-label">Preview surface</span>
                <Segmented full label="Preview surface" value={surface} onChange={setSurface} options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} />
              </div>
              <div className="field">
                <span className="field-label">Size</span>
                <Segmented full label="Size" value={size} onChange={setSize} options={[{ value: 'sm', label: 'S' }, { value: 'md', label: 'M' }, { value: 'lg', label: 'L' }]} />
              </div>
              <RangeField label="Corner radius" value={radius} min={0} max={32} onChange={setRadius} format={v => `${v}px`} />
            </div>
          </Reveal>
          <Reveal className="card" delay={0.05}>
            <h2 className="eyebrow">
              Tokens out
              <CopyButton copied={copied === 'css'} onClick={() => copy(css, 'css', { name: 'Copy', props: { tool: 'component-states' } })}>Copy</CopyButton>
            </h2>
            <pre className="code-block" style={{ maxHeight: 260 }}>{css}</pre>
          </Reveal>
        </div>

        <div className="stack">
          <Reveal className="card">
            <h2 className="eyebrow">
              Component
              <Segmented label="Component" value={component} onChange={setComponent} options={[{ value: 'button', label: 'Button' }, { value: 'input', label: 'Input' }, { value: 'card', label: 'Card' }]} />
            </h2>
            <motion.div key={component + surface} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              {component === 'button' && ['primary', 'secondary'].map(variant => (
                <div key={variant} style={{ marginBottom: 24 }}>
                  <div className="field-label" style={{ marginBottom: 10, textTransform: 'capitalize' }}>{variant}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 190px), 1fr))', gap: 14 }}>
                    {states.map((st, i) => (
                      <StateCell key={st} name={st} index={i} notes={variant === 'primary' ? buttonNotes(st) : st === 'disabled' ? [{ label: 'Contrast exempt' }] : [ratioBadge(t.outline, t.bg, 4.5, 'Label')]}>
                        <ButtonPreview t={t} variant={variant} state={st} size={size} radius={radius} />
                      </StateCell>
                    ))}
                  </div>
                </div>
              ))}
              {component === 'input' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 230px), 1fr))', gap: 14 }}>
                  {states.map((st, i) => (
                    <StateCell key={st} name={st} index={i} notes={inputNotes(st)}>
                      <InputPreview t={t} state={st} size={size} radius={radius} />
                    </StateCell>
                  ))}
                </div>
              )}
              {component === 'card' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 230px), 1fr))', gap: 14 }}>
                  {states.map((st, i) => (
                    <StateCell key={st} name={st} index={i} notes={cardNotes(st)}>
                      <CardPreview t={t} state={st} radius={radius} />
                    </StateCell>
                  ))}
                </div>
              )}
            </motion.div>
          </Reveal>

          <Reveal className="card" delay={0.05}>
            <h2 className="eyebrow">Live — try it with mouse and keyboard</h2>
            <div className="cs-stage" style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', alignItems: 'center', minHeight: 180 }}>
              <ButtonPreview t={t} variant="primary" state="default" size={size} radius={radius} interactive />
              <ButtonPreview t={t} variant="secondary" state="default" size={size} radius={radius} interactive />
              <div style={{ width: 260 }}><InputPreview t={t} state="default" size={size} radius={radius} interactive /></div>
              <CardPreview t={t} state="default" radius={radius} interactive />
            </div>
          </Reveal>
        </div>
      </div>
    </ToolPage>
  );
}
