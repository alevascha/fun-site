import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/* Pulls its child toward the cursor while hovered, then springs back. */
export default function Magnetic({ children, strength = 0.35, className, style }) {
  const ref = useRef(null);
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 15, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 15, mass: 0.4 });

  function onMove(e) {
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  }
  function reset() { x.set(0); y.set(0); }

  return (
    <motion.span ref={ref} className={className} style={{ display: 'inline-flex', x, y, ...style }} onPointerMove={onMove} onPointerLeave={reset}>
      {children}
    </motion.span>
  );
}
