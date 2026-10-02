import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { bestTextColor, clamp, contrastRatio, formatRatio, hexToHsl, hexToRgb, hslToHex } from '../lib/color';
import ToolPage from '../components/ToolPage';
import { ColorField, CopyButton, RangeField, Reveal, Segmented } from '../components/ui';
import { EASE, REVEAL_VIEWPORT } from '../lib/motion';
import { haptic } from '../lib/haptics';
import useCopy from '../hooks/useCopy';
import { useLang } from '../i18n';

const STATE_ES = {
  default: 'predeterminado', hover: 'hover', focus: 'foco', pressed: 'presionado', loading: 'cargando', success: 'éxito',
  disabled: 'deshabilitado', filled: 'completado', error: 'error', off: 'apagado', on: 'encendido', 'pressed-on': 'presionado (on)',
  unchecked: 'sin marcar', checked: 'marcado', indeterminate: 'indeterminado', selected: 'seleccionado',
};
const NOTE_ES = {
  Label: 'Etiqueta', Shape: 'Forma', Ring: 'Anillo', 'Exempt from contrast (1.4.3)': 'Exento de contraste (1.4.3)', 'Exempt from contrast': 'Exento de contraste',
  'Text + icon': 'Texto + icono', 'aria-busy + text': 'aria-busy + texto', Message: 'Mensaje', 'Icon + text': 'Icono + texto',
  'Focus border': 'Borde de foco', Border: 'Borde', Track: 'Pista', 'Check on thumb': 'Check en el control', Mark: 'Marca', Box: 'Casilla',
  'Radio dot, not color alone': 'Punto de radio, no solo color', 'Meta text': 'Texto secundario',
};
import './ComponentStates.css';

const SURFACES = {
  light: { bg: '#FFFFFF', text: '#111011', muted: '#6B6866', border: '#C9C5C0', borderStrong: '#8E8A86', disabledBg: '#EFECE8', disabledText: '#A19D98', error: '#C62828', success: '#11804A', field: '#FBFAF8', track: '#D9D5D0' },
  dark: { bg: '#1D1C1B', text: '#F7F7F7', muted: '#B5B2AE', border: '#3D3B39', borderStrong: '#77736F', disabledBg: '#2B2A28', disabledText: '#6F6C69', error: '#FF7A7A', success: '#3DDC84', field: '#141312', track: '#3D3B39' },
};

const SIZES = {
  sm: { h: 36, fs: 13, padx: 14 },
  md: { h: 44, fs: 15, padx: 20 },
  lg: { h: 52, fs: 16, padx: 26 },
};

const STYLES = [
  { value: 'solid', label: 'Solid', es: 'Sólido' },
  { value: 'gradient', label: 'Gradient', es: 'Degradado' },
  { value: 'soft', label: 'Soft', es: 'Suave' },
];

function deriveTokens(accent, surfaceKey) {
  const s = SURFACES[surfaceKey];
  const hsl = hexToHsl(accent);
  const fg = bestTextColor(hexToRgb(accent)).toUpperCase();
  // Hover/pressed move *away* from the label color (lighter under dark text,
  // darker under light text), so interacting never lowers label contrast.
  const dir = fg === '#000000' ? 1 : -1;
  const hover = hslToHex(hsl.h, hsl.s, clamp(hsl.l + dir * 7, 0, 100));
  const active = hslToHex(hsl.h, hsl.s, clamp(hsl.l + dir * 14, 0, 100));
  const accent2 = hslToHex((hsl.h + 32) % 360, clamp(hsl.s + 5, 0, 100), clamp(hsl.l + dir * 4, 0, 100));
  // Accent used as text/border on the surface must itself pass 4.5:1.
  let text = accent;
  for (let l = hsl.l, i = 0; contrastRatio(hexToRgb(text), hexToRgb(s.bg)) < 4.5 && i < 100; i++) {
    l += surfaceKey === 'light' ? -1 : 1;
    text = hslToHex(hsl.h, hsl.s, clamp(l, 0, 100));
  }
  return { ...s, accent, accent2, hover, active, fg, accentText: text, ring: text };
}

