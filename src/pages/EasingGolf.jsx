import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ToolPage from '../components/ToolPage';
import { Reveal } from '../components/ui';
import { EASE } from '../lib/motion';
import { bezierAt } from '../lib/spring';
import { useLang } from '../i18n';
import { track } from '../lib/analytics';
import { haptic } from '../lib/haptics';
import { glideTo } from '../lib/smoothScroll';

/* Easing Golf: each hole is an animation curve to recreate. The track shows
   flags where the puck has to be at four moments of the animation; you shape
   a cubic-bezier with two handles and putt. A putt counts as a stroke; once
   every checkpoint is within tolerance the ball drops. After a missed putt
   the target points appear on the graph, so every stroke teaches something. */

const HOLES = [
  { name: 'Ease out', curve: [0.16, 1, 0.3, 1] },
  { name: 'Ease in', es: 'Ease in', curve: [0.6, 0, 0.9, 0.4] },
  { name: 'Ease in-out', curve: [0.65, 0, 0.35, 1] },
  { name: 'Back out', es: 'Back out (rebote)', curve: [0.34, 1.56, 0.64, 1] },
  { name: 'Anticipate', es: 'Anticipación', curve: [0.36, -0.4, 0.66, 1] },
  { name: 'Snap', es: 'Seco', curve: [0.85, 0, 0.15, 1] },
];
const PAR = 3;
const MAX = 6;
const TOL = 0.05;
const XS = [0.1, 0.3, 0.55, 0.8];
const START = [0.25, 0.25, 0.75, 0.75];

// Graph: x 0..1 → 24..276, y -0.5..1.5 → 296..24 (room for overshoot).
const W = 300, H = 320, PADX = 24;
const gx = x => PADX + x * (W - PADX * 2);
const gy = y => H - 24 - ((y + 0.5) / 2) * (H - 48);
const ux = px => Math.min(1, Math.max(0, (px - PADX) / (W - PADX * 2)));
const uy = py => Math.min(1.5, Math.max(-0.5, ((H - 24 - py) / (H - 48)) * 2 - 0.5));

const pathFor = c => {
  let d = '';
  for (let i = 0; i <= 60; i++) { const x = i / 60; d += `${i ? 'L' : 'M'}${gx(x).toFixed(1)},${gy(bezierAt(c, x)).toFixed(1)}`; }
  return d;
};

