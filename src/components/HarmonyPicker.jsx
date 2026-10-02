import { motion } from 'framer-motion';
import { HARMONIES } from '../lib/palette';

function HarmonyIcon({ offsets }) {
  const R = 15, C = 19;
  return (
    <svg viewBox="0 0 38 38" width="30" height="30">
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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
      {HARMONIES.map(h => (
        <motion.button
          key={h.id}
          onClick={() => onChange(h.id)}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.92 }}
          animate={{ scale: value === h.id ? 1.04 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            padding: '8px 4px', borderRadius: 10, cursor: 'pointer', fontSize: 9,
            background: value === h.id ? 'var(--panel-active)' : 'var(--panel2)',
            border: value === h.id ? '1px solid var(--text)' : '1px solid var(--border)',
            color: value === h.id ? 'var(--text)' : 'var(--muted)',
            transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
          }}
        >
          <HarmonyIcon offsets={h.offsets} />
          <span>{h.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
