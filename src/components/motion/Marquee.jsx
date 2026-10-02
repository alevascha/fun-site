import { useRef } from 'react';
import { motion, useAnimationFrame, useReducedMotion, useMotionValue, useScroll, useSpring, useTransform, useVelocity } from 'framer-motion';

const wrap = (min, max, v) => ((((v - min) % (max - min)) + (max - min)) % (max - min)) + min;

/* Infinite marquee whose speed and direction follow scroll velocity. */
export default function Marquee({ items, baseVelocity = -0.9 }) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(velocity, [-1000, 0, 1000], [-2, 0, 2], { clamp: false });
  const skew = useTransform(velocity, [-2000, 0, 2000], [4, 0, -4]);
  const x = useTransform(baseX, v => `${wrap(-50, 0, v)}%`);
  const direction = useRef(1);
  const reduce = useReducedMotion();

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    let move = direction.current * baseVelocity * (delta / 1000);
    const f = factor.get();
    if (f < 0) direction.current = -1; else if (f > 0) direction.current = 1;
    move += direction.current * move * f;
    baseX.set(baseX.get() + move);
  });

  const row = [...items, ...items];
  return (
    <div className="marquee" aria-hidden="true">
      <motion.div className="marquee-track" style={{ x, skewX: skew }}>
        {[0, 1].map(k => (
          <span key={k} className="marquee-group">
            {row.map((it, i) => (
              <span key={i} className="marquee-item">
                {it}<span className="marquee-star">✦</span>
              </span>
            ))}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
