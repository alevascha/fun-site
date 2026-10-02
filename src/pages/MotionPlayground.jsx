import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ToolPage from '../components/ToolPage';
import { CopyButton, RangeField, Reveal, Segmented } from '../components/ui';
import { BEZIER_PRESETS, SPRING_PRESETS, simulateSpring, springToLinear, springToSwift } from '../lib/spring';
import { kebab } from '../lib/tokens';
import useCopy from '../hooks/useCopy';
import { haptic } from '../lib/haptics';
import { track } from '../lib/analytics';

/* ---------- cubic-bezier editor ---------- */

const X = x => 20 + x * 200;
const Y = y => 230 - y * 180;

function BezierEditor({ value, onChange }) {
  const svgRef = useRef(null);
  const [x1, y1, x2, y2] = value;

  const toUnit = useCallback((clientX, clientY) => {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = clientX; pt.y = clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    const x = Math.min(1, Math.max(0, (p.x - 20) / 200));
    const y = Math.min(1.6, Math.max(-0.6, (230 - p.y) / 180));
    return [+x.toFixed(2), +y.toFixed(2)];
  }, []);

  function startDrag(index) {
    return e => {
      e.preventDefault();
      const target = e.currentTarget;
      target.setPointerCapture?.(e.pointerId);
      const move = ev => {
        const [x, y] = toUnit(ev.clientX, ev.clientY);
        onChange(prev => (index === 0 ? [x, y, prev[2], prev[3]] : [prev[0], prev[1], x, y]));
      };
      const up = () => { target.removeEventListener('pointermove', move); target.removeEventListener('pointerup', up); haptic(); };
      target.addEventListener('pointermove', move);
      target.addEventListener('pointerup', up);
    };
  }

  function onKey(index) {
    return e => {
      const d = e.shiftKey ? 0.1 : 0.01;
      const delta = { ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, d], ArrowDown: [0, -d] }[e.key];
      if (!delta) return;
      e.preventDefault();
      onChange(prev => {
        const next = prev.slice();
        next[index * 2] = +Math.min(1, Math.max(0, next[index * 2] + delta[0])).toFixed(2);
        next[index * 2 + 1] = +Math.min(1.6, Math.max(-0.6, next[index * 2 + 1] + delta[1])).toFixed(2);
        return next;
      });
    };
  }

  const handle = (i, hx, hy) => (
    <g key={i}>
      <line x1={X(i)} y1={Y(i)} x2={X(hx)} y2={Y(hy)} stroke="var(--muted)" strokeWidth="1.5" strokeDasharray="4 4" />
      <motion.circle
        cx={X(hx)} cy={Y(hy)} r="10"
        tabIndex={0}
        role="slider"
        aria-label={`Control point ${i + 1}: x ${hx}, y ${hy}. Use arrow keys to move.`}
        aria-valuenow={hy}
        fill={i === 0 ? '#CD57FF' : '#FFCE1F'}
        stroke="var(--surface)"
        strokeWidth="3"
        style={{ cursor: 'grab', touchAction: 'none', outline: 'none' }}
        whileHover={{ scale: 1.25 }}
        whileTap={{ scale: 1.1, cursor: 'grabbing' }}
        onPointerDown={startDrag(i)}
        onKeyDown={onKey(i)}
      />
    </g>
  );

  return (
    <svg ref={svgRef} viewBox="0 -50 240 380" style={{ width: '100%', maxWidth: 340, display: 'block', margin: '0 auto', overflow: 'visible', userSelect: 'none' }}>
      <rect x={X(0)} y={Y(1)} width="200" height="180" rx="10" fill="var(--surface-2)" stroke="var(--border)" />
      {[0.25, 0.5, 0.75].map(g => (
        <g key={g} stroke="var(--border)" strokeWidth="1">
          <line x1={X(g)} y1={Y(0)} x2={X(g)} y2={Y(1)} />
          <line x1={X(0)} y1={Y(g)} x2={X(1)} y2={Y(g)} />
        </g>
      ))}
      <line x1={X(0)} y1={Y(0)} x2={X(1)} y2={Y(1)} stroke="var(--faint)" strokeWidth="1" strokeDasharray="2 5" />
      <path d={`M ${X(0)} ${Y(0)} C ${X(x1)} ${Y(y1)}, ${X(x2)} ${Y(y2)}, ${X(1)} ${Y(1)}`} fill="none" stroke="url(#mp-grad)" strokeWidth="4" strokeLinecap="round" />
      <defs>
        <linearGradient id="mp-grad" x1="0" x2="1"><stop offset="0" stopColor="#CD57FF" /><stop offset="1" stopColor="#FFCE1F" /></linearGradient>
      </defs>
      {handle(0, x1, y1)}
      {handle(1, x2, y2)}
      <text x={X(0)} y={Y(0) + 22} fontSize="11" fill="var(--muted)">time →</text>
      <text x={X(0) - 6} y={Y(1) - 8} fontSize="11" fill="var(--muted)">progress</text>
    </svg>
  );
}

