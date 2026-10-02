import { clamp, hslToRgb, rgbToHex } from '../lib/color';
import { getHarmonyHues } from '../lib/palette';

export default function HarmonyPreview({ baseHsl, harmony }) {
  const CX = 70, CY = 70, R = 50;
  const isMonoLike = harmony === 'shades' || harmony === 'monochromatic';
  const hues = isMonoLike ? [baseHsl.h] : getHarmonyHues(baseHsl.h, harmony);

  return (
    <svg viewBox="0 0 140 140" style={{ width: 90, height: 90, flex: 'none' }}>
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(127,127,127,.3)" strokeWidth="1" />
      {hues.map((hue, i) => {
        const angle = ((-90 + (hue - baseHsl.h)) * Math.PI) / 180;
        const x = CX + Math.cos(angle) * R;
        const y = CY + Math.sin(angle) * R;
        const rgb = hslToRgb(hue, clamp(baseHsl.s, 45, 90), 55);
        const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        return (
          <g key={i}>
            <line x1={CX} y1={CY} x2={x} y2={y} stroke={hex} strokeWidth="1.5" opacity=".55" />
            <circle cx={x} cy={y} r={i === 0 ? 12 : 9} fill={hex} stroke="rgba(0,0,0,.25)" strokeWidth="1" />
          </g>
        );
      })}
    </svg>
  );
}
