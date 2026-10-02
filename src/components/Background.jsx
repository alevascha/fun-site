import { useEffect, useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';

/* Page-wide animated backdrop: drifting orbs with parallax, a dot grid that
   lights up around the pointer, a soft spotlight, a scroll progress bar, and
   per-card border light. Writes CSS variables only (no React re-renders).

   Mouse: everything follows the cursor.
   Touch: the light wanders on its own (Lissajous path) and jumps to your
   finger while touching; the phone's tilt drives the orb parallax; taps
   leave a ripple. */
export default function Background() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  const orbY = useTransform(scrollYProgress, [0, 1], ['0%', '-25%']);
  const orbRotate = useTransform(scrollYProgress, [0, 1], [0, 40]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    let frame = 0, x = window.innerWidth / 2, y = window.innerHeight / 3;
    let px = 0, py = 0;
    let lastTouch = 0, wanderRaf = 0, lastCard = null;

    const apply = () => {
      frame = 0;
      el.style.setProperty('--cx', `${x}px`);
      el.style.setProperty('--cy', `${y}px`);
      el.style.setProperty('--px', px.toFixed(3));
      el.style.setProperty('--py', py.toFixed(3));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(apply); };

    const lightCard = target => {
      const card = target?.closest?.('.card, .more-link, .check-row, .exp-card');
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${x - r.left}px`);
        card.style.setProperty('--my', `${y - r.top}px`);
      }
      if (lastCard && lastCard !== card) lastCard.style.removeProperty('--mx');
      lastCard = card;
    };

    const onMove = e => {
      x = e.clientX; y = e.clientY;
      if (e.pointerType === 'touch') lastTouch = performance.now();
      else { px = x / window.innerWidth - 0.5; py = y / window.innerHeight - 0.5; }
      lightCard(e.target);
      el.dataset.active = 'true';
      schedule();
    };
    const onLeave = () => { if (!coarse) el.dataset.active = 'false'; };

    const onDown = e => {
      onMove(e);
      if (e.pointerType !== 'touch' || reduce) return;
      const dot = document.createElement('span');
      dot.className = 'touch-ripple';
      dot.style.left = `${e.clientX}px`;
      dot.style.top = `${e.clientY}px`;
      document.body.appendChild(dot);
      dot.addEventListener('animationend', () => dot.remove(), { once: true });
    };

    // Phone tilt → parallax (fires without a permission prompt on Android;
    // iOS only delivers it after the user granted motion access elsewhere).
    const onTilt = e => {
      if (e.gamma == null || e.beta == null) return;
      px = Math.max(-0.5, Math.min(0.5, e.gamma / 60));
      py = Math.max(-0.5, Math.min(0.5, (e.beta - 45) / 60));
      schedule();
    };

    // Ambient wander so touch screens still feel alive.
    const wander = t => {
      if (performance.now() - lastTouch > 1800) {
        const s = t / 1000;
        x = window.innerWidth * (0.5 + 0.38 * Math.sin(s * 0.45));
        y = window.innerHeight * (0.45 + 0.3 * Math.sin(s * 0.31 + 1.3));
        lightCard(document.elementFromPoint(x, y));
        apply();
      }
      wanderRaf = requestAnimationFrame(wander);
    };
    if (coarse && !reduce) {
      el.dataset.active = 'true';
      wanderRaf = requestAnimationFrame(wander);
      window.addEventListener('deviceorientation', onTilt, { passive: true });
    }

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('deviceorientation', onTilt);
      cancelAnimationFrame(frame);
      cancelAnimationFrame(wanderRaf);
    };
  }, []);

  return (
    <>
      <motion.div className="scroll-progress" style={{ scaleX: progress }} aria-hidden="true" />
      <div ref={ref} className="bg-fx" aria-hidden="true">
        <motion.div className="bg-orbs" style={{ y: orbY, rotate: orbRotate }}>
          <span className="bg-orb bg-orb-1" />
          <span className="bg-orb bg-orb-2" />
          <span className="bg-orb bg-orb-3" />
        </motion.div>
        <div className="bg-grid" />
        <div className="bg-grid bg-grid-lit" />
        <div className="bg-spotlight" />
      </div>
    </>
  );
}