const check = (fg, bg, target, label) => {
  const r = contrastRatio(hexToRgb(fg), hexToRgb(bg));
  return { label, text: `${formatRatio(r)}:1`, pass: r >= target, target };
};
const info = label => ({ label });

/* ---------------------------------------------------------------------------
   Components. The same markup serves the state matrix (forced through
   data-state) and the live playground (real :hover/:focus/:active).
   ------------------------------------------------------------------------- */

function Spinner() {
  return <span className="csx-spinner" aria-hidden="true" />;
}

function CheckIcon({ size = 16, drawn = true }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <motion.path
        d="M5 12.5l4.2 4.2L19 7"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{ pathLength: drawn ? 1 : 0 }}
        transition={{ duration: 0.35, ease: EASE }}
      />
    </svg>
  );
}

function Button({ variant, state, label: labelProp, onClick, live }) {
  const { t } = useLang();
  const label = labelProp ?? t('Save changes', 'Guardar cambios');
  const ref = useRef(null);
  const [ripples, setRipples] = useState([]);

  function handlePointerDown(e) {
    if (!live) return;
    const r = ref.current.getBoundingClientRect();
    const id = Date.now() + Math.random();
    setRipples(list => [...list, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
    setTimeout(() => setRipples(list => list.filter(i => i.id !== id)), 650);
  }

  const busy = state === 'loading' || state === 'success';
  return (
    <button
      ref={ref}
      type="button"
      className="csx-btn"
      data-variant={variant}
      data-state={live ? (busy ? state : undefined) : state}
      disabled={state === 'disabled'}
      aria-busy={state === 'loading' || undefined}
      tabIndex={live ? 0 : -1}
      onPointerDown={handlePointerDown}
      onClick={onClick}
    >
      {ripples.map(r => <span key={r.id} className="csx-ripple" style={{ left: r.x, top: r.y }} />)}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={state === 'loading' ? 'loading' : state === 'success' ? 'success' : 'idle'}
          className="csx-btn-label"
          initial={{ y: 14, opacity: 0, filter: 'blur(4px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: -14, opacity: 0, filter: 'blur(4px)' }}
          transition={{ duration: 0.25, ease: EASE }}
        >
          {state === 'loading' && <><Spinner /> {t('Saving…', 'Guardando…')}</>}
          {state === 'success' && <><CheckIcon /> {t('Saved', 'Guardado')}</>}
          {!busy && label}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

function Field({ state, live, value, onChange, onBlur, valid }) {
  const { t } = useLang();
  const shown = live ? undefined : state === 'filled' || state === 'success' ? 'ale@alevasquez.dev' : state === 'error' ? 'ale@' : '';
  const status = live ? valid : state;
  return (
    <div className="csx-field" data-state={live ? (valid === 'error' || valid === 'success' ? valid : undefined) : state}>
      <div className="csx-field-box">
        <input
          id={live ? 'cs-live-email' : undefined}
          type="email"
          placeholder=" "
          value={live ? value : shown}
          readOnly={!live}
          onChange={onChange}
          onBlur={onBlur}
          disabled={state === 'disabled'}
          tabIndex={live ? 0 : -1}
          aria-invalid={status === 'error' || undefined}
          aria-describedby={live ? 'cs-live-email-help' : undefined}
        />
        <label htmlFor={live ? 'cs-live-email' : undefined}>{t('Email address', 'Correo electrónico')}</label>
        <span className="csx-field-icon" aria-hidden="true">
          <AnimatePresence>
            {status === 'success' && (
              <motion.span key="ok" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }} style={{ display: 'grid', color: 'var(--cs-success)' }}>
                <CheckIcon size={18} />
              </motion.span>
            )}
            {status === 'error' && (
              <motion.span key="err" className="csx-field-err" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }}>!</motion.span>
            )}
          </AnimatePresence>
        </span>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={status === 'error' ? 'e' : 'h'}
          id={live ? 'cs-live-email-help' : undefined}
          className="csx-help"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.18 }}
        >
          {status === 'error' ? t('Add the rest of your email, like name@domain.com', 'Completa tu correo, por ejemplo nombre@dominio.com') : t('We’ll only use it to send you the palette.', 'Solo lo usaremos para enviarte la paleta.')}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function Toggle({ state, live, checked, onChange, label: labelProp }) {
  const { t } = useLang();
  const label = labelProp ?? t('Notifications', 'Notificaciones');
  const on = live ? checked : state === 'on' || state === 'pressed-on';
  return (
    <span className="csx-toggle-row">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        className="csx-toggle"
        data-state={live ? undefined : state}
        disabled={state === 'disabled'}
        tabIndex={live ? 0 : -1}
        onClick={() => { haptic(); onChange?.(!on); }}
      >
        <span className="csx-toggle-thumb">
          <motion.span initial={false} animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.4 }} style={{ display: 'grid', color: 'var(--cs-accent-text)' }}>
            <CheckIcon size={12} drawn={on} />
          </motion.span>
        </span>
      </button>
      <span aria-hidden="true">{label}</span>
    </span>
  );
}

