import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { hslToHex } from '../lib/color';
import { getHarmonyHues } from '../lib/palette';
import ToolPage from '../components/ToolPage';
import { ColorField, CopyButton, RangeField, Reveal, Segmented } from '../components/ui';
import { EASE } from '../lib/motion';
import useCopy from '../hooks/useCopy';
import { track } from '../lib/analytics';

let uid = 0;
const nextId = () => ++uid;

const PRESETS = {
  lab: {
    stops: [['#CD57FF', 0], ['#8B6CF0', 45], ['#FFCE1F', 100]],
    mesh: { bg: '#1D1C1B', points: [['#CD57FF', 15, 20, 55], ['#8B6CF0', 85, 15, 50], ['#FFCE1F', 60, 90, 55], ['#FF7AB6', 10, 85, 40]] },
  },
  sunset: {
    stops: [['#2B1A4F', 0], ['#FF7AB6', 55], ['#FFB36B', 80], ['#FFCE1F', 100]],
    mesh: { bg: '#2B1A4F', points: [['#FF7AB6', 20, 30, 50], ['#FFB36B', 75, 60, 55], ['#FFCE1F', 50, 100, 45], ['#6B4CC8', 90, 5, 45]] },
  },
  mint: {
    stops: [['#0F3D3E', 0], ['#2F9C7B', 50], ['#C9F2D9', 100]],
    mesh: { bg: '#E9F1E4', points: [['#2F9C7B', 10, 10, 50], ['#9FD3A8', 90, 30, 55], ['#F7D488', 40, 90, 45], ['#0F3D3E', 100, 100, 35]] },
  },
};

function fromPreset(name) {
  const p = PRESETS[name];
  return {
    stops: p.stops.map(([color, pos]) => ({ id: nextId(), color, pos })),
    meshBg: p.mesh.bg,
    points: p.mesh.points.map(([color, x, y, size]) => ({ id: nextId(), color, x, y, size })),
  };
}

function buildCss({ mode, angle, stops, points, meshBg }) {
  const sorted = [...stops].sort((a, b) => a.pos - b.pos).map(s => `${s.color} ${s.pos}%`).join(', ');
  if (mode === 'linear') return `linear-gradient(${angle}deg, ${sorted})`;
  if (mode === 'radial') return `radial-gradient(circle at 50% 50%, ${sorted})`;
  if (mode === 'conic') return `conic-gradient(from ${angle}deg at 50% 50%, ${sorted})`;
  return points.map(p => `radial-gradient(at ${p.x}% ${p.y}%, ${p.color} 0px, transparent ${p.size}%)`).join(',\n    ') + `,\n    ${meshBg}`;
}

/* Pointer-drag helper: calls onMove with 0–100 percentages inside `box`. */
function useDrag(boxRef, onMove) {
  return e => {
    e.preventDefault();
    const target = e.currentTarget;
    target.setPointerCapture?.(e.pointerId);
    const move = ev => {
      const r = boxRef.current.getBoundingClientRect();
      const x = Math.min(100, Math.max(0, ((ev.clientX - r.left) / r.width) * 100));
      const y = Math.min(100, Math.max(0, ((ev.clientY - r.top) / r.height) * 100));
      onMove(Math.round(x), Math.round(y));
    };
    const up = () => {
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerup', up);
      target.removeEventListener('pointercancel', up);
    };
    target.addEventListener('pointermove', move);
    target.addEventListener('pointerup', up);
    target.addEventListener('pointercancel', up);
  };
}

function Handle({ boxRef, x, y, color, label, onMove, onKeyMove, selected, onSelect }) {
  const start = useDrag(boxRef, onMove);
  return (
    <motion.button
      type="button"
      className="mesh-handle"
      aria-label={`${label}. Drag, or use arrow keys to move.`}
      style={{ left: `${x}%`, top: `${y}%`, background: color, outline: selected ? '3px solid var(--focus)' : 'none', outlineOffset: 3 }}
      onPointerDown={e => { onSelect(); start(e); }}
      onKeyDown={e => {
        const d = e.shiftKey ? 10 : 2;
        const map = { ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, -d], ArrowDown: [0, d] };
        if (map[e.key]) { e.preventDefault(); onKeyMove(...map[e.key]); }
      }}
      onFocus={onSelect}
      initial={{ scale: 0 }}
      animate={{ scale: selected ? 1.15 : 1 }}
      whileHover={{ scale: 1.25 }}
      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
    />
  );
}

