import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ToolPage from '../components/ToolPage';
import { CopyButton, RangeField, Reveal, Segmented } from '../components/ui';
import { EASE } from '../lib/motion';
import useCopy from '../hooks/useCopy';

const RATIOS = [
  { value: 1.067, label: 'Minor second' },
  { value: 1.125, label: 'Major second' },
  { value: 1.2, label: 'Minor third' },
  { value: 1.25, label: 'Major third' },
  { value: 1.333, label: 'Perfect fourth' },
  { value: 1.414, label: 'Augmented fourth' },
  { value: 1.5, label: 'Perfect fifth' },
  { value: 1.618, label: 'Golden ratio' },
];

const FONTS = [
  { value: 'var(--font-display)', label: 'Crimson Pro', css: "'Crimson Pro', Georgia, serif" },
  { value: 'var(--font-body)', label: 'Inter', css: "'Inter', system-ui, sans-serif" },
  { value: 'var(--font-label)', label: 'Hanken Grotesk', css: "'Hanken Grotesk', system-ui, sans-serif" },
  { value: 'var(--font-mono)', label: 'JetBrains Mono', css: "'JetBrains Mono', ui-monospace, monospace" },
];

const NAMES_UP = ['lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl'];
const NAMES_DOWN = ['sm', 'xs', '2xs'];
const MIN_VW = 360, MAX_VW = 1280;

const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

function buildScale({ base, ratio, minBase, minRatio, up, down }) {
  const steps = [];
  for (let step = up; step >= -down; step--) {
    const name = step === 0 ? 'base' : step > 0 ? NAMES_UP[step - 1] : NAMES_DOWN[-step - 1];
    const max = base * ratio ** step;
    const min = minBase * minRatio ** step;
    steps.push({ step, name, max, min });
  }
  return steps;
}

function clampFor(min, max) {
  const slope = (max - min) / (MAX_VW - MIN_VW);
  const intercept = min - slope * MIN_VW;
  const lo = Math.min(min, max), hi = Math.max(min, max);
  return `clamp(${round(lo / 16, 3)}rem, ${round(intercept / 16, 3)}rem + ${round(slope * 100, 3)}vw, ${round(hi / 16, 3)}rem)`;
}

function sizeAt(min, max, vw) {
  const t = Math.min(1, Math.max(0, (vw - MIN_VW) / (MAX_VW - MIN_VW)));
  return min + (max - min) * t;
}

// Bigger text needs tighter leading and tracking.
function lineHeightFor(px) {
  if (px >= 48) return 1.05;
  if (px >= 32) return 1.15;
  if (px >= 22) return 1.3;
  return 1.5;
}

function trackingFor(px) {
  if (px >= 48) return '-0.035em';
  if (px >= 28) return '-0.02em';
  return '-0.01em';
}

