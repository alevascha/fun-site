import { motion } from 'framer-motion';
import { clamp, hslToRgb, rgbToHex } from '../lib/color';
import { getHarmonyHues } from '../lib/palette';

export default function HarmonyPreview({ baseHsl, harmony, size = 120 }) {
  const CX = 70, CY = 70, R = 50;
  const isMonoLike = harmony === 'shades' || harmony === 'monochromatic';
  const hues = isMonoLike ? [baseHsl.h] : getHarmonyHues(baseHsl.h, harmony);

  return (
    <svg viewBox="0 0 140 140" style={{ width: size, height: size, flex: 'none' }} aria-hidden="true">
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(127,127,127,.3)" strokeWidth="1" strokeDasharray="3 4" />
      {hues.map((hue, i) => {
        const angle = ((-90 + (hue - baseHsl.h)) * Math.PI) / 180;
        const x = CX + Math.cos(angle) * R;
        const y = CY + Math.sin(angle) * R;
        const hex = (() => { const rgb = hslToRgb(hue, clamp(baseHsl.s, 45, 90), 55); return rgbToHex(rgb.r, rgb.g, rgb.b); })();
        return (
          <g key={i}>
            <motion.line x1={CX} y1={CY} animate={{ x2: x, y2: y, stroke: hex }} initial={false} strokeWidth="1.5" opacity=".55" transition={{ type: 'spring', stiffness: 200, damping: 20 }} />
            <motion.circle animate={{ cx: x, cy: y, fill: hex }} initial={false} r={i === 0 ? 13 : 10} stroke="rgba(0,0,0,.25)" strokeWidth="1" transition={{ type: 'spring', stiffness: 200, damping: 20 }} />
          </g>
        );
      })}
    </svg>
  );
}