export default function GradientGenerator() {
  const [mode, setMode] = useState('mesh');
  const [angle, setAngle] = useState(135);
  const [state, setState] = useState(() => fromPreset('lab'));
  const [selected, setSelected] = useState(null);
  const [animate, setAnimate] = useState(false);
  const [shuffles, setShuffles] = useState(0);
  const boxRef = useRef(null);
  const barRef = useRef(null);
  const [copied, copy] = useCopy();

  const { stops, points, meshBg } = state;
  const bg = buildCss({ mode, angle, stops, points, meshBg });
  const items = mode === 'mesh' ? points : stops;
  const sel = items.find(i => i.id === selected) || items[0];

  const setStops = fn => setState(s => ({ ...s, stops: fn(s.stops) }));
  const setPoints = fn => setState(s => ({ ...s, points: fn(s.points) }));
  const updateItem = (id, patch) => (mode === 'mesh' ? setPoints : setStops)(list => list.map(i => (i.id === id ? { ...i, ...patch } : i)));

  function shuffle() {
    const h = Math.random() * 360;
    const hues = getHarmonyHues(h, ['analogous', 'triad', 'split-complementary', 'square'][Math.floor(Math.random() * 4)]);
    const pick = i => hslToHex(hues[i % hues.length] + (Math.random() * 20 - 10), 65 + Math.random() * 30, 50 + Math.random() * 20);
    setState(s => ({
      stops: s.stops.map((st, i) => ({ ...st, color: pick(i) })),
      meshBg: hslToHex(h, 25, Math.random() > 0.5 ? 10 : 94),
      points: s.points.map((p, i) => ({ ...p, color: pick(i), x: Math.round(Math.random() * 100), y: Math.round(Math.random() * 100), size: 35 + Math.round(Math.random() * 25) })),
    }));
    setShuffles(n => n + 1);
    track('Gradient shuffle', { mode });
  }

  function addItem() {
    if (mode === 'mesh') {
      const p = { id: nextId(), color: hslToHex(Math.random() * 360, 75, 60), x: 50, y: 50, size: 45 };
      setPoints(list => [...list, p]);
      setSelected(p.id);
    } else {
      const s = { id: nextId(), color: hslToHex(Math.random() * 360, 75, 60), pos: 50 };
      setStops(list => [...list, s]);
      setSelected(s.id);
    }
  }

  function removeItem(id) {
    if (items.length <= 2) return;
    (mode === 'mesh' ? setPoints : setStops)(list => list.filter(i => i.id !== id));
    setSelected(null);
  }

  const cssText = animate
    ? `.gradient {\n  background:\n    ${bg};\n  background-size: 160% 160%;\n  animation: gradient-drift 14s ease-in-out infinite alternate;\n}\n\n@keyframes gradient-drift {\n  from { background-position: 0% 0%; }\n  to { background-position: 100% 100%; }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .gradient { animation: none; }\n}`
    : `.gradient {\n  background:\n    ${bg};\n}`;

  return (
    <ToolPage id="gradient-generator">
      <style>{`@keyframes gg-drift { from { background-position: 0% 0%; } to { background-position: 100% 100%; } }`}</style>
      <div className="stack">
        <Reveal className="card" style={{ padding: 'clamp(10px, 1.2vw, 14px)' }}>
          <div
            ref={boxRef}
            style={{
              position: 'relative',
              aspectRatio: '16 / 8',
              minHeight: 260,
              borderRadius: 'calc(var(--radius-lg) - 8px)',
              background: bg.replace(/\n\s*/g, ' '),
              backgroundSize: animate ? '160% 160%' : undefined,
              animation: animate ? 'gg-drift 14s ease-in-out infinite alternate' : undefined,
              transition: 'background 0.5s ease',
              overflow: 'hidden',
            }}
          >
            {mode === 'mesh' && points.map((p, i) => (
              <Handle
                key={p.id}
                boxRef={boxRef}
                x={p.x} y={p.y} color={p.color}
                label={`Color point ${i + 1}`}
                selected={sel?.id === p.id}
                onSelect={() => setSelected(p.id)}
                onMove={(x, y) => updateItem(p.id, { x, y })}
                onKeyMove={(dx, dy) => updateItem(p.id, { x: Math.min(100, Math.max(0, p.x + dx)), y: Math.min(100, Math.max(0, p.y + dy)) })}
              />
            ))}
            <div style={{ position: 'absolute', left: 14, bottom: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <motion.button type="button" className="btn btn-chip btn-sm" onClick={shuffle} whileTap={{ scale: 0.9 }}>
                <motion.span animate={{ rotate: shuffles * 360 }} transition={{ duration: 0.6, ease: EASE }} style={{ display: 'inline-block' }}>🎲</motion.span> Shuffle colors
              </motion.button>
            </div>
          </div>
        </Reveal>

        <div className="grid-sidebar">
          <div className="stack">
            <Reveal className="card">
              <h2 className="eyebrow">Type</h2>
              <Segmented full label="Gradient type" value={mode} onChange={m => { setMode(m); setSelected(null); }} options={[
                { value: 'mesh', label: 'Mesh' }, { value: 'linear', label: 'Linear' }, { value: 'radial', label: 'Radial' }, { value: 'conic', label: 'Conic' },
              ]} />
              <div className="stack" style={{ gap: 16, marginTop: 18 }}>
                <AnimatePresence initial={false}>
                  {(mode === 'linear' || mode === 'conic') && (
                    <motion.div key="angle" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                      <RangeField label="Angle" value={angle} min={0} max={360} onChange={setAngle} format={v => `${v}°`} />
                    </motion.div>
                  )}
                </AnimatePresence>
                {mode === 'mesh' && <ColorField label="Base color" value={meshBg} onChange={c => setState(s => ({ ...s, meshBg: c }))} />}
                <Segmented full label="Motion" value={animate ? 'on' : 'off'} onChange={v => setAnimate(v === 'on')} options={[{ value: 'off', label: 'Still' }, { value: 'on', label: 'Animated' }]} />
                <div>
                  <div className="field-label" style={{ marginBottom: 8 }}>Presets</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {Object.keys(PRESETS).map(name => (
                      <motion.button
                        key={name}
                        type="button"
                        aria-label={`${name} preset`}
                        title={name}
                        onClick={() => { setState(fromPreset(name)); setSelected(null); }}
                        whileHover={{ y: -3, rotate: -4 }}
                        whileTap={{ scale: 0.9 }}
                        style={{ width: 52, height: 52, borderRadius: 16, border: 'none', background: `linear-gradient(135deg, ${PRESETS[name].stops.map(s => s[0]).join(', ')})`, boxShadow: 'inset 0 0 0 1px rgba(127,127,127,.3)' }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="stack">
            <Reveal className="card">
              <h2 className="eyebrow">
                {mode === 'mesh' ? 'Color points' : 'Color stops'}
                <button type="button" className="btn btn-ghost btn-sm" onClick={addItem} disabled={items.length >= 8}>+ Add</button>
              </h2>
              {mode !== 'mesh' && (
                <div
                  ref={barRef}
                  style={{ position: 'relative', height: 28, borderRadius: 999, margin: '6px 14px 22px', background: `linear-gradient(90deg, ${[...stops].sort((a, b) => a.pos - b.pos).map(s => `${s.color} ${s.pos}%`).join(', ')})`, boxShadow: 'inset 0 0 0 1px rgba(127,127,127,.3)' }}
                >
                  {stops.map((s, i) => (
                    <Handle
                      key={s.id}
                      boxRef={barRef}
                      x={s.pos} y={50} color={s.color}
                      label={`Color stop ${i + 1}`}
                      selected={sel?.id === s.id}
                      onSelect={() => setSelected(s.id)}
                      onMove={x => updateItem(s.id, { pos: x })}
                      onKeyMove={dx => updateItem(s.id, { pos: Math.min(100, Math.max(0, s.pos + dx)) })}
                    />
                  ))}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 230px), 1fr))', gap: 10 }}>
                <AnimatePresence initial={false}>
                  {items.map((it, i) => (
                    <motion.div
                      key={it.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => setSelected(it.id)}
                      className="check-row"
                      style={{ gridTemplateColumns: '1fr', gap: 10, boxShadow: sel?.id === it.id ? 'inset 0 0 0 1.5px var(--focus)' : undefined }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="check-row-label">{mode === 'mesh' ? 'Point' : 'Stop'} {i + 1}</span>
                        <button type="button" className="btn btn-ghost btn-icon" style={{ width: 30, height: 30, fontSize: 12 }} aria-label={`Remove ${mode === 'mesh' ? 'point' : 'stop'} ${i + 1}`} disabled={items.length <= 2} onClick={e => { e.stopPropagation(); removeItem(it.id); }}>✕</button>
                      </div>
                      <ColorField label={`Color ${i + 1}`} hideLabel value={it.color} onChange={c => updateItem(it.id, { color: c })} />
                      {mode === 'mesh'
                        ? <RangeField label="Spread" value={it.size} min={10} max={90} onChange={v => updateItem(it.id, { size: v })} format={v => `${v}%`} />
                        : <RangeField label="Position" value={it.pos} min={0} max={100} onChange={v => updateItem(it.id, { pos: v })} format={v => `${v}%`} />}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              {mode === 'mesh' && <p className="small muted" style={{ margin: '14px 0 0' }}>Tip: drag the dots on the preview (or focus one and use the arrow keys).</p>}
            </Reveal>

            <Reveal className="card">
              <h2 className="eyebrow">
                CSS
                <CopyButton className="btn btn-primary btn-sm" copied={copied === 'css'} onClick={() => copy(cssText, 'css', { name: 'Copy', props: { tool: 'gradient-generator', mode } })}>Copy CSS</CopyButton>
              </h2>
              <pre className="code-block">{cssText}</pre>
            </Reveal>
          </div>
        </div>
      </div>
    </ToolPage>
  );
}
