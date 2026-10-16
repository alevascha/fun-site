import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ToolPage from '../components/ToolPage';
import { Reveal } from '../components/ui';
import { EASE } from '../lib/motion';
import { useLang } from '../i18n';
import { track } from '../lib/analytics';
import { haptic } from '../lib/haptics';
import { glideTo } from '../lib/smoothScroll';
import './KernMe.css';

/* Kern Me: six words set in the site's display serif, each with one letter
   pair spaced wrong. Slide the second letter until the gap looks like the
   rest of the word. The right answer isn't made up: it is the kerning the
   typeface's designer built into the font, measured in the browser with
   canvas (width of the pair minus the width of each letter). Words are drawn
   letter by letter with font-kerning off and every pair's kerning applied by
   hand, so the "perfect" word on screen is exactly the font's own spacing. */

const FONT = '300 1000px "Crimson Pro"';
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);

// Why each kind of pair needs its kerning.
const DIAGONAL = ['Two diagonals leave a big wedge of empty space between them, so the pair has to tuck in until that wedge looks as light as the gaps between straight letters.', 'Dos diagonales dejan una gran cuña de espacio vacío entre ellas, así que el par tiene que acercarse hasta que esa cuña se vea tan liviana como los espacios entre letras rectas.'];
const OVERHANG = ['The top of this capital leaves open space underneath, so the lowercase letter slides in under it. Spaced by its box, it looks like a hole in the word.', 'La parte de arriba de esta mayúscula deja espacio abierto debajo, así que la minúscula se mete por debajo. Espaciada por su caja, parece un hueco en la palabra.'];
const OPEN = ['Both letters are open on the sides that face each other (the L at its top right, the T or Y at its bottom left), so their empty corners overlap and the pair can sit much closer.', 'Las dos letras están abiertas en los lados que se miran (la L arriba a la derecha, la T o la Y abajo a la izquierda), así que sus esquinas vacías se superponen y el par puede ir mucho más junto.'];

// Pairs this font kerns clearly (about -0.04 to -0.065 em at weight 300), so
// every round has a real answer to find.
const WORDS = [
  { w: 'Yoga', i: 0, why: OVERHANG },
  { w: 'Yes', i: 0, why: OVERHANG },
  { w: 'Wave', i: 0, why: OVERHANG },
  { w: 'Vote', i: 0, why: OVERHANG },
  { w: 'Today', i: 0, why: OVERHANG },
  { w: 'Team', i: 0, why: OVERHANG },
  { w: 'VALUE', i: 0, why: DIAGONAL },
  { w: 'AWAY', i: 1, why: DIAGONAL },
  { w: 'SALT', i: 2, why: OPEN },
  { w: 'LYRIC', i: 0, why: OPEN },
];

// Kerning of every pair in the word, in em, from the font itself.
function measure(word) {
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.font = FONT;
  if ('fontKerning' in ctx) ctx.fontKerning = 'normal';
  const w = s => ctx.measureText(s).width;
  return [...word].map((ch, k) => (k ? (w(word[k - 1] + ch) - w(word[k - 1]) - w(ch)) / 1000 : 0));
}

const RANGE = 0.24; // slider reach on each side of the right answer, in em
const scoreOf = (v, target) => Math.max(0, Math.round(100 - Math.abs(v - target) * 900));

function Word({ word, kerns, at, value, className }) {
  return (
    <span className={'kern-word ' + (className || '')} aria-hidden="true">
      {[...word].map((ch, k) => (
        <span key={k} className={k === at + 1 ? 'kern-moving' : undefined} style={{ marginLeft: `${k === at + 1 ? value : kerns[k]}em` }}>{ch}</span>
      ))}
    </span>
  );
}