function Checkbox({ state, live, checked, onChange, label: labelProp }) {
  const { t } = useLang();
  const label = labelProp ?? t('Send me new experiments', 'Envíame experimentos nuevos');
  const indeterminate = state === 'indeterminate';
  const on = live ? checked : state === 'checked' || indeterminate;
  return (
    <span className="csx-check-row">
      <button
        type="button"
        role="checkbox"
        aria-checked={indeterminate ? 'mixed' : on}
        aria-label={label}
        className="csx-check"
        data-on={on || undefined}
        data-state={live ? undefined : state}
        disabled={state === 'disabled'}
        tabIndex={live ? 0 : -1}
        onClick={() => { haptic(); onChange?.(!on); }}
      >
        {indeterminate ? <span className="csx-check-dash" /> : <CheckIcon size={15} drawn={on} />}
      </button>
      <span aria-hidden="true">{label}</span>
    </span>
  );
}

function PlanCard({ state, live, selected, onSelect, name = 'Pro', price = '$12', perks: perksProp }) {
  const { t } = useLang();
  const perks = perksProp ?? t('Unlimited experiments', 'Experimentos ilimitados');
  const isSelected = live ? selected : state === 'selected';
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      className="csx-card"
      data-state={live ? undefined : state}
      data-selected={isSelected || undefined}
      disabled={state === 'disabled'}
      tabIndex={live ? 0 : -1}
      onClick={() => { haptic(); onSelect?.(); }}
    >
      {live && isSelected && <motion.span layoutId="cs-plan-ring" className="csx-card-ring" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
      <span className="csx-card-top">
        <span className="csx-card-name">{name}</span>
        <span className="csx-radio"><motion.span initial={false} animate={{ scale: isSelected ? 1 : 0 }} transition={{ type: 'spring', stiffness: 600, damping: 20 }} /></span>
      </span>
      <span className="csx-card-price">{price}<small>{t('/mo', '/mes')}</small></span>
      <span className="csx-card-perks">{perks}</span>
    </button>
  );
}

/* ---------------------------------------------------------------------------
   State matrix definitions + WCAG notes per state
   ------------------------------------------------------------------------- */

