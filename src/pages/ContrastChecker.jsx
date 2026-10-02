import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion, useSpring, useTransform } from 'framer-motion';
import {
  contrastRatio, formatRatio, hexToHsl, hexToRgb, hslToHex, normalizeHex, suggestClosestPassing, wcagChecks,
} from '../lib/color';
import ToolPage from '../components/ToolPage';
import { ColorField, CopyButton, PassBadge, Reveal } from '../components/ui';
import { EASE } from '../lib/motion';
import useCopy from '../hooks/useCopy';
import { track } from '../lib/analytics';

const PRESETS = [
  { fg: '#F7F7F7', bg: '#272625' },
  { fg: '#767676', bg: '#FFFFFF' },
  { fg: '#FFCE1F', bg: '#FFFFFF' },
  { fg: '#FFFFFF', bg: '#CD57FF' },
  { fg: '#111011', bg: '#8B6CF0' },
];

function verdict(ratio) {
  if (ratio >= 7) return { label: 'Excellent', emoji: '🎉' };
  if (ratio >= 4.5) return { label: 'Good', emoji: '👍' };
  if (ratio >= 3) return { label: 'Large text only', emoji: '🤏' };
  return { label: 'Poor', emoji: '🙈' };
}

/* Fix one side of the pair: keep its hue/saturation, move lightness the
   least amount needed to hit the target against the other side. */
function suggestFix(movingHex, fixedHex, target) {
  const hsl = hexToHsl(movingHex);
  const fixed = hexToRgb(fixedHex);
  const s = suggestClosestPassing(hsl, fixed, target + 0.01);
  return s ? hslToHex(s.h, s.s, s.l) : null;
}

/* The ratio springs between values instead of re-mounting on every change. */
function AnimatedRatio({ value }) {
  const spring = useSpring(value, { stiffness: 260, damping: 32 });
  useEffect(() => { spring.set(value); }, [spring, value]);
  const text = useTransform(spring, v => formatRatio(v));
  return <motion.span>{text}</motion.span>;
}

