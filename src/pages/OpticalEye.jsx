import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ToolPage from '../components/ToolPage';
import { Reveal } from '../components/ui';
import { EASE } from '../lib/motion';
import { useLang } from '../i18n';
import { track } from '../lib/analytics';
import { haptic } from '../lib/haptics';
import { glideTo } from '../lib/smoothScroll';

/* Optical Eye: seven small layout flaws to fix by eye with one slider each.
   Some rounds want mathematical equality (padding, gaps, a square), others
   want the optical answer designers learn the hard way: a play icon sits
   right of center, and a circle has to be bigger than a square to look the
   same size. Each round is scored by how far off the final value is. */

const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);

// Every kind: slider range, target, points lost per unit of error, and a stage renderer.
const KINDS = {
  play: () => {
    const w = 54;
    return {
      title: ['Center the play icon', 'Centra el ícono de play'],
      hint: ['Make it look centered in the circle.', 'Haz que se vea centrado en el círculo.'],
      min: -30, max: 30, start: Math.round(rand(-24, -8)), target: w / 6, k: 7,
      lesson: ['A triangle’s visual weight sits at its centroid, so it needs to move right by about a sixth of its width.', 'El peso visual de un triángulo está en su centroide: hay que moverlo a la derecha cerca de un sexto de su ancho.'],
      render: v => (
        <div className="oe-play">
          <svg width={w} height={w} viewBox="0 0 54 54" style={{ transform: `translateX(${v}px)` }} aria-hidden="true"><path d="M0 0 L54 27 L0 54 Z" fill="currentColor" /></svg>
        </div>
      ),
    };
  },
  padding: () => {
    const left = Math.round(rand(14, 34));
    return {
      title: ['Even out the button padding', 'Iguala el padding del botón'],
      hint: ['Match the right padding to the left.', 'Iguala el padding derecho con el izquierdo.'],
      min: 0, max: 64, start: Math.round(pick([rand(0, left - 8), rand(left + 10, 64)])), target: left, k: 6,
      lesson: ['Symmetric padding keeps the label centered and the button calm.', 'El padding simétrico mantiene la etiqueta centrada y el botón tranquilo.'],
      render: (v, es) => <span className="oe-btn" style={{ paddingLeft: left, paddingRight: v }}>{es ? 'Empezar' : 'Get started'}</span>,
    };
  },
  gap: () => {
    const g = Math.round(rand(8, 30));
    return {
      title: ['Match the spacing', 'Iguala el espaciado'],
      hint: ['Make the second gap equal to the first.', 'Haz que el segundo espacio sea igual al primero.'],
      min: 0, max: 60, start: Math.round(pick([rand(0, g - 6), rand(g + 8, 60)])), target: g, k: 6,
      lesson: ['Consistent rhythm is what makes a stack feel designed rather than placed.', 'Un ritmo constante es lo que hace que un grupo se vea diseñado y no solo colocado.'],
      render: v => (
        <div className="oe-stack">
          <span className="oe-row" /><span className="oe-row" style={{ marginTop: g }} /><span className="oe-row" style={{ marginTop: v }} />
        </div>
      ),
    };
  },
  square: () => {
    const w = Math.round(rand(100, 170));
    return {
      title: ['Make it a perfect square', 'Haz un cuadrado perfecto'],
      hint: ['Set the height to match the width.', 'Ajusta el alto para que iguale el ancho.'],
      min: 50, max: 220, start: Math.round(pick([rand(50, w - 25), rand(w + 25, 220)])), target: w, k: 3,
      lesson: ['Our eyes tend to overestimate height, so near-squares often look taller than they are.', 'El ojo tiende a sobrestimar la altura: los casi cuadrados suelen verse más altos de lo que son.'],
      render: v => <span className="oe-square" style={{ width: w, height: v }} />,
    };
  },
  overshoot: () => ({
    title: ['Same size?', '¿Mismo tamaño?'],
    hint: ['Resize the circle until it looks as big as the square.', 'Cambia el tamaño del círculo hasta que se vea igual de grande que el cuadrado.'],
    min: 60, max: 130, start: Math.round(pick([rand(64, 84), rand(118, 130)])), target: 90 * 1.13, k: 4,
    lesson: ['Circles cover less area than squares of the same width, so icon grids make them about 13% bigger. Type does the same with round letters.', 'Un círculo cubre menos área que un cuadrado del mismo ancho, así que las grillas de íconos lo agrandan cerca de un 13%. La tipografía hace lo mismo con las letras redondas.'],
    render: v => (
      <div className="oe-pair"><span className="oe-sq" style={{ width: 90, height: 90 }} /><span className="oe-circle" style={{ width: v, height: v }} /></div>
    ),
  }),
  align: () => {
    const x = Math.round(rand(18, 44));
    return {
      title: ['Align the button', 'Alinea el botón'],
      hint: ['Line up its left edge with the heading.', 'Alinea su borde izquierdo con el título.'],
      min: 0, max: 90, start: Math.round(pick([rand(0, x - 8), rand(x + 10, 90)])), target: x, k: 6,
      lesson: ['Shared edges create invisible lines that make a layout feel intentional.', 'Los bordes compartidos crean líneas invisibles que hacen que un diseño se vea intencional.'],
      render: (v, es) => (
        <div className="oe-card">
          <span className="oe-heading" style={{ marginLeft: x }}>{es ? 'Precios' : 'Pricing'}</span>
          <span className="oe-line" style={{ marginLeft: x }} />
          <span className="oe-mini" style={{ marginLeft: v }}>{es ? 'Mejorar' : 'Upgrade'}</span>
        </div>
      ),
    };
  },
  center: () => {
    const W = 260, d = 44;
    return {
      title: ['Center the badge', 'Centra la insignia'],
      hint: ['Put it in the horizontal middle of the card.', 'Ponla en el centro horizontal de la tarjeta.'],
      min: 0, max: W - d, start: Math.round(pick([rand(0, 70), rand(150, W - d)])), target: (W - d) / 2, k: 4,
      lesson: ['Without edges to compare, centering by eye drifts. Guides and auto layout exist for a reason.', 'Sin bordes para comparar, centrar a ojo se desvía. Por eso existen las guías y el auto layout.'],
      render: v => <div className="oe-bar" style={{ width: W }}><span className="oe-badge" style={{ left: v, width: d, height: d }} /></div>,
    };
  },
};