const MATRIX = {
  button: {
    states: ['default', 'hover', 'focus', 'pressed', 'loading', 'success', 'disabled'],
    render: (st, style) => <Button variant={style} state={st} />,
    notes: (st, t, style) => {
      if (st === 'disabled') return [info('Exempt from contrast (1.4.3)')];
      if (style === 'soft') return [check(t.accentText, t.bg, 4.5, 'Label')];
      if (st === 'success') return [check(bestTextColor(hexToRgb(t.success)), t.success, 4.5, 'Label'), info('Text + icon')];
      const bg = st === 'hover' ? t.hover : st === 'pressed' ? t.active : t.accent;
      const n = [check(t.fg, bg, 4.5, 'Label')];
      if (st === 'focus') n.push(check(t.ring, t.bg, 3, 'Ring'));
      if (st === 'default') n.push(check(t.accent, t.bg, 3, 'Shape'));
      if (st === 'loading') n.push(info('aria-busy + text'));
      return n;
    },
  },
  input: {
    states: ['default', 'hover', 'focus', 'filled', 'error', 'success', 'disabled'],
    render: st => <Field state={st} />,
    notes: (st, t) => {
      if (st === 'disabled') return [info('Exempt from contrast')];
      if (st === 'error') return [check(t.error, t.bg, 4.5, 'Message'), info('Icon + text')];
      if (st === 'focus') return [check(t.ring, t.bg, 3, 'Focus border')];
      if (st === 'success') return [check(t.success, t.bg, 3, 'Border')];
      return [check(t.borderStrong, t.bg, 3, 'Border'), check(t.muted, t.field, 4.5, 'Label')];
    },
  },
  toggle: {
    states: ['off', 'on', 'hover', 'focus', 'pressed-on', 'disabled'],
    render: st => <Toggle state={st} />,
    notes: (st, t) => {
      if (st === 'disabled') return [info('Exempt from contrast')];
      if (st === 'off') return [check(t.borderStrong, t.bg, 3, 'Track')];
      if (st === 'focus') return [check(t.ring, t.bg, 3, 'Ring')];
      return [check(t.accent, t.bg, 3, 'Track'), info('Check on thumb')];
    },
  },
  checkbox: {
    states: ['unchecked', 'checked', 'hover', 'focus', 'indeterminate', 'disabled'],
    render: st => <Checkbox state={st} />,
    notes: (st, t) => {
      if (st === 'disabled') return [info('Exempt from contrast')];
      if (st === 'checked' || st === 'indeterminate') return [check(t.fg, t.accent, 3, 'Mark'), check(t.accent, t.bg, 3, 'Box')];
      if (st === 'focus') return [check(t.ring, t.bg, 3, 'Ring')];
      return [check(t.borderStrong, t.bg, 3, 'Border')];
    },
  },
  card: {
    states: ['default', 'hover', 'focus', 'selected', 'disabled'],
    render: st => <PlanCard state={st} />,
    notes: (st, t) => {
      if (st === 'disabled') return [info('Exempt from contrast')];
      if (st === 'focus') return [check(t.ring, t.bg, 3, 'Ring')];
      if (st === 'selected') return [check(t.accentText, t.bg, 3, 'Border'), info('Radio dot, not color alone')];
      return [check(t.muted, t.bg, 4.5, 'Meta text')];
    },
  },
};

