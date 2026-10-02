/* Damped spring simulation (semi-implicit Euler at 600 Hz), from 0 → 1.
   Returns sampled points plus the time it takes to settle. */
export function simulateSpring({ stiffness, damping, mass, velocity = 0 }) {
  const dt = 1 / 600;
  let x = 0, v = velocity, t = 0, settledAt = null;
  const points = [{ t: 0, x: 0 }];
  let i = 0;
  while (t < 6) {
    const a = (-stiffness * (x - 1) - damping * v) / mass;
    v += a * dt;
    x += v * dt;
    t += dt;
    if (++i % 5 === 0) points.push({ t, x });
    const resting = Math.abs(x - 1) < 0.0005 && Math.abs(v) < 0.005;
    if (resting && settledAt === null) settledAt = t;
    if (!resting) settledAt = null;
    if (settledAt !== null && t - settledAt > 0.05) break;
  }
  const duration = settledAt ?? t;
  return { points: points.filter(p => p.t <= duration + 0.001), duration };
}

/* CSS linear() easing that reproduces the spring when played over `duration`. */
export function springToLinear({ points, duration }, steps = 48) {
  const out = [];
  for (let s = 0; s <= steps; s++) {
    const target = (s / steps) * duration;
    let j = points.findIndex(p => p.t >= target);
    if (j === -1) j = points.length - 1;
    const p = points[j], q = points[Math.max(0, j - 1)];
    const k = p.t === q.t ? 0 : (target - q.t) / (p.t - q.t);
    out.push(+(q.x + (p.x - q.x) * k).toFixed(4));
  }
  out[out.length - 1] = 1;
  return `linear(${out.join(', ')})`;
}

/* SwiftUI .spring(response:dampingFraction:) equivalents. */
export function springToSwift({ stiffness, damping, mass }) {
  const response = (2 * Math.PI) / Math.sqrt(stiffness / mass);
  const dampingFraction = damping / (2 * Math.sqrt(stiffness * mass));
  return { response: +response.toFixed(3), dampingFraction: +dampingFraction.toFixed(3) };
}

/* y for a CSS cubic-bezier at progress x (Newton + bisection fallback). */
export function bezierAt([x1, y1, x2, y2], x) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = t => ((ax * t + bx) * t + cx) * t;
  const sy = t => ((ay * t + by) * t + cy) * t;
  const dsx = t => (3 * ax * t + 2 * bx) * t + cx;
  let t = x;
  for (let i = 0; i < 8; i++) {
    const err = sx(t) - x;
    if (Math.abs(err) < 1e-6) return sy(t);
    const d = dsx(t);
    if (Math.abs(d) < 1e-6) break;
    t -= err / d;
  }
  let lo = 0, hi = 1;
  t = x;
  for (let i = 0; i < 30; i++) {
    const v = sx(t);
    if (Math.abs(v - x) < 1e-6) break;
    if (v < x) lo = t; else hi = t;
    t = (lo + hi) / 2;
  }
  return sy(t);
}

export const BEZIER_PRESETS = [
  { name: 'Lab out', value: [0.16, 1, 0.3, 1] },
  { name: 'Ease', value: [0.25, 0.1, 0.25, 1] },
  { name: 'Ease in-out', value: [0.42, 0, 0.58, 1] },
  { name: 'Material standard', value: [0.2, 0, 0, 1] },
  { name: 'Material emphasized decel.', es: 'Material enfatizado (desacel.)', value: [0.05, 0.7, 0.1, 1] },
  { name: 'Back out', value: [0.34, 1.56, 0.64, 1] },
  { name: 'Anticipate', es: 'Anticipación', value: [0.36, 0, 0.66, -0.56] },
  { name: 'Snap', es: 'Seco', value: [0.85, 0, 0.15, 1] },
];

export const SPRING_PRESETS = [
  { name: 'Gentle', es: 'Suave', value: { stiffness: 120, damping: 20, mass: 1 } },
  { name: 'Snappy', es: 'Ágil', value: { stiffness: 400, damping: 30, mass: 1 } },
  { name: 'Bouncy', es: 'Rebotón', value: { stiffness: 300, damping: 12, mass: 1 } },
  { name: 'Wobbly', es: 'Tembloroso', value: { stiffness: 180, damping: 8, mass: 1 } },
  { name: 'Heavy', es: 'Pesado', value: { stiffness: 200, damping: 30, mass: 3 } },
];