function SpringPlot({ sim }) {
  const W = 300, H = 160;
  const max = Math.max(1.05, ...sim.points.map(p => p.x));
  const path = sim.points.map((p, i) => `${i ? 'L' : 'M'} ${(p.t / sim.duration) * W} ${H - (p.x / max) * (H - 10)}`).join(' ');
  const oneY = H - (1 / max) * (H - 10);
  return (
    <svg viewBox={`0 -6 ${W} ${H + 12}`} style={{ width: '100%', display: 'block' }} aria-hidden="true">
      <rect x="0" y="0" width={W} height={H} rx="10" fill="var(--surface-2)" stroke="var(--border)" />
      <line x1="0" x2={W} y1={oneY} y2={oneY} stroke="var(--faint)" strokeDasharray="3 5" />
      <motion.path d={path} fill="none" stroke="url(#mp-grad2)" strokeWidth="3" strokeLinecap="round" initial={false} animate={{ d: path }} transition={{ duration: 0.25 }} />
      <defs><linearGradient id="mp-grad2" x1="0" x2="1"><stop offset="0" stopColor="#CD57FF" /><stop offset="1" stopColor="#FFCE1F" /></linearGradient></defs>
    </svg>
  );
}

/* ---------- page ---------- */

export default function MotionPlayground() {
  const [bezier, setBezier] = useState([0.16, 1, 0.3, 1]);
  const [duration, setDuration] = useState(600);
  const [spring, setSpring] = useState({ stiffness: 300, damping: 18, mass: 1 });
  const [demoSource, setDemoSource] = useState('spring');
  // Looping is opt-in for people who asked their OS for less motion.
  const [loop, setLoop] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [name, setName] = useState('standard');
  const [exportFormat, setExportFormat] = useState('css');
  const [copied, copy] = useCopy();
  const lanesRef = useRef([]);
  const demoRefs = useRef({});
  const trackRef = useRef(null);

  const sim = useMemo(() => simulateSpring(spring), [spring]);
  const springEasing = useMemo(() => springToLinear(sim), [sim]);
  const springMs = Math.round(sim.duration * 1000);
  const overshoot = Math.max(0, Math.max(...sim.points.map(p => p.x)) - 1);
  const swift = springToSwift(spring);
  const bezierCss = `cubic-bezier(${bezier.join(', ')})`;

  const lanes = useMemo(() => [
    { label: 'Linear', easing: 'linear', duration },
    { label: 'Your curve', easing: bezierCss, duration },
    { label: 'Your spring', easing: springEasing, duration: springMs },
  ], [duration, bezierCss, springEasing, springMs]);

  const play = useCallback(() => {
    const trackEl = trackRef.current;
    if (!trackEl) return;
    const dist = trackEl.clientWidth - 44;
    lanes.forEach((lane, i) => {
      const el = lanesRef.current[i];
      el?.getAnimations().forEach(a => a.cancel());
      el?.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${dist}px)` }], { duration: lane.duration, easing: lane.easing, fill: 'forwards' });
    });
    const demo = demoSource === 'spring' ? { easing: springEasing, duration: springMs } : { easing: bezierCss, duration };
    const d = demoRefs.current;
    d.modal?.animate([{ transform: 'scale(0.6) translateY(30px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { ...demo, fill: 'both' });
    d.toast?.animate([{ transform: 'translateY(120%)' }, { transform: 'translateY(0)' }], { ...demo, fill: 'both' });
    d.thumb?.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(28px)' }], { ...demo, fill: 'both' });
  }, [lanes, demoSource, springEasing, springMs, bezierCss, duration]);

  // Replay on every change (and on a loop) so tweaking a value is instantly visible.
  useEffect(() => {
    play();
    if (!loop) return;
    const total = Math.max(duration, springMs) + 900;
    const id = setInterval(play, total);
    return () => clearInterval(id);
  }, [play, loop, duration, springMs]);

  const n = kebab(name) || 'standard';
  const exports = {
    css: `:root {
  --ease-${n}: ${bezierCss};
  --duration-${n}: ${duration}ms;
  /* spring: stiffness ${spring.stiffness}, damping ${spring.damping}, mass ${spring.mass} */
  --spring-${n}: ${springEasing};
  --spring-${n}-duration: ${springMs}ms;
}

.card { transition: transform var(--duration-${n}) var(--ease-${n}); }
.sheet { transition: transform var(--spring-${n}-duration) var(--spring-${n}); }`,
    tokens: JSON.stringify({
      motion: {
        ease: { [n]: { $type: 'cubicBezier', $value: bezier } },
        duration: { [n]: { $type: 'duration', $value: `${duration}ms` }, [`spring-${n}`]: { $type: 'duration', $value: `${springMs}ms` } },
        spring: { [n]: { $value: { ...spring }, $description: `Settles in ${springMs}ms; CSS: ${springEasing.slice(0, 40)}…` } },
      },
    }, null, 2),
    framer: `// Framer Motion
export const ${n.replace(/-./g, m => m[1].toUpperCase())} = {
  tween: { duration: ${duration / 1000}, ease: [${bezier.join(', ')}] },
  spring: { type: 'spring', stiffness: ${spring.stiffness}, damping: ${spring.damping}, mass: ${spring.mass} },
};`,
    swift: `import SwiftUI

extension Animation {
    static let ${n.replace(/-./g, m => m[1].toUpperCase())}Curve = Animation.timingCurve(${bezier.join(', ')}, duration: ${duration / 1000})
    static let ${n.replace(/-./g, m => m[1].toUpperCase())}Spring = Animation.spring(response: ${swift.response}, dampingFraction: ${swift.dampingFraction})
}`,
  };

  return (
    <ToolPage id="motion-playground" intro="Shape a cubic-bezier by dragging its handles, tune a physical spring, and watch them race a linear timing side by side. Springs are exported as CSS linear() easings, so they run anywhere — no JavaScript needed.">
      <div className="grid-2">
        <Reveal className="card">
          <h2 className="eyebrow">Cubic-bezier <span className="mono" style={{ textTransform: 'none', letterSpacing: 0 }}>{bezierCss}</span></h2>
          <BezierEditor value={bezier} onChange={setBezier} />
          <div className="chip-row" style={{ marginTop: 14 }}>
            {BEZIER_PRESETS.map(p => (
              <motion.button key={p.name} type="button" className="btn btn-ghost btn-sm" whileTap={{ scale: 0.92 }} aria-pressed={bezier.join() === p.value.join()} onClick={() => setBezier(p.value)}
                style={bezier.join() === p.value.join() ? { background: 'var(--chip-bg)', color: 'var(--chip-text)' } : undefined}>
                {p.name}
              </motion.button>
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            <RangeField label="Duration" value={duration} min={100} max={1500} step={10} onChange={setDuration} format={v => `${v}ms`} />
          </div>
        </Reveal>

        <Reveal className="card" delay={0.05}>
          <h2 className="eyebrow">
            Spring
            <span className="chip-row">
              <span className="badge badge-neutral">settles {springMs}ms</span>
              <span className="badge badge-neutral">overshoot {Math.round(overshoot * 100)}%</span>
            </span>
          </h2>
          <SpringPlot sim={sim} />
          <div className="chip-row" style={{ marginTop: 14 }}>
            {SPRING_PRESETS.map(p => {
              const on = JSON.stringify(p.value) === JSON.stringify(spring);
              return (
                <motion.button key={p.name} type="button" className="btn btn-ghost btn-sm" whileTap={{ scale: 0.92 }} aria-pressed={on} onClick={() => setSpring(p.value)}
                  style={on ? { background: 'var(--chip-bg)', color: 'var(--chip-text)' } : undefined}>
                  {p.name}
                </motion.button>
              );
            })}
          </div>
          <div className="stack" style={{ gap: 10, marginTop: 16 }}>
            <RangeField label="Stiffness" value={spring.stiffness} min={20} max={800} step={5} onChange={v => setSpring(s => ({ ...s, stiffness: v }))} />
            <RangeField label="Damping" value={spring.damping} min={2} max={80} step={1} onChange={v => setSpring(s => ({ ...s, damping: v }))} />
            <RangeField label="Mass" value={spring.mass} min={0.2} max={5} step={0.1} onChange={v => setSpring(s => ({ ...s, mass: v }))} />
          </div>
        </Reveal>
      </div>

      <Reveal className="card" style={{ marginTop: 'clamp(14px, 1.6vw, 20px)' }}>
        <h2 className="eyebrow">
          The race
          <span className="chip-row">
            <Segmented label="Loop" value={loop ? 'loop' : 'once'} onChange={v => setLoop(v === 'loop')} options={[{ value: 'loop', label: 'Loop' }, { value: 'once', label: 'Once' }]} />
            <motion.button type="button" className="btn btn-primary btn-sm" whileTap={{ scale: 0.92 }} onClick={() => { play(); track('Motion replay'); }}>▶ Replay</motion.button>
          </span>
        </h2>
        <div ref={trackRef} className="stack" style={{ gap: 12 }}>
          {lanes.map((lane, i) => (
            <div key={lane.label} style={{ position: 'relative', height: 56, borderRadius: 999, background: 'var(--surface-2)', boxShadow: 'inset 0 0 0 1px var(--border)', display: 'flex', alignItems: 'center' }}>
              <span className="small muted" style={{ position: 'absolute', right: 18, fontFamily: 'var(--font-label)' }}>{lane.label} · {lane.duration}ms</span>
              <span
                ref={el => { lanesRef.current[i] = el; }}
                style={{ width: 44, height: 44, marginLeft: 6, borderRadius: '50%', background: ['var(--surface-3)', '#CD57FF', 'var(--accent-grad)'][i], boxShadow: i ? '0 8px 20px -8px rgba(205,87,255,.8)' : 'inset 0 0 0 1px var(--border-strong)', willChange: 'transform', position: 'relative', zIndex: 1 }}
              />
            </div>
          ))}
        </div>
      </Reveal>

      <div className="grid-2" style={{ marginTop: 'clamp(14px, 1.6vw, 20px)' }}>
        <Reveal className="card">
          <h2 className="eyebrow">
            In real UI
            <Segmented label="Demo easing" value={demoSource} onChange={setDemoSource} options={[{ value: 'spring', label: 'Spring' }, { value: 'bezier', label: 'Curve' }]} />
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
            <div style={{ height: 170, borderRadius: 18, background: 'var(--surface-2)', display: 'grid', placeItems: 'center', boxShadow: 'inset 0 0 0 1px var(--border)' }}>
              <div ref={el => { demoRefs.current.modal = el; }} style={{ width: '70%', padding: 14, borderRadius: 14, background: 'var(--surface)', boxShadow: 'var(--shadow-pop)' }}>
                <div style={{ height: 8, width: '60%', borderRadius: 4, background: 'var(--text)', opacity: 0.8 }} />
                <div style={{ height: 6, width: '90%', borderRadius: 4, background: 'var(--muted)', opacity: 0.5, marginTop: 8 }} />
                <div style={{ height: 22, width: 60, borderRadius: 999, background: '#8B6CF0', marginTop: 12, marginLeft: 'auto' }} />
              </div>
            </div>
            <div style={{ height: 170, borderRadius: 18, background: 'var(--surface-2)', overflow: 'hidden', position: 'relative', boxShadow: 'inset 0 0 0 1px var(--border)' }}>
              <div ref={el => { demoRefs.current.toast = el; }} style={{ position: 'absolute', left: 12, right: 12, bottom: 12, padding: '12px 14px', borderRadius: 14, background: 'var(--chip-bg)', color: 'var(--chip-text)', fontSize: 13, fontWeight: 600 }}>
                ✓ Changes saved
              </div>
            </div>
            <div style={{ height: 170, borderRadius: 18, background: 'var(--surface-2)', display: 'grid', placeItems: 'center', boxShadow: 'inset 0 0 0 1px var(--border)' }}>
              <div ref={el => { demoRefs.current.track = el; }} style={{ width: 62, height: 34, borderRadius: 999, padding: 3, background: '#8B6CF0' }}>
                <div ref={el => { demoRefs.current.thumb = el; }} style={{ width: 28, height: 28, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,.3)' }} />
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal className="card" delay={0.05}>
          <h2 className="eyebrow">
            Export
            <CopyButton copied={copied === 'out'} onClick={() => copy(exports[exportFormat], 'out', { name: 'Copy', props: { tool: 'motion-playground', format: exportFormat } })}>Copy</CopyButton>
          </h2>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
            <input className="input" aria-label="Token name" value={name} onChange={e => setName(e.target.value)} style={{ maxWidth: 160 }} />
            <Segmented label="Export format" value={exportFormat} onChange={setExportFormat} options={[{ value: 'css', label: 'CSS' }, { value: 'tokens', label: 'Tokens' }, { value: 'framer', label: 'Framer Motion' }, { value: 'swift', label: 'SwiftUI' }]} />
          </div>
          <pre className="code-block" data-lenis-prevent style={{ maxHeight: 300 }}>{exports[exportFormat]}</pre>
        </Reveal>
      </div>
    </ToolPage>
  );
}