export default function TypeScale() {
  const [base, setBase] = useState(18);
  const [ratio, setRatio] = useState(1.333);
  const [fluid, setFluid] = useState(true);
  const [minBase, setMinBase] = useState(16);
  const [minRatio, setMinRatio] = useState(1.2);
  const [up, setUp] = useState(6);
  const [down, setDown] = useState(2);
  const [font, setFont] = useState(FONTS[0].value);
  const [vw, setVw] = useState(1280);
  const [sample, setSample] = useState('Bridging design & engineering');
  const [format, setFormat] = useState('css');
  const [copied, copy] = useCopy();

  const scale = useMemo(
    () => buildScale({ base, ratio, minBase: fluid ? minBase : base, minRatio: fluid ? minRatio : ratio, up, down }),
    [base, ratio, minBase, minRatio, fluid, up, down],
  );

  const fontCss = FONTS.find(f => f.value === font).css;
  const output = useMemo(() => {
    if (format === 'css') {
      const lines = scale.map(s => `  --text-${s.name}: ${fluid ? clampFor(s.min, s.max) : `${round(s.max / 16, 3)}rem`};`);
      return `:root {\n  --font-family: ${fontCss};\n${lines.join('\n')}\n}`;
    }
    const tokens = Object.fromEntries(scale.map(s => [s.name, {
      $type: 'dimension',
      $value: fluid ? clampFor(s.min, s.max) : `${round(s.max / 16, 3)}rem`,
      lineHeight: lineHeightFor(s.max),
    }]));
    return JSON.stringify({ font: { size: tokens } }, null, 2);
  }, [scale, fluid, format, fontCss]);

  return (
    <ToolPage id="type-scale" intro="Choose a base size and a ratio to get a modular type scale. Turn on fluid mode to use a tighter ratio on small screens and a bolder one on desktop — the output becomes clamp() values that scale smoothly in between.">
      <div className="grid-sidebar">
        <div className="stack sticky-col">
          <Reveal className="card">
            <h2 className="eyebrow">Scale</h2>
            <div className="stack" style={{ gap: 16 }}>
              <Segmented full label="Mode" value={fluid ? 'fluid' : 'static'} onChange={v => setFluid(v === 'fluid')} options={[{ value: 'static', label: 'Static' }, { value: 'fluid', label: 'Fluid' }]} />
              <RangeField label={fluid ? 'Desktop base' : 'Base size'} value={base} min={12} max={24} onChange={setBase} format={v => `${v}px`} />
              <div className="field">
                <label className="field-label" htmlFor="ratio">{fluid ? 'Desktop ratio' : 'Ratio'}</label>
                <select id="ratio" className="select" value={ratio} onChange={e => setRatio(Number(e.target.value))}>
                  {RATIOS.map(r => <option key={r.value} value={r.value}>{r.label} · {r.value}</option>)}
                </select>
              </div>
              <AnimatePresence initial={false}>
                {fluid && (
                  <motion.div
                    className="stack"
                    style={{ gap: 16, overflow: 'hidden' }}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                  >
                    <RangeField label="Mobile base" value={minBase} min={12} max={24} onChange={setMinBase} format={v => `${v}px`} />
                    <div className="field">
                      <label className="field-label" htmlFor="min-ratio">Mobile ratio</label>
                      <select id="min-ratio" className="select" value={minRatio} onChange={e => setMinRatio(Number(e.target.value))}>
                        {RATIOS.map(r => <option key={r.value} value={r.value}>{r.label} · {r.value}</option>)}
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="grid-2" style={{ gap: 12 }}>
                <RangeField label="Steps up" value={up} min={2} max={8} onChange={setUp} />
                <RangeField label="Steps down" value={down} min={0} max={3} onChange={setDown} />
              </div>
            </div>
          </Reveal>
          <Reveal className="card" delay={0.05}>
            <h2 className="eyebrow">Preview</h2>
            <div className="stack" style={{ gap: 16 }}>
              <div className="field">
                <label className="field-label" htmlFor="font">Font</label>
                <select id="font" className="select" value={font} onChange={e => setFont(e.target.value)}>
                  {FONTS.map(f => <option key={f.label} value={f.value}>{f.label}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="field-label" htmlFor="sample">Sample text</label>
                <input id="sample" className="input" value={sample} onChange={e => setSample(e.target.value)} />
              </div>
              {fluid && <RangeField label="Viewport width" value={vw} min={MIN_VW} max={MAX_VW} step={10} onChange={setVw} format={v => `${v}px`} />}
            </div>
          </Reveal>
        </div>

        <div className="stack">
          <Reveal className="card" style={{ overflow: 'hidden' }}>
            <h2 className="eyebrow">
              The scale
              {fluid && <span className="badge badge-neutral">at {vw}px viewport</span>}
            </h2>
            <div style={{ display: 'grid' }}>
              <AnimatePresence initial={false}>
                {scale.map(s => {
                  const px = fluid ? sizeAt(s.min, s.max, vw) : s.max;
                  return (
                    <motion.div
                      key={s.name}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.4, ease: EASE }}
                      style={{ display: 'grid', gridTemplateColumns: 'minmax(84px, 110px) minmax(0, 1fr)', gap: 16, alignItems: 'baseline', padding: '14px 0', borderBottom: '1px solid var(--border)' }}
                    >
                      <div style={{ fontFamily: 'var(--font-label)' }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: s.step === 0 ? 'var(--focus)' : 'var(--text)' }}>{s.name}</div>
                        <div className="mono muted" style={{ fontSize: 11 }}>{round(px, 1)}px · {round(px / 16, 3)}rem</div>
                      </div>
                      <motion.div
                        animate={{ fontSize: px }}
                        transition={{ type: 'spring', stiffness: 200, damping: 26 }}
                        style={{ fontFamily: font, lineHeight: lineHeightFor(px), letterSpacing: trackingFor(px), fontWeight: font === 'var(--font-display)' ? 300 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}
                      >
                        {sample || 'Aa'}
                      </motion.div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </Reveal>

          <Reveal className="card" delay={0.05}>
            <h2 className="eyebrow">In context</h2>
            {(() => {
              const pick = name => {
                const s = scale.find(x => x.name === name) || scale[scale.length - 1];
                return fluid ? sizeAt(s.min, s.max, vw) : s.max;
              };
              const h1 = pick(NAMES_UP[Math.min(up, 4) - 1]);
              const h2 = pick(NAMES_UP[Math.min(up, 2) - 1]);
              const body = pick('base');
              const small = down > 0 ? pick('sm') : body;
              return (
                <motion.article layout style={{ fontFamily: fontCss, maxWidth: 720 }}>
                  <div style={{ fontSize: small, color: 'var(--muted)', fontFamily: 'var(--font-label)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Case study</div>
                  <h3 style={{ fontFamily: font, fontSize: h1, lineHeight: lineHeightFor(h1), letterSpacing: trackingFor(h1), margin: '0 0 0.4em', fontWeight: font === 'var(--font-display)' ? 300 : 600, transition: 'font-size .4s var(--ease-out)' }}>{sample}</h3>
                  <h4 style={{ fontFamily: font, fontSize: h2, lineHeight: lineHeightFor(h2), letterSpacing: trackingFor(h2), margin: '0 0 0.6em', fontWeight: font === 'var(--font-display)' ? 300 : 600, transition: 'font-size .4s var(--ease-out)' }}>A system that scales</h4>
                  <p style={{ fontSize: body, lineHeight: 1.6, margin: 0, color: 'var(--muted)', fontFamily: 'var(--font-body)', transition: 'font-size .4s var(--ease-out)' }}>
                    A modular scale gives every heading a predictable relationship with the body text. Pick fewer, more
                    distinct steps and your hierarchy reads at a glance — on a phone and on a 27-inch monitor.
                  </p>
                </motion.article>
              );
            })()}
          </Reveal>

          <Reveal className="card" delay={0.05}>
            <h2 className="eyebrow">
              Export
              <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Segmented label="Export format" value={format} onChange={setFormat} options={[{ value: 'css', label: 'CSS' }, { value: 'json', label: 'Tokens' }]} />
                <CopyButton copied={copied === 'out'} onClick={() => copy(output, 'out', { name: 'Copy', props: { tool: 'type-scale', format } })}>Copy</CopyButton>
              </span>
            </h2>
            <pre className="code-block">{output}</pre>
          </Reveal>
        </div>
      </div>
    </ToolPage>
  );
}
