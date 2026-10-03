import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { EASE, REVEAL_VIEWPORT } from '../../lib/motion';

/* Masked per-character reveal. Words stay unbroken; screen readers get the
   plain string from a visually hidden copy (aria-label isn't allowed on
   plain span/em elements, so it would be ignored there). */
/* With `reactive`:
   - desktop: letters near the cursor lift, grow and lean away from it;
   - touch: letters ride a sine wave driven by scroll position.
   rAF-batched, transforms only, off for reduced motion. */
function useReactiveLetters(ref, enabled) {
  useEffect(() => {
    const root = ref.current;
    if (!enabled || !root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const chars = [...root.querySelectorAll('[data-char]')];
    let frame = 0;

    if (window.matchMedia('(pointer: coarse)').matches) {
      const wave = () => {
        frame = 0;
        const rect = root.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const phase = window.scrollY * 0.018;
        const amp = Math.min(1, window.scrollY / 120); // calm at rest, wavier as you scroll
        chars.forEach((el, i) => {
          const w = Math.sin(phase + i * 0.55);
          el.style.transform = `translateY(${(w * 0.09 * amp).toFixed(3)}em) rotate(${(w * 4 * amp).toFixed(2)}deg)`;
        });
      };
      const onScroll = () => { if (!frame) frame = requestAnimationFrame(wave); };
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame); };
    }

    let mx = -9999, my = -9999;
    const RADIUS = 180;
    const apply = () => {
      frame = 0;
      for (const el of chars) {
        const r = el.getBoundingClientRect();
        const dx = r.left + r.width / 2 - mx, dy = r.top + r.height / 2 - my;
        const f = Math.max(0, 1 - Math.hypot(dx, dy) / RADIUS);
        el.style.transform = f > 0
          ? `translateY(${(-f * 0.18).toFixed(3)}em) scale(${(1 + f * 0.14).toFixed(3)}) rotate(${(Math.sign(dx) * f * 7).toFixed(2)}deg)`
          : '';
      }
    };
    const onMove = e => { mx = e.clientX; my = e.clientY; if (!frame) frame = requestAnimationFrame(apply); };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => { window.removeEventListener('pointermove', onMove); cancelAnimationFrame(frame); };
  }, [ref, enabled]);
}

export default function SplitText({ text, as = 'span', delay = 0, stagger = 0.025, className, style, inView = false, charClassName, reactive = false }) {
  const Comp = motion[as];
  const ref = useRef(null);
  useReactiveLetters(ref, reactive);
  let i = 0;
  const words = text.split(' ');
  const total = text.replace(/ /g, '').length;
  const trigger = inView
    ? { initial: 'hidden', whileInView: 'show', viewport: REVEAL_VIEWPORT }
    : { initial: 'hidden', animate: 'show' };
  return (
    <Comp ref={ref} className={className} style={style} {...trigger}>
      <span className="sr-only">{text}</span>
      {words.map((word, wi) => (
        <span key={wi} aria-hidden="true" style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
          {[...word].map(ch => {
            const idx = i++;
            return (
              <span key={idx} data-char style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: '0.12em', marginBottom: '-0.12em', transition: 'transform 0.35s cubic-bezier(.16,1,.3,1)' }}>
                <motion.span
                  className={charClassName}
                  style={{ display: 'inline-block', '--i': idx, '--n': total }}
                  variants={{
                    hidden: { y: '110%', rotate: 8 },
                    show: { y: '0%', rotate: 0, transition: { duration: 0.8, ease: EASE, delay: delay + idx * stagger } },
                  }}
                >
                  {ch}
                </motion.span>
              </span>
            );
          })}
          {wi < words.length - 1 && ' '}
        </span>
      ))}
    </Comp>
  );
}
