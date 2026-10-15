import { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { EASE } from '../lib/motion';

/* Numbered steps joined by a gradient line that fills as the list scrolls
   through the viewport. Horizontal on desktop, vertical on phones. Used by
   the tool pages ("How to use") and /pro ("How your license works").
   items: [{ title?, text }] */
export default function Steps({ items }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 60%'] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <ol ref={ref} className="steps" style={{ '--n': items.length }}>
      <motion.span className="steps-line" aria-hidden="true" style={{ '--fill': fill }} />
      {items.map((s, i) => (
        <motion.li
          key={s.text}
          className="step"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: EASE, delay: i * 0.12 }}
        >
          <span className="step-num" aria-hidden="true">{i + 1}</span>
          {s.title && <h3>{s.title}</h3>}
          <p className="muted">{s.text}</p>
        </motion.li>
      ))}
    </ol>
  );
}
