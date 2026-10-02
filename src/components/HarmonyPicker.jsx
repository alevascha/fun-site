import { motion } from 'framer-motion';
import { HARMONIES } from '../lib/palette';

function HarmonyIcon({ offsets }) {
  const R = 15, C = 19;
  return (
    <svg viewBox="0 0 38 38" width="34" height="34" aria-hidden="true">
      <circle cx={C} cy={C} r={17} fill="none" stroke="currentColor" strokeWidth="1" opacity=".25" />
      {offsets.map((off, i) => {
        const angle = ((-90 + off) * Math.PI) / 180;
        const x = C + Math.cos(angle) * R;
        const y = C + Math.sin(angle) * R;
        return (
          <g key={i}>
            {i > 0 && <line x1={C} y1={C} x2={x} y2={y} stroke="currentColor" strokeWidth="1" opacity=".5" />}
            <circle cx={x} cy={y} r={4} fill="currentColor" />
          </g>
        );
      })}
    </svg>
  );
}

export default function HarmonyPicker({ value, onChange }) {
  return (
    <div className="harmony-grid" role="group" aria-label="Color harmony">
      {HARMONIES.map(h => {
        const selected = value === h.id;
        return (
          <motion.button
            key={h.id}
            type="button"
            className="harmony-btn"
            aria-pressed={selected}
            onClick={() => onChange(h.id)}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            {selected && <motion.span layoutId="harmony-pill" className="harmony-btn-bg" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
            <motion.span animate={{ rotate: selected ? 360 : 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} style={{ display: 'grid' }}>
              <HarmonyIcon offsets={h.offsets} />
            </motion.span>
            <span>{h.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
