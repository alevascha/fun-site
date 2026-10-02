import { useEffect, useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';

/* Page-wide animated backdrop: drifting orbs with mouse parallax, a dot grid
   that lights up around the cursor, a soft spotlight, and a scroll progress
   bar. Pointer tracking writes CSS variables (no React re-renders). */
export default function Background() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  const orbY = useTransform(scrollYProgress, [0, 1], ['0%', '-25%']);
  const orbRotate = useTransform(scrollYProgress, [0, 1], [0, 40]);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(pointer: coarse)').matches) return;
    let frame = 0, x = window.innerWidth / 2, y = window.innerHeight / 3;
    const apply = () => {
      frame = 0;
      el.style.setProperty('--cx', `${x}px`);
      el.style.setProperty('--cy', `${y}px`);
      el.style.setProperty('--px', ((x / window.innerWidth) - 0.5).toFixed(3));
      el.style.setProperty('--py', ((y / window.innerHeight) - 0.5).toFixed(3));
    };
    let lastCard = null;
    const onMove = e => {
      x = e.clientX; y = e.clientY;
      // Border spotlight: any .card under the pointer gets local --mx/--my.
      const card = e.target.closest?.('.card, .more-link, .check-row');
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${x - r.left}px`);
        card.style.setProperty('--my', `${y - r.top}px`);
      }
      if (lastCard && lastCard !== card) lastCard.style.removeProperty('--mx');
      lastCard = card;
      el.dataset.active = 'true';
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => { el.dataset.active = 'false'; };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(frame);
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
