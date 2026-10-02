import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';

const INTERACTIVE = 'a, button, [role="button"], input, select, textarea, label, [data-cursor]';

/* A spring-follow ring + dot that morphs over interactive elements and can
   show a label (set data-cursor="Open" on any element). Pointer devices only;
   the native cursor stays visible for usability. */
export default function Cursor() {
  const [enabled] = useState(() => typeof window !== 'undefined'
    && window.matchMedia('(pointer: fine)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const x = useMotionValue(-100), y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 350, damping: 30, mass: 0.6 });
  const ry = useSpring(y, { stiffness: 350, damping: 30, mass: 0.6 });
  const [mode, setMode] = useState('idle'); // idle | hover | label | text | down
  const [label, setLabel] = useState('');
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const move = e => { x.set(e.clientX); y.set(e.clientY); setVisible(true); };
    const over = e => {
      const t = e.target.closest?.(INTERACTIVE);
      if (!t) { setMode('idle'); setLabel(''); return; }
      const l = t.getAttribute('data-cursor');
      if (l) { setMode('label'); setLabel(l); }
      else if (t.matches('input:not([type=range]):not([type=color]), textarea')) { setMode('text'); setLabel(''); }
      else { setMode('hover'); setLabel(''); }
    };
    const leave = () => { setVisible(false); setPressed(false); };
    const down = e => { if (e.pointerType === 'mouse' || e.pointerType === 'pen') setPressed(true); };
    // A long press can turn into a drag or a context menu, and then no
    // pointerup arrives, so release on every way a press can end.
    const up = () => setPressed(false);
    const ends = ['pointerup', 'pointercancel', 'dragstart', 'contextmenu', 'blur', 'resize'];
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerover', over, { passive: true });
    document.addEventListener('pointerleave', leave);
    window.addEventListener('pointerdown', down, { passive: true });
    ends.forEach(n => window.addEventListener(n, up, { passive: true }));
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerover', over);
      document.removeEventListener('pointerleave', leave);
      window.removeEventListener('pointerdown', down);
      ends.forEach(n => window.removeEventListener(n, up));
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const size = mode === 'label' ? 84 : mode === 'hover' ? 52 : mode === 'text' ? 6 : 34;

  return (
    <>
      <motion.div
        className={'cursor-ring cursor-' + mode}
        aria-hidden="true"
        style={{ x: rx, y: ry }}
        // Scale goes through motion (after x/y), never CSS `scale`, which would
        // also shrink the position offset and throw the ring off the pointer.
        animate={{ width: size, height: mode === 'text' ? 28 : size, opacity: visible ? 1 : 0, scale: pressed ? 0.8 : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      >
        <AnimatePresence>
          {mode === 'label' && (
            <motion.span key={label} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}>
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
      <motion.div className="cursor-dot" aria-hidden="true" style={{ x, y }} animate={{ opacity: visible && mode !== 'label' ? 1 : 0 }} />
    </>
  );
}
