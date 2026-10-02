import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { normalizeHex } from '../lib/color';
import { EASE, REVEAL_VIEWPORT } from '../lib/motion';
import { haptic } from '../lib/haptics';

/* Fades/slides its children in the first time they scroll into view. */
export function Reveal({ as = 'div', delay = 0, className, style, children, ...rest }) {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      style={style}
      initial={{ opacity: 0, y: 48, rotateX: 14, scale: 0.97, transformPerspective: 1100 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      viewport={REVEAL_VIEWPORT}
      transition={{ duration: 0.9, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/* Pill-style segmented control; the selected pill slides between options. */
export function Segmented({ options, value, onChange, full = false, label }) {
  const id = useId();
  return (
    <div className={'segmented' + (full ? ' segmented-full' : '')} role="group" aria-label={label}>
      {options.map(opt => {
        const selected = opt.value === value;
        return (
          <motion.button
            key={opt.value}
            type="button"
            className="segmented-btn"
            aria-pressed={selected}
            onClick={() => { haptic(); onChange(opt.value); }}
            whileTap={{ scale: 0.94 }}
          >
            {selected && <motion.span layoutId={`seg-${id}`} className="segmented-pill" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
            <span>{opt.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

/* Swatch (opens the native picker) + hex text input that only commits
   valid colors, and flags invalid input instead of silently ignoring it. */
export function ColorField({ label, value, onChange, id: idProp, hideLabel = false }) {
  const autoId = useId();
  const id = idProp || autoId;
  const [draft, setDraft] = useState(value);
  const [invalid, setInvalid] = useState(false);
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) { setPrevValue(value); setDraft(value); setInvalid(false); }

  function handleText(v) {
    setDraft(v);
    const hex = normalizeHex(v);
    setInvalid(!hex && v.replace('#', '').length >= 3);
    if (hex && (v.replace('#', '').length === 6 || v.replace('#', '').length === 3)) onChange(hex);
  }

  return (
    <div className="field">
      {label && <label className={hideLabel ? 'sr-only' : 'field-label'} htmlFor={id}>{label}</label>}
      <div className="color-field">
        <motion.div className="color-swatch" style={{ background: value }}>
          <input type="color" aria-label={`${label || 'Color'} picker`} value={value.toLowerCase()} onChange={e => onChange(e.target.value.toUpperCase())} />
        </motion.div>
        <input
          id={id}
          className="input mono"
          value={draft}
          spellCheck={false}
          autoComplete="off"
          aria-invalid={invalid}
          onChange={e => handleText(e.target.value)}
          onBlur={() => { setDraft(value); setInvalid(false); }}
        />
      </div>
    </div>
  );
}

export function CopyButton({ copied, onClick, children = 'Copy', className = 'btn btn-ghost btn-sm' }) {
  return (
    <motion.button type="button" className={className} onClick={e => { haptic(12); onClick(e); }} whileTap={{ scale: 0.94 }} style={{ position: 'relative' }}>
      <AnimatePresence>
        {copied && (
          <motion.span
            className="toast-copied"
            initial={{ opacity: 0, y: 6, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -6, x: '-50%' }}
          >
            Copied ✓
          </motion.span>
        )}
      </AnimatePresence>
      {children}
    </motion.button>
  );
}

/* Stays mounted while values change (no flicker while dragging a color);
   only the icon swaps, and only when pass/fail actually flips. */
export function PassBadge({ pass, children }) {
  return (
    <span className={'badge ' + (pass ? 'badge-pass' : 'badge-fail')} style={{ transition: 'background-color .3s ease, color .3s ease' }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={String(pass)}
          initial={{ scale: 0.4, rotate: -45, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0.4, opacity: 0 }}
          transition={{ duration: 0.18 }}
          style={{ display: 'inline-block' }}
        >
          {pass ? '✓' : '✕'}
        </motion.span>
      </AnimatePresence>
      {children ?? (pass ? 'Pass' : 'Fail')}
    </span>
  );
}

export function RangeField({ label, value, min, max, step = 1, onChange, format = v => v }) {
  const id = useId();
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        <span>{label}</span>
        <span className="mono" style={{ color: 'var(--text)' }}>{format(value)}</span>
      </label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} style={{ '--fill': `${fill}%` }} onChange={e => onChange(Number(e.target.value))} />
    </div>
  );
}