export default function ContrastChecker() {
  const [params, setParams] = useSearchParams();
  const [fg, setFg] = useState(() => normalizeHex(params.get('fg') || '') || '#767676');
  const [bg, setBg] = useState(() => normalizeHex(params.get('bg') || '') || '#FFFFFF');
  const [copied, copy] = useCopy();
  const [swapTurns, setSwapTurns] = useState(0);

  function update(nextFg, nextBg) {
    setFg(nextFg);
    setBg(nextBg);
    setParams({ fg: nextFg.slice(1), bg: nextBg.slice(1) }, { replace: true });
  }

  const ratio = useMemo(() => contrastRatio(hexToRgb(fg), hexToRgb(bg)), [fg, bg]);
  const checks = wcagChecks(ratio);
  const v = verdict(ratio);
  const failing = checks.filter(c => !c.pass);
  const nextTarget = failing.length ? Math.min(...failing.map(c => c.target)) : null;

  const fixes = nextTarget
    ? [
        { side: 'text', hex: suggestFix(fg, bg, nextTarget) },
        { side: 'background', hex: suggestFix(bg, fg, nextTarget) },
      ].filter(f => f.hex)
    : [];

  function applyFix(f) {
    if (f.side === 'text') update(f.hex, bg); else update(fg, f.hex);
    track('Contrast fix', { side: f.side, target: String(nextTarget) });
  }

  return (
    <ToolPage id="contrast-checker">
      <div className="grid-sidebar">
        <div className="stack sticky-col">
          <Reveal className="card">
            <h2 className="eyebrow">Colors</h2>
            <div className="stack" style={{ gap: 14 }}>
              <ColorField label="Text" value={fg} onChange={hex => update(hex, bg)} />
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <motion.button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => { update(bg, fg); setSwapTurns(t => t + 1); }}
                  aria-label="Swap text and background"
                >
                  <motion.span animate={{ rotate: swapTurns * 180 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }} style={{ display: 'inline-block' }}>⇅</motion.span>
                  Swap
                </motion.button>
              </div>
              <ColorField label="Background" value={bg} onChange={hex => update(fg, hex)} />
            </div>
          </Reveal>

          <Reveal className="card" delay={0.05}>
            <h2 className="eyebrow">Try a pair</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {PRESETS.map(p => (
                <motion.button
                  key={p.fg + p.bg}
                  type="button"
                  onClick={() => update(p.fg, p.bg)}
                  whileHover={{ y: -3, rotate: -3 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={`Text ${p.fg} on ${p.bg}`}
                  style={{ width: 52, height: 52, borderRadius: 16, border: 'none', background: p.bg, color: p.fg, fontFamily: 'var(--font-display)', fontSize: 24, boxShadow: 'inset 0 0 0 1px rgba(127,127,127,.3)' }}
                >
                  Aa
                </motion.button>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="stack">
          <Reveal className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="preview-surface" style={{ borderRadius: 0, backgroundColor: bg, color: fg }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-label)', fontSize: 14, opacity: 0.85 }}>Contrast ratio</div>
                  <div className="ratio-big" aria-live="polite">
                    <AnimatedRatio value={ratio} />
                    <span style={{ fontSize: '0.4em' }}>:1</span>
                  </div>
                </div>
                <div
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 999, border: `1.5px solid ${fg}`, fontWeight: 600 }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={v.label}
                      initial={{ y: 8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -8, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ display: 'inline-flex', gap: 8 }}
                    >
                      <span aria-hidden="true">{v.emoji}</span> {v.label}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>
              <div style={{ marginTop: 'clamp(24px, 4vw, 40px)', display: 'grid', gap: 14 }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 40px)', lineHeight: 1.1, margin: 0, letterSpacing: '-0.03em' }}>
                  Large text — the quick brown fox
                </p>
                <p style={{ fontSize: 16, lineHeight: 1.6, margin: 0, maxWidth: 620 }}>
                  Normal body text at 16px. Good contrast keeps copy readable in sunlight, on cheap screens and for
                  people with low vision.
                </p>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ padding: '10px 18px', borderRadius: 999, border: `2px solid ${fg}`, fontWeight: 600, fontSize: 14 }}>Outlined button</span>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth="2" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
                  <small style={{ fontSize: 12 }}>Small caption · 12px</small>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal className="card" delay={0.05}>
            <h2 className="eyebrow">WCAG 2.2 results</h2>
            <div className="check-list">
              {checks.map(c => (
                <div key={c.id} className="check-row">
                  <div>
                    <div className="check-row-label">{c.label}</div>
                    <div className="check-row-sub">Needs {c.target}:1</div>
                  </div>
                  <PassBadge pass={c.pass} />
                </div>
              ))}
            </div>
          </Reveal>

          <AnimatePresence>
            {fixes.length > 0 && (
              <motion.div
                className="card"
                initial={{ opacity: 0, y: 20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                style={{ overflow: 'hidden' }}
              >
                <h2 className="eyebrow">One-click fix · reach {nextTarget}:1</h2>
                <div className="grid-2">
                  {fixes.map(f => {
                    const nextFg = f.side === 'text' ? f.hex : fg;
                    const nextBg = f.side === 'background' ? f.hex : bg;
                    return (
                      <motion.button
                        key={f.side}
                        type="button"
                        onClick={() => applyFix(f)}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.97 }}
                        className="check-row"
                        style={{ border: 'none', textAlign: 'left', gridTemplateColumns: 'auto 1fr auto', color: 'var(--text)' }}
                      >
                        <span style={{ width: 52, height: 52, borderRadius: 14, background: nextBg, color: nextFg, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontSize: 22, boxShadow: 'inset 0 0 0 1px rgba(127,127,127,.3)' }}>Aa</span>
                        <span>
                          <span className="check-row-label" style={{ display: 'block' }}>Adjust {f.side}</span>
                          <span className="check-row-sub mono">{(f.side === 'text' ? fg : bg)} → {f.hex}</span>
                        </span>
                        <span className="badge badge-pass">{formatRatio(contrastRatio(hexToRgb(nextFg), hexToRgb(nextBg)))}:1</span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Reveal className="card" delay={0.05} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <p className="small muted" style={{ margin: 0 }}>The URL updates as you go — share it to share this exact pair.</p>
            <CopyButton
              className="btn btn-primary btn-sm"
              copied={copied === 'link'}
              onClick={() => copy(window.location.href, 'link', { name: 'Copy', props: { tool: 'contrast-checker', format: 'link' } })}
            >
              Copy link
            </CopyButton>
          </Reveal>
        </div>
      </div>
    </ToolPage>
  );
}
