import { useEffect, useMemo, useRef } from 'react';
import { hslToRgb, rgbToHex } from '../lib/color';

const WHEEL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWX'.split('');
const SPOKES = 96;
const LETTER_EVERY = 4;
const RINGS = 9;
const CX = 300, CY = 300;
const R_MIN = 65, R_MAX = 250;
const VB = 600;

export default function ColorWheel({ baseHsl, onChange, size = 280 }) {
  const svgRef = useRef(null);
  const draggingRef = useRef(false);

  const spokes = useMemo(() => {
    const list = [];
    for (let i = 0; i < SPOKES; i++) {
      const angleDeg = -90 + i * (360 / SPOKES);
      const angleRad = (angleDeg * Math.PI) / 180;
      const hue = i * (360 / SPOKES);
      const isLettered = i % LETTER_EVERY === 0;
      const dots = [];
      for (let j = 0; j < RINGS; j++) {
        const t = j / (RINGS - 1);
        const r = R_MIN + t * (R_MAX - R_MIN);
        const cx = CX + Math.cos(angleRad) * r;
        const cy = CY + Math.sin(angleRad) * r;
        const l = 92 - t * (92 - 50);
        const s = 32 + t * (92 - 32);
        const rgb = hslToRgb(hue, s, l);
        const dotR = (isLettered ? 7 : 4) + t * (isLettered ? 7 : 3.5);
        dots.push({ cx, cy, l, s, dotR, hex: rgbToHex(rgb.r, rgb.g, rgb.b) });
      }
      list.push({ hue, isLettered, letter: isLettered ? WHEEL_LETTERS[i / LETTER_EVERY] : null, dots });
    }
    return list;
  }, []);

  function pointToHue(clientX, clientY) {
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = VB / rect.width, scaleY = VB / rect.height;
    const x = (clientX - rect.left) * scaleX - 10;
    const y = (clientY - rect.top) * scaleY - 10;
    const dx = x - CX, dy = y - CY;
    let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    angle = (angle + 90 + 360) % 360;
    const idx = Math.round(angle / (360 / SPOKES)) % SPOKES;
    return idx * (360 / SPOKES);
  }

  function handlePointerDown(e) {
    draggingRef.current = true;
    const hue = pointToHue(e.clientX, e.clientY);
    onChange({ ...baseHsl, h: hue });
  }
  function handleTouchStart(e) {
    draggingRef.current = true;
    const t = e.touches[0];
    const hue = pointToHue(t.clientX, t.clientY);
    onChange({ ...baseHsl, h: hue });
  }
  useEffect(() => {
    function move(e) {
      if (!draggingRef.current) return;
      const hue = pointToHue(e.clientX, e.clientY);
      onChange(prev => ({ ...prev, h: hue }));
    }
    function touchMove(e) {
      if (!draggingRef.current) return;
      const t = e.touches[0];
      if (!t) return;
      const hue = pointToHue(t.clientX, t.clientY);
      onChange(prev => ({ ...prev, h: hue }));
    }
    function up() { draggingRef.current = false; }
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', touchMove, { passive: true });
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', touchMove);
      window.removeEventListener('touchend', up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const step = 360 / SPOKES;
  const selectedIdx = Math.round((((baseHsl.h % 360) + 360) % 360) / step) % SPOKES;

  return (
    <div style={{ width: '100%', maxWidth: size, margin: '0 auto' }}>
      <svg
        ref={svgRef}
        viewBox="-10 -10 620 620"
        style={{ width: '100%', height: 'auto', aspectRatio: '1 / 1', display: 'block', cursor: 'pointer', userSelect: 'none', overflow: 'visible', touchAction: 'none' }}
        onMouseDown={handlePointerDown}
        onTouchStart={handleTouchStart}
      >
        {spokes.map((spoke, i) => {
          const isSelectedSpoke = i === selectedIdx;
          let closest = spoke.dots[0], closestDelta = Infinity;
          if (isSelectedSpoke) {
            spoke.dots.forEach(d => {
              const delta = Math.abs(d.l - baseHsl.l);
              if (delta < closestDelta) { closestDelta = delta; closest = d; }
            });
          }
          return (
            <g key={i}>
              {spoke.dots.map((d, j) => (
                <circle
                  key={j}
                  className="wheel-dot"
                  cx={d.cx} cy={d.cy} r={d.dotR}
                  fill={d.hex}
                  style={isSelectedSpoke && d === closest ? { stroke: 'var(--text)', strokeWidth: 4 } : undefined}
                  onClick={(e) => { e.stopPropagation(); onChange({ h: spoke.hue, s: d.s, l: d.l }); }}
                />
              ))}
              {spoke.letter && (
                <text
                  x={spoke.dots[RINGS - 1].cx} y={spoke.dots[RINGS - 1].cy + 4}
                  textAnchor="middle" fontWeight="800" fontSize="11" fill="#fff" pointerEvents="none"
                >
                  {spoke.letter}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