export default function EasingGolf() {
  const { t, lang } = useLang();
  const es = lang === 'es';
  const [phase, setPhase] = useState('intro');
  const [hole, setHole] = useState(0);
  const [c, setC] = useState(START);
  const [strokes, setStrokes] = useState(0);
  const [card, setCard] = useState([]); // strokes per finished hole
  const [reveal, setReveal] = useState(false);
  const [putting, setPutting] = useState(false);
  const [puck, setPuck] = useState(0);
  const [result, setResult] = useState(null); // { sunk, err }
  const [best, setBest] = useState(() => { try { return +localStorage.getItem('easinggolf:best') || 0; } catch { return 0; } });
  const [copied, setCopied] = useState(false);
  const svg = useRef(null);
  const drag = useRef(null);

  const target = HOLES[hole]?.curve;
  const err = target ? Math.max(...XS.map(x => Math.abs(bezierAt(c, x) - bezierAt(target, x)))) : 1;

  const start = () => { setHole(0); setC(START); setStrokes(0); setCard([]); setReveal(false); setResult(null); setPhase('play'); track('Easing Golf start'); };

  function putt() {
    if (putting || result?.sunk) return;
    const s = strokes + 1;
    setStrokes(s); setPutting(true); setResult(null);
    const t0 = performance.now(), dur = 1300;
    const tick = () => {
      const p = Math.min(1, (performance.now() - t0) / dur);
      setPuck(bezierAt(c, p));
      if (p < 1) requestAnimationFrame(tick);
      else {
        setPutting(false);
        const sunk = err <= TOL;
        setResult({ sunk, err });
        setReveal(true);
        haptic(sunk ? [10, 40, 10] : 20);
        if (!sunk && s >= MAX) setResult({ sunk: false, err, pickedUp: true });
      }
    };
    requestAnimationFrame(tick);
  }

  function nextHole() {
    const used = result?.pickedUp ? MAX + 1 : strokes;
    const nc = [...card, used];
    setCard(nc);
    if (hole + 1 >= HOLES.length) { setPhase('over'); return; }
    setHole(h => h + 1); setC(START); setStrokes(0); setReveal(false); setResult(null); setPuck(0);
  }

  // Dragging the two handles (pointer events, so it works with touch).
  const onDown = (k) => e => { e.preventDefault(); drag.current = k; e.currentTarget.setPointerCapture?.(e.pointerId); };
  const onMove = e => {
    if (!drag.current || putting) return;
    const r = svg.current.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W, py = ((e.clientY - r.top) / r.height) * H;
    setC(prev => {
      const n = [...prev];
      const i = drag.current === 1 ? 0 : 2;
      n[i] = +ux(px).toFixed(2); n[i + 1] = +uy(py).toFixed(2);
      return n;
    });
  };
  const onUp = () => { drag.current = null; };

  // Arrow keys nudge the focused handle.
  const nudge = k => e => {
    const d = e.shiftKey ? 0.1 : 0.02, i = k === 1 ? 0 : 2;
    const m = { ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, d], ArrowDown: [0, -d] }[e.key];
    if (!m) return;
    e.preventDefault();
    setC(prev => { const n = [...prev]; n[i] = +Math.min(1, Math.max(0, n[i] + m[0])).toFixed(2); n[i + 1] = +Math.min(1.5, Math.max(-0.5, n[i + 1] + m[1])).toFixed(2); return n; });
  };

  const total = card.reduce((a, b) => a + b, 0);
  const vsPar = total - PAR * HOLES.length;
  useEffect(() => {
    if (phase !== 'over') return;
    track('Easing Golf finished', { strokes: total });
    if (!best || total < best) { setBest(total); try { localStorage.setItem('easinggolf:best', String(total)); } catch { /* private mode */ } }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // On phones the intro text pushes the board down; bring it into view.
  useEffect(() => {
    if (phase !== 'play') return undefined;
    const id = setTimeout(() => glideTo(document.querySelector('.pf-play')), 450); // after the intro card exits
    return () => clearTimeout(id);
  }, [phase]);

  async function share() {
    const text = `Easing Golf · ${total} ${t('strokes', 'golpes')} (${vsPar > 0 ? '+' : ''}${vsPar})\n${card.map(s => (s <= 1 ? '🦅' : s <= PAR - 1 ? '🐦' : s === PAR ? '⛳' : '🟥')).join('')}\nfun.alevasquez.dev/easing-golf`;
    try {
      if (navigator.share && window.matchMedia('(pointer: coarse)').matches) await navigator.share({ text });
      else { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1600); }
    } catch { /* cancelled */ }
  }

  const label = s => (s === 1 ? t('Hole in one!', '¡Hoyo en uno!') : s === PAR - 2 ? 'Eagle' : s === PAR - 1 ? 'Birdie' : s === PAR ? 'Par' : s === PAR + 1 ? 'Bogey' : t(`+${s - PAR}`, `+${s - PAR}`));

  return (
    <ToolPage id="easing-golf" intro="Mini golf with animation curves. Shape a cubic-bezier so the puck passes each flag at the right moment, then putt. Fewer strokes win; par is three.">
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: EASE }} className="card pf-intro">
            <svg width="220" height="90" viewBox="0 0 220 90" aria-hidden="true" className="eg-demo"><path d="M10 80 C 40 -10, 90 10, 210 12" fill="none" stroke="var(--accent-a)" strokeWidth="3" /><circle cx="10" cy="80" r="6" fill="currentColor" /><text x="200" y="40" fontSize="22">⛳</text></svg>
            <h2 className="pf-h">{t('Six holes, one curve each', 'Seis hoyos, una curva cada uno')}</h2>
            <ul className="pf-rules">
              <li>{t('Four flags show where the puck must be at 10%, 30%, 55% and 80% of the time.', 'Cuatro banderas muestran dónde debe estar el disco al 10%, 30%, 55% y 80% del tiempo.')}</li>
              <li>{t('Drag the two handles to shape the curve, then putt.', 'Arrastra las dos manijas para darle forma a la curva y luego tira.')}</li>
              <li>{t('Each putt is a stroke. Par is three per hole, max six.', 'Cada tiro cuenta. El par es tres por hoyo, máximo seis.')}</li>
            </ul>
            <motion.button type="button" className="btn btn-primary pf-start" whileTap={{ scale: 0.96 }} onClick={start}>{t('Tee off', 'Empezar')}</motion.button>
            {best > 0 && <p className="small muted" style={{ margin: 0 }}>{t(`Your best: ${best} strokes`, `Tu mejor puntaje: ${best} golpes`)}</p>}
          </motion.div>
        )}

        {phase === 'play' && target && (
          <motion.div key={'play' + hole} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pf-play">
            <div className="pf-hud">
              <span className="mono">{t('Hole', 'Hoyo')} {hole + 1}<span className="muted">/{HOLES.length}</span></span>
              <strong className="oe-title">{es && HOLES[hole].es ? HOLES[hole].es : HOLES[hole].name}</strong>
              <span className="mono">{strokes} / {t('par', 'par')} {PAR}</span>
            </div>

            <div className="eg-track" aria-hidden="true">
              {XS.map((x, k) => (
                <span key={k} className="eg-flag" style={{ left: `calc(${Math.min(1.25, Math.max(-0.25, bezierAt(target, x))) * 80 + 10}% - 1px)`, '--k': k }}><i>{Math.round(x * 100)}%</i></span>
              ))}
              {reveal && XS.map((x, k) => (
                <span key={'m' + k} className={'eg-mark ' + (Math.abs(bezierAt(c, x) - bezierAt(target, x)) <= TOL ? 'is-ok' : 'is-bad')} style={{ left: `calc(${Math.min(1.25, Math.max(-0.25, bezierAt(c, x))) * 80 + 10}% - 5px)` }} />
              ))}
              <span className="eg-hole" />
              <span className="eg-puck" style={{ left: `calc(${Math.min(1.25, Math.max(-0.25, puck)) * 80 + 10}% - 11px)` }} />
            </div>

            <svg ref={svg} className="eg-graph" viewBox={`0 0 ${W} ${H}`} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp} role="group" aria-label={t('Curve editor', 'Editor de curva')}>
              <line x1={gx(0)} y1={gy(0)} x2={gx(1)} y2={gy(0)} className="eg-axis" />
              <line x1={gx(0)} y1={gy(1)} x2={gx(1)} y2={gy(1)} className="eg-axis" />
              {XS.map(x => <line key={x} x1={gx(x)} y1={gy(-0.5)} x2={gx(x)} y2={gy(1.5)} className="eg-grid" />)}
              {reveal && <path d={pathFor(target)} className="eg-target" />}
              {reveal && XS.map(x => <circle key={x} cx={gx(x)} cy={gy(bezierAt(target, x))} r="6" className="eg-dot" />)}
              <line x1={gx(0)} y1={gy(0)} x2={gx(c[0])} y2={gy(c[1])} className="eg-arm" />
              <line x1={gx(1)} y1={gy(1)} x2={gx(c[2])} y2={gy(c[3])} className="eg-arm" />
              <path d={pathFor(c)} className="eg-curve" />
              {[1, 2].map(k => (
                <circle key={k} cx={gx(c[k === 1 ? 0 : 2])} cy={gy(c[k === 1 ? 1 : 3])} r="13" className="eg-handle" tabIndex={0} role="slider"
                  aria-label={t(`Handle ${k}`, `Manija ${k}`)} aria-valuetext={`${c[k === 1 ? 0 : 2]}, ${c[k === 1 ? 1 : 3]}`}
                  onPointerDown={onDown(k)} onKeyDown={nudge(k)} />
              ))}
            </svg>
            <p className="mono small muted" style={{ margin: 0, textAlign: 'center' }}>cubic-bezier({c.join(', ')})</p>

            <AnimatePresence>
              {result && (
                <motion.div className={'eg-result ' + (result.sunk ? 'is-ok' : 'is-bad')} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="status">
                  <strong>{result.sunk ? label(strokes) : result.pickedUp ? t('Picked up', 'Recogida') : t('Lipped out', 'Casi entra')}</strong>
                  <span className="small">{result.sunk ? t('Every checkpoint within tolerance.', 'Todos los puntos dentro de la tolerancia.') : result.pickedUp ? t('Max strokes reached. The target curve is on the graph.', 'Llegaste al máximo de golpes. La curva objetivo está en el gráfico.') : t('Green markers hit, red ones missed. Target points are now on the graph.', 'Las marcas verdes acertaron, las rojas no. Los puntos objetivo ya están en el gráfico.')}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {result?.sunk || result?.pickedUp
              ? <motion.button type="button" className="btn btn-primary hh-cta" whileTap={{ scale: 0.97 }} onClick={nextHole}>{hole + 1 >= HOLES.length ? t('See the scorecard', 'Ver la tarjeta') : t('Next hole →', 'Siguiente hoyo →')}</motion.button>
              : <motion.button type="button" className="btn btn-primary hh-cta" whileTap={{ scale: 0.97 }} onClick={putt} disabled={putting}>⛳ {putting ? t('Rolling…', 'Rodando…') : t('Putt', 'Tirar')}</motion.button>}
          </motion.div>
        )}

        {phase === 'over' && (
          <motion.div key="over" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }} className="stack">
            <Reveal className="card pf-over">
              <motion.div className="hh-total" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
                <span className="hh-grad">{total}</span><span className="muted small"> {vsPar === 0 ? 'E' : vsPar > 0 ? `+${vsPar}` : vsPar}</span>
              </motion.div>
              <p className="muted" style={{ margin: 0 }}>
                {vsPar <= -3 ? t('You read curves like a motion designer.', 'Lees curvas como un motion designer.') : vsPar <= 2 ? t('Around par. The overshoot holes are the hard ones.', 'Cerca del par. Los hoyos con rebote son los difíciles.') : t('Curves take practice. The Motion Playground is a good driving range.', 'Las curvas requieren práctica. El Motion Playground es un buen campo de prácticas.')}
              </p>
              <div className="eg-card">{card.map((s, k) => <span key={k} className={s <= PAR ? 'is-ok' : 'is-bad'}><i>{k + 1}</i>{s}</span>)}</div>
              <div className="chip-row" style={{ justifyContent: 'center' }}>
                <motion.button type="button" className="btn btn-primary" whileTap={{ scale: 0.96 }} onClick={share}>{copied ? t('Copied ✓', 'Copiado ✓') : t('Share scorecard', 'Compartir tarjeta')}</motion.button>
                <button type="button" className="btn btn-ghost" onClick={start}>{t('Play again', 'Jugar otra vez')}</button>
                <Link to={es ? '/es/curvas-de-animacion' : '/motion-playground'} className="btn btn-ghost">{t('Open Motion Playground', 'Abrir Motion Playground')}</Link>
              </div>
            </Reveal>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPage>
  );
}