export default function KernMe() {
  const { t, lang } = useLang();
  const L = pair => (lang === 'es' ? pair[1] : pair[0]);
  const [phase, setPhase] = useState('intro');
  const [rounds, setRounds] = useState([]);
  const [i, setI] = useState(0);
  const [value, setValue] = useState(0);
  const [locked, setLocked] = useState(false);
  const [results, setResults] = useState([]);
  const [best, setBest] = useState(() => { try { return +localStorage.getItem('kern:best') || 0; } catch { return 0; } });
  const [copied, setCopied] = useState(false);

  const start = async () => {
    // Measure with the real font, not the fallback.
    try { await document.fonts.load(FONT, 'AVWTy'); } catch { /* measured with whatever is there */ }
    const rs = shuffle(WORDS).slice(0, 6).map(r => {
      const kerns = measure(r.w);
      const target = kerns[r.i + 1];
      const off = pick([-1, 1]) * (0.07 + Math.random() * 0.13);
      return { ...r, kerns, target, start: Math.max(target - RANGE, Math.min(target + RANGE, target + off)) };
    });
    setRounds(rs); setI(0); setResults([]); setLocked(false); setValue(rs[0].start);
    setPhase('play');
    track('Kern Me start');
  };

  const r = rounds[i];
  const lock = () => {
    if (!r || locked) return;
    const res = { ...r, value, pts: scoreOf(value, r.target) };
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
    const onKey = e => { if (e.key === 'Enter') { e.preventDefault(); if (locked) next(); else lock(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const total = useMemo(() => (results.length ? Math.round(results.reduce((a, x) => a + x.pts, 0) / results.length) : 0), [results]);
  useEffect(() => {
    if (phase !== 'over') return;
    track('Kern Me finished', { score: total });
    if (total > best) { setBest(total); try { localStorage.setItem('kern:best', String(total)); } catch { /* private mode */ } }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // On phones the intro text pushes the board down; bring it into view.
  useEffect(() => {
    if (phase !== 'play') return undefined;
    const id = setTimeout(() => glideTo(document.querySelector('.pf-play')), 450);
    return () => clearTimeout(id);
  }, [phase]);

  async function share() {
    const text = `Kern Me · ${total}% ${t('precision', 'de precisión')}\n${results.map(x => (x.pts >= 90 ? '🟩' : x.pts >= 70 ? '🟨' : '🟥')).join('')}\nfun.alevasquez.dev/kern-me`;
    try {
      if (navigator.share && window.matchMedia('(pointer: coarse)').matches) await navigator.share({ text });
      else { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1600); }
    } catch { /* cancelled */ }
  }

  const last = results[results.length - 1];
  const pairOf = x => x.w.slice(x.i, x.i + 2);
  return (
    <ToolPage id="kern-me" intro="Six words, each with one letter pair spaced wrong. Slide the letter until the gap looks right. The answer is the kerning the typeface’s designer built into the font.">
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: EASE }} className="card pf-intro">
            <div className="kern-demo" aria-hidden="true"><span>A</span><span className="kern-demo-v">V</span></div>
            <h2 className="pf-h">{t('Can you space letters by eye?', '¿Puedes espaciar letras a ojo?')}</h2>
            <ul className="pf-rules">
              <li>{t('Six words. In each one, a single letter pair is too tight or too loose.', 'Seis palabras. En cada una, un solo par de letras está muy junto o muy separado.')}</li>
              <li>{t('Slide the marked letter until the word looks evenly spaced.', 'Mueve la letra marcada hasta que la palabra se vea pareja.')}</li>
              <li>{t('Lock it in to see the font designer’s spacing and why.', 'Confirma para ver el espaciado del diseñador de la fuente y por qué.')}</li>
            </ul>
            <motion.button type="button" className="btn btn-primary pf-start" whileTap={{ scale: 0.96 }} onClick={start}>{t('Start the game', 'Empezar el juego')}</motion.button>
            {best > 0 && <p className="small muted" style={{ margin: 0 }}>{t(`Your best: ${best}%`, `Tu mejor puntaje: ${best}%`)}</p>}
          </motion.div>
        )}

        {phase === 'play' && r && (
          <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pf-play">
            <div className="pf-hud">
              <span className="mono">{i + 1}<span className="muted">/{rounds.length}</span></span>
              <strong className="oe-title">{t('Kern the pair', 'Ajusta el par')} <span className="mono">{pairOf(r)}</span></strong>
              <span className="mono">{results.length ? `${total}%` : '–'}</span>
            </div>
            <motion.div key={i} className="oe-stage kern-stage" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35, ease: EASE }}>
              <span className="sr-only">{t(`Word: ${r.w}. Adjust the space between ${pairOf(r)}.`, `Palabra: ${r.w}. Ajusta el espacio entre ${pairOf(r)}.`)}</span>
              <div className="kern-layers">
                <Word word={r.w} kerns={r.kerns} at={r.i} value={value} className={locked ? 'is-locked' : ''} />
                {locked && (
                  <motion.div className="kern-ghost-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                    <Word word={r.w} kerns={r.kerns} at={r.i} value={r.target} className="kern-ghost" />
                  </motion.div>
                )}
              </div>
            </motion.div>
            {!locked && <p className="muted small" style={{ margin: 0, textAlign: 'center' }}>{t('The marked letter moves. Judge the whole word, not just the pair.', 'La letra marcada se mueve. Juzga la palabra completa, no solo el par.')}</p>}
            <AnimatePresence>
              {locked && last && (
                <motion.div className={'eg-result ' + (last.pts >= 70 ? 'is-ok' : 'is-bad')} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }} role="status">
                  <strong>{last.pts}%</strong>
                  <span className="small">{L(r.why)} {t('The outlined letter shows the designer’s spacing.', 'La letra con contorno muestra el espaciado del diseñador.')}</span>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="hh-slider">
              <input type="range" min={r.target - RANGE} max={r.target + RANGE} step="0.002" value={value} disabled={locked} aria-label={t(`Space between ${pairOf(r)}`, `Espacio entre ${pairOf(r)}`)} aria-valuetext={t('tighter or looser', 'más junto o más separado')} onChange={e => setValue(+e.target.value)} style={{ '--track': 'var(--surface-2)', '--thumb': 'var(--accent-a)' }} />
            </div>
            {locked
              ? <motion.button type="button" className="btn btn-primary hh-cta" whileTap={{ scale: 0.97 }} onClick={next}>{i + 1 >= rounds.length ? t('See my score', 'Ver mi puntaje') : t('Next word →', 'Siguiente palabra →')}</motion.button>
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
                {total >= 90 ? t('Type designer’s eye. Go draw a font.', 'Ojo de diseñador tipográfico. Ve a dibujar una fuente.') : total >= 75 ? t('Sharp. Diagonals are where most people slip.', 'Buen ojo. En las diagonales es donde casi todos fallan.') : t('Spacing is learned. Squint at the word: the gaps should feel equally gray.', 'El espaciado se aprende. Entrecierra los ojos: los espacios deben sentirse igual de grises.')}
              </p>
              <div className="pf-strip" aria-hidden="true">{results.map((x, k) => <span key={k} className={x.pts >= 70 ? 'is-ok' : 'is-bad'} />)}</div>
              <div className="chip-row" style={{ justifyContent: 'center' }}>
                <motion.button type="button" className="btn btn-primary" whileTap={{ scale: 0.96 }} onClick={share}>{copied ? t('Copied ✓', 'Copiado ✓') : t('Share score', 'Compartir puntaje')}</motion.button>
                <button type="button" className="btn btn-ghost" onClick={start}>{t('Play again', 'Jugar otra vez')}</button>
              </div>
            </Reveal>
            <Reveal className="card">
              <h2 className="eyebrow">{t('Word by word', 'Palabra por palabra')}</h2>
              <ul className="oe-list">
                {results.map((x, k) => <li key={k}><span>{x.w} <span className="muted mono">({pairOf(x)})</span></span><span className="mono">{x.pts}%</span></li>)}
              </ul>
            </Reveal>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPage>
  );
}