function StateCell({ name, notes, index, children }) {
  const { lang, t } = useLang();
  return (
    <motion.div
      className="csx-cell"
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={REVEAL_VIEWPORT}
      transition={{ duration: 0.5, ease: EASE, delay: index * 0.045 }}
    >
      <div className="csx-stage" aria-hidden="true">{children}</div>
      <div className="csx-cell-meta">
        <span className="csx-state-name">{lang === 'es' ? STATE_ES[name] : name.replace('-', ' ')}</span>
        <div className="csx-notes">
          {notes.map(n => (
            <span key={n.label} className={'badge ' + (n.pass === undefined ? 'badge-neutral' : n.pass ? 'badge-pass' : 'badge-fail')} title={n.target ? `${t('Needs', 'Requiere')} ${n.target}:1` : undefined}>
              {n.pass === undefined ? '' : n.pass ? '✓ ' : '✕ '}{t(n.label, NOTE_ES[n.label])}{n.text ? ` ${n.text}` : ''}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ---------------------------------------------------------------------------
   Page
   ------------------------------------------------------------------------- */

export default function ComponentStates() {
  const { t: tr } = useLang();
  const [accent, setAccent] = useState('#8B6CF0');
  const [surface, setSurface] = useState('light');
  const [size, setSize] = useState('md');
  const [radius, setRadius] = useState(14);
  const [style, setStyle] = useState('solid');
  const [component, setComponent] = useState('button');
  const [copied, copy] = useCopy();

  // Live playground state
  const [btnState, setBtnState] = useState('default');
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState(undefined);
  const [toggle, setToggle] = useState(true);
  const [checked, setChecked] = useState(false);
  const [plan, setPlan] = useState('pro');

  const t = useMemo(() => deriveTokens(accent, surface), [accent, surface]);
  const sz = SIZES[size];

  const vars = {
    '--cs-accent': t.accent, '--cs-accent-2': t.accent2, '--cs-hover': t.hover, '--cs-active': t.active,
    '--cs-on-accent': t.fg, '--cs-accent-text': t.accentText, '--cs-ring': t.ring,
    '--cs-surface': t.bg, '--cs-text': t.text, '--cs-muted': t.muted, '--cs-border': t.border, '--cs-border-strong': t.borderStrong,
    '--cs-field': t.field, '--cs-track': t.track, '--cs-dis-bg': t.disabledBg, '--cs-dis-text': t.disabledText,
    '--cs-error': t.error, '--cs-success': t.success, '--cs-on-success': bestTextColor(hexToRgb(t.success)),
    '--cs-r': `${radius}px`, '--cs-h': `${sz.h}px`, '--cs-fs': `${sz.fs}px`, '--cs-padx': `${sz.padx}px`,
  };

  function runButton() {
    if (btnState !== 'default') return;
    setBtnState('loading');
    setTimeout(() => { setBtnState('success'); haptic(20); }, 1300);
    setTimeout(() => setBtnState('default'), 2900);
  }

  function validateEmail() {
    if (!email) { setEmailStatus(undefined); return; }
    setEmailStatus(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? 'success' : 'error');
  }

  const css = `:root {
  --color-accent: ${t.accent};
  --color-accent-hover: ${t.hover};
  --color-accent-pressed: ${t.active};
  --color-accent-gradient: linear-gradient(135deg, ${t.accent}, ${t.accent2});
  --color-on-accent: ${t.fg};
  --color-accent-text: ${t.accentText};
  --color-focus-ring: ${t.ring};
  --color-border: ${t.borderStrong};
  --color-error: ${t.error};
  --color-success: ${t.success};
  --color-disabled-bg: ${t.disabledBg};
  --color-disabled-text: ${t.disabledText};
  --radius-control: ${radius}px;
  --control-height: ${sz.h}px;
  --ease-spring: cubic-bezier(.3, 1.4, .5, 1);
}`;

  const def = MATRIX[component];

  return (
    <ToolPage id="component-states" intro="One accent in, a full set of interactive states out — with the micro-interactions that make them feel alive. Play with the live components, then inspect every state side by side with its WCAG checks (text 4.5:1; focus rings, borders and tracks 3:1).">
      <div className="grid-sidebar">
        <div className="stack sticky-col">
          <Reveal className="card">
            <h2 className="eyebrow">{tr('Tokens in', 'Tokens de entrada')}</h2>
            <div className="stack" style={{ gap: 16 }}>
              <ColorField label={tr('Accent', 'Acento')} value={accent} onChange={setAccent} />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['#8B6CF0', '#CD57FF', '#FF7AB6', '#FFCE1F', '#1A73E8', '#11804A', '#111011'].map(c => (
                  <motion.button
                    key={c} type="button" aria-label={tr(`Use ${c}`, `Usar ${c}`)} aria-pressed={accent === c}
                    onClick={() => setAccent(c)} whileHover={{ y: -3, rotate: -6 }} whileTap={{ scale: 0.85 }}
                    style={{ width: 30, height: 30, borderRadius: 10, border: 'none', background: c, boxShadow: accent === c ? '0 0 0 2px var(--surface), 0 0 0 4px var(--focus)' : 'inset 0 0 0 1px rgba(127,127,127,.3)', transition: 'box-shadow .2s ease' }}
                  />
                ))}
              </div>
              <div className="field">
                <span className="field-label">{tr('Button style', 'Estilo de botón')}</span>
                <Segmented full label={tr('Button style', 'Estilo de botón')} value={style} onChange={setStyle} options={STYLES.map(s => ({ value: s.value, label: tr(s.label, s.es) }))} />
              </div>
              <div className="field">
                <span className="field-label">{tr('Preview surface', 'Superficie de vista previa')}</span>
                <Segmented full label={tr('Preview surface', 'Superficie de vista previa')} value={surface} onChange={setSurface} options={[{ value: 'light', label: tr('Light', 'Clara') }, { value: 'dark', label: tr('Dark', 'Oscura') }]} />
              </div>
              <div className="field">
                <span className="field-label">{tr('Size', 'Tamaño')}</span>
                <Segmented full label={tr('Size', 'Tamaño')} value={size} onChange={setSize} options={[{ value: 'sm', label: 'S' }, { value: 'md', label: 'M' }, { value: 'lg', label: 'L' }]} />
              </div>
              <RangeField label={tr('Corner radius', 'Radio de las esquinas')} value={radius} min={0} max={28} onChange={setRadius} format={v => `${v}px`} />
            </div>
          </Reveal>
          <Reveal className="card" delay={0.05}>
            <h2 className="eyebrow">
              {tr('Tokens out', 'Tokens de salida')}
              <CopyButton copied={copied === 'css'} onClick={() => copy(css, 'css', { name: 'Copy', props: { tool: 'component-states' } })}>{tr('Copy', 'Copiar')}</CopyButton>
            </h2>
            <pre className="code-block" data-lenis-prevent style={{ maxHeight: 280 }}>{css}</pre>
          </Reveal>
        </div>

        <div className="stack">
          <Reveal className="card">
            <h2 className="eyebrow">{tr('Playground — click, type, tab through', 'Área de pruebas: haz clic, escribe, navega con Tab')}</h2>
            <div className="csx-root csx-playground" style={vars}>
              <div className="csx-play-col">
                <div className="csx-play-row">
                  <Button live variant={style} state={btnState} onClick={runButton} />
                  <Button live variant="outline" state="default" label={tr('Cancel', 'Cancelar')} />
                </div>
                <Field
                  live
                  value={email}
                  valid={emailStatus}
                  onChange={e => { setEmail(e.target.value); if (emailStatus) setEmailStatus(undefined); }}
                  onBlur={validateEmail}
                />
                <div className="csx-play-row" style={{ gap: 24 }}>
                  <Toggle live checked={toggle} onChange={setToggle} />
                  <Checkbox live checked={checked} onChange={setChecked} label={tr('Remember me', 'Recordarme')} />
                </div>
              </div>
              <div className="csx-play-col" role="radiogroup" aria-label={tr('Plan', 'Plan')}>
                <PlanCard live selected={plan === 'starter'} onSelect={() => setPlan('starter')} name={tr('Starter', 'Inicial')} price="$0" perks={tr('3 experiments a month', '3 experimentos al mes')} />
                <PlanCard live selected={plan === 'pro'} onSelect={() => setPlan('pro')} name="Pro" price="$12" />
              </div>
            </div>
          </Reveal>

          <Reveal className="card" delay={0.05}>
            <h2 className="eyebrow">
              {tr('Every state', 'Todos los estados')}
              <Segmented
                label={tr('Component', 'Componente')}
                value={component}
                onChange={setComponent}
                options={[
                  { value: 'button', label: tr('Button', 'Botón') }, { value: 'input', label: tr('Input', 'Campo') }, { value: 'toggle', label: tr('Toggle', 'Interruptor') },
                  { value: 'checkbox', label: tr('Checkbox', 'Casilla') }, { value: 'card', label: tr('Card', 'Tarjeta') },
                ]}
              />
            </h2>
            <AnimatePresence mode="wait">
              <motion.div
                key={component + surface + style}
                className="csx-root csx-matrix"
                style={vars}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: EASE }}
              >
                {def.states.map((st, i) => (
                  <StateCell key={st} name={st} index={i} notes={def.notes(st, t, style)}>
                    {def.render(st, style)}
                  </StateCell>
                ))}
              </motion.div>
            </AnimatePresence>
          </Reveal>
        </div>
      </div>
    </ToolPage>
  );
}