const scoreOf = r => Math.max(0, Math.round(100 - Math.abs(r.value - r.target) * r.k));

export default function OpticalEye() {
  const { t, lang } = useLang();
  const L = pair => (lang === 'es' ? pair[1] : pair[0]);
  const [phase, setPhase] = useState('intro');
  const [rounds, setRounds] = useState([]);
  const [i, setI] = useState(0);
  const [value, setValue] = useState(0);
  const [locked, setLocked] = useState(false);
  const [results, setResults] = useState([]);
  const [best, setBest] = useState(() => { try { return +localStorage.getItem('optical:best') || 0; } catch { return 0; } });
  const [copied, setCopied] = useState(false);

  const start = () => {
    const rs = shuffle(Object.keys(KINDS)).map(k => ({ kind: k, ...KINDS[k]() }));
    setRounds(rs); setI(0); setResults([]); setLocked(false); setValue(rs[0].start);
    setPhase('play');
    track('Optical Eye start');
  };

  const r = rounds[i];
  const lock = () => {
    if (!r || locked) return;
    const res = { ...r, value, pts: scoreOf({ ...r, value }) };
    setResults(a => [...a, res]);
    setLocked(true);
    haptic(res.pts >= 80 ? 10 : [20, 30, 20]);
  };
  const next = () => {
    if (i + 1 >= rounds.length) { setPhase('over'); return; }
    setI(n => n + 1); setValue(rounds[i + 1].start); setLocked(false);
  };

  // Enter locks in, then moves on.
  useEffect(() => {
    if (phase !== 'play') return undefined;
    const onKey = e => { if (e.key === 'Enter') { e.preventDefault(); locked ? next() : lock(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const total = useMemo(() => (results.length ? Math.round(results.reduce((a, x) => a + x.pts, 0) / results.length) : 0), [results]);
  useEffect(() => {
    if (phase !== 'over') return;
    track('Optical Eye finished', { score: total });
    if (total > best) { setBest(total); try { localStorage.setItem('optical:best', String(total)); } catch { /* private mode */ } }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // On phones the intro text pushes the board down; bring it into view.
  useEffect(() => {
    if (phase !== 'play') return undefined;
    const id = setTimeout(() => glideTo(document.querySelector('.pf-play')), 450); // after the intro card exits
    return () => clearTimeout(id);
  }, [phase]);

  async function share() {
    const text = `Optical Eye · ${total}% ${t('precision', 'de precisión')}\n${results.map(x => (x.pts >= 90 ? '🟩' : x.pts >= 70 ? '🟨' : '🟥')).join('')}\nfun.alevasquez.dev/optical-eye`;
    try {
      if (navigator.share && window.matchMedia('(pointer: coarse)').matches) await navigator.share({ text });
      else { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1600); }
    } catch { /* cancelled */ }
  }

  const last = results[results.length - 1];
  return (
    <ToolPage id="optical-eye" intro="Seven small layout flaws to fix by eye: center a play icon, even out padding, match spacing, size a circle against a square. Some answers are mathematical, some are optical.">
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: EASE }} className="card pf-intro">
            <div className="oe-demo" aria-hidden="true"><span className="oe-play oe-play-sm"><svg width="22" height="22" viewBox="0 0 54 54" style={{ transform: 'translateX(4px)' }}><path d="M0 0 L54 27 L0 54 Z" fill="currentColor" /></svg></span><span className="oe-sq" style={{ width: 40, height: 40 }} /><span className="oe-circle" style={{ width: 45, height: 45 }} /></div>
            <h2 className="pf-h">{t('How sharp is your eye for layout?', '¿Qué tan fino es tu ojo para el layout?')}</h2>
            <ul className="pf-rules">
              <li>{t('Seven rounds, one slider each. No numbers, only your eye.', 'Siete rondas, un control en cada una. Sin números, solo tu ojo.')}</li>
              <li>{t('Some rounds want exact equality, others want the optical answer.', 'Algunas rondas piden igualdad exacta y otras la respuesta óptica.')}</li>
              <li>{t('Lock it in to see the perfect value and your precision.', 'Confirma para ver el valor perfecto y tu precisión.')}</li>
            </ul>
            <motion.button type="button" className="btn btn-primary pf-start" whileTap={{ scale: 0.96 }} onClick={start}>{t('Start the game', 'Empezar el juego')}</motion.button>
            {best > 0 && <p className="small muted" style={{ margin: 0 }}>{t(`Your best: ${best}%`, `Tu mejor puntaje: ${best}%`)}</p>}
          </motion.div>
        )}

        {phase === 'play' && r && (
          <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pf-play">
            <div className="pf-hud">
              <span className="mono">{i + 1}<span className="muted">/{rounds.length}</span></span>
              <strong className="oe-title">{L(r.title)}</strong>
              <span className="mono">{results.length ? `${total}%` : '–'}</span>
            </div>
            <motion.div key={i} className="oe-stage" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35, ease: EASE }}>
              {r.render(value, lang === 'es')}
              {locked && (
                <motion.div className="oe-ghost" initial={{ opacity: 0 }} animate={{ opacity: 1 }} aria-hidden="true">{r.render(r.target, lang === 'es')}</motion.div>
              )}
            </motion.div>
            {!locked && <p className="muted small" style={{ margin: 0, textAlign: 'center' }}>{L(r.hint)}</p>}
            <AnimatePresence>
              {locked && last && (
                <motion.div className={'eg-result ' + (last.pts >= 70 ? 'is-ok' : 'is-bad')} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }} role="status">
                  <strong>{last.pts}%</strong>
                  <span className="small">{L(r.lesson)}</span>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="hh-slider">
              <input type="range" min={r.min} max={r.max} step="0.5" value={value} disabled={locked} aria-label={L(r.title)} onChange={e => setValue(+e.target.value)} style={{ '--track': 'var(--surface-2)', '--thumb': 'var(--accent-a)' }} />
            </div>
            {locked
              ? <motion.button type="button" className="btn btn-primary hh-cta" whileTap={{ scale: 0.97 }} onClick={next}>{i + 1 >= rounds.length ? t('See my score', 'Ver mi puntaje') : t('Next round →', 'Siguiente ronda →')}</motion.button>
              : <motion.button type="button" className="btn btn-primary hh-cta" whileTap={{ scale: 0.97 }} onClick={lock}>{t('Lock it in', 'Confirmar')}</motion.button>}
          </motion.div>
        )}

        {phase === 'over' && (
          <motion.div key="over" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }} className="stack">
            <Reveal className="card pf-over">
              <motion.div className="hh-total" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
                <span className="hh-grad">{total}</span><span className="muted">%</span>
              </motion.div>
              <p className="muted" style={{ margin: 0 }}>
                {total >= 90 ? t('Pixel-perfect. Design reviews fear you.', 'Pixel perfect. Las revisiones de diseño te temen.') : total >= 75 ? t('Sharp eye. The optical rounds are the sneaky ones.', 'Buen ojo. Las rondas ópticas son las tramposas.') : t('Your eye is learning. That’s why designers zoom to 400%.', 'Tu ojo está aprendiendo. Por eso los diseñadores hacen zoom al 400%.')}
              </p>
              <div className="pf-strip" aria-hidden="true">{results.map((x, k) => <span key={k} className={x.pts >= 70 ? 'is-ok' : 'is-bad'} />)}</div>
              <div className="chip-row" style={{ justifyContent: 'center' }}>
                <motion.button type="button" className="btn btn-primary" whileTap={{ scale: 0.96 }} onClick={share}>{copied ? t('Copied ✓', 'Copiado ✓') : t('Share score', 'Compartir puntaje')}</motion.button>
                <button type="button" className="btn btn-ghost" onClick={start}>{t('Play again', 'Jugar otra vez')}</button>
              </div>
            </Reveal>
            <Reveal className="card">
              <h2 className="eyebrow">{t('Round by round', 'Ronda por ronda')}</h2>
              <ul className="oe-list">
                {results.map((x, k) => <li key={k}><span>{L(x.title)}</span><span className="mono">{x.pts}%</span></li>)}
              </ul>
            </Reveal>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPage>
  );
}
