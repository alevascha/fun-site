import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ToolPage from '../components/ToolPage';
import { Reveal, Segmented } from '../components/ui';
import { deltaE, hexToRgb, hslToHex, hslToRgb } from '../lib/color';
import { EASE } from '../lib/motion';
import { useLang } from '../i18n';
import { track } from '../lib/analytics';
import { haptic } from '../lib/haptics';

/* Hue Hunt: match a target color with hue / saturation / lightness sliders.
   Each guess is scored by perceptual distance (CIE ΔE), so "close" means
   close to the eye, not close in numbers. Daily mode uses the same five
   colors for everyone (seeded by date) and gives a shareable result. */

const ROUNDS = 5;

// Small seeded PRNG so the daily set is identical for every visitor.
function mulberry32(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const today = () => new Date().toISOString().slice(0, 10);
const daySeed = d => [...d].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);

// Targets avoid near-grays and extremes, which are no fun to hunt.
function makeTargets(rand) {
  return Array.from({ length: ROUNDS }, () => ({
    h: Math.round(rand() * 359),
    s: Math.round(35 + rand() * 60),
    l: Math.round(28 + rand() * 46),
  }));
}

// ΔE 0 → 100 points; ΔE ≈ 2 is barely noticeable, ΔE 50 is a different color.
const scoreFor = d => Math.max(0, Math.round(100 - d * 2));
const tile = s => (s >= 90 ? '🟩' : s >= 75 ? '🟨' : s >= 55 ? '🟧' : '🟥');
const verdict = (s, t) => (s >= 95 ? t('Perfect eye!', '¡Ojo perfecto!') : s >= 85 ? t('So close', 'Casi exacto') : s >= 70 ? t('Nice', 'Bien') : s >= 50 ? t('In the family', 'De la misma familia') : t('Not quite', 'No tanto'));

function Slider({ label, value, min, max, onChange, track: bg, thumb, suffix = '' }) {
  return (
    <label className="hh-slider">
      <span className="hh-slider-head"><span>{label}</span><span className="mono">{value}{suffix}</span></span>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(+e.target.value)} style={{ '--track': bg, '--thumb': thumb }} />
    </label>
  );
}

export default function HueHunt() {
  const { t } = useLang();
  const [mode, setMode] = useState('daily');
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9));
  const targets = useMemo(() => makeTargets(mulberry32(mode === 'daily' ? daySeed(today()) : seed)), [mode, seed]);
  const [round, setRound] = useState(0);
  const [guess, setGuess] = useState({ h: 180, s: 50, l: 50 });
  const [results, setResults] = useState([]); // { target, guess, score }
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const done = results.length === ROUNDS && !revealed;
  const finished = results.length === ROUNDS;

  const storeKey = `huehunt:${today()}`;
  const [best, setBest] = useState(() => { try { return +localStorage.getItem(storeKey) || 0; } catch { return 0; } });

  useEffect(() => { setRound(0); setResults([]); setRevealed(false); setGuess({ h: 180, s: 50, l: 50 }); }, [targets]);

  const target = targets[Math.min(round, ROUNDS - 1)];
  const targetHex = hslToHex(target.h, target.s, target.l);
  const guessHex = hslToHex(guess.h, guess.s, guess.l);
  const total = results.reduce((a, r) => a + r.score, 0);

  function lockIn() {
    const d = deltaE(hexToRgb(targetHex), hslToRgb(guess.h, guess.s, guess.l));
    const score = scoreFor(d);
    setResults(r => [...r, { target: targetHex, guess: guessHex, score, d }]);
    setRevealed(true);
    haptic(score >= 85 ? [10, 40, 10] : 12);
    track('Hue Hunt guess', { mode, score });
  }

  function next() {
    setRevealed(false);
    if (results.length >= ROUNDS) return;
    setRound(r => r + 1);
    setGuess({ h: Math.round(Math.random() * 359), s: 50, l: 50 });
  }

  useEffect(() => {
    if (!finished || revealed) return;
    track('Hue Hunt finished', { mode, total });
    if (mode === 'daily' && total > best) {
      setBest(total);
      try { localStorage.setItem(storeKey, String(total)); } catch { /* private mode */ }
    }
  }, [finished, revealed]); // eslint-disable-line react-hooks/exhaustive-deps

  function restart() {
    if (mode === 'free') setSeed(Math.floor(Math.random() * 1e9));
    else { setRound(0); setResults([]); setRevealed(false); setGuess({ h: 180, s: 50, l: 50 }); }
  }

  async function share() {
    const text = `Hue Hunt ${mode === 'daily' ? today() : ''} · ${total}/${ROUNDS * 100}\n${results.map(r => tile(r.score)).join('')}\nfun.alevasquez.dev/hue-hunt`;
    try {
      if (navigator.share && window.matchMedia('(pointer: coarse)').matches) await navigator.share({ text });
      else { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1600); }
      track('Hue Hunt share');
    } catch { /* cancelled */ }
  }

  const last = results[results.length - 1];

  return (
    <ToolPage id="hue-hunt" intro="Match five colors by eye using hue, saturation and lightness. Every guess is scored by perceptual distance (ΔE), and the daily challenge is the same for everyone.">
      <div className="hh">
        <Reveal className="card hh-bar">
          <Segmented label={t('Mode', 'Modo')} value={mode} onChange={v => { setMode(v); track('Hue Hunt mode', { mode: v }); }} options={[{ value: 'daily', label: t('Daily challenge', 'Reto diario') }, { value: 'free', label: t('Free play', 'Juego libre') }]} />
          <div className="hh-progress" aria-label={t(`Round ${Math.min(round + 1, ROUNDS)} of ${ROUNDS}`, `Ronda ${Math.min(round + 1, ROUNDS)} de ${ROUNDS}`)}>
            {Array.from({ length: ROUNDS }, (_, i) => (
              <span key={i} className={'hh-dot' + (i < results.length ? ' is-done' : i === round ? ' is-now' : '')} style={i < results.length ? { background: results[i].target } : undefined}>{i < results.length ? tile(results[i].score) : ''}</span>
            ))}
          </div>
          <span className="hh-score mono">{total}<span className="muted">/{ROUNDS * 100}</span></span>
        </Reveal>

        {!done ? (
          <>
            <div className="hh-swatches">
              <motion.div key={'t' + round + mode + seed} className="hh-swatch" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: EASE }} style={{ background: targetHex }}>
                <span className="hh-tag">{t('Target', 'Objetivo')}{revealed && <b className="mono"> {targetHex}</b>}</span>
              </motion.div>
              <div className="hh-swatch" style={{ background: guessHex }}>
                <span className="hh-tag">{t('Your mix', 'Tu mezcla')}{revealed && <b className="mono"> {guessHex}</b>}</span>
                <AnimatePresence>
                  {revealed && last && (
                    <motion.div className="hh-result" initial={{ opacity: 0, scale: 0.6, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 22 }}>
                      <strong>{last.score}</strong>
                      <span>{verdict(last.score, t)}</span>
                      <span className="mono small">ΔE {last.d.toFixed(1)}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <Reveal className="card hh-controls">
              <Slider label={t('Hue', 'Tono')} value={guess.h} min={0} max={359} suffix="°" onChange={h => !revealed && setGuess(g => ({ ...g, h }))}
                track="linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)" thumb={hslToHex(guess.h, 100, 50)} />
              <Slider label={t('Saturation', 'Saturación')} value={guess.s} min={0} max={100} suffix="%" onChange={s => !revealed && setGuess(g => ({ ...g, s }))}
                track={`linear-gradient(90deg,${hslToHex(guess.h, 0, guess.l)},${hslToHex(guess.h, 100, guess.l)})`} thumb={guessHex} />
              <Slider label={t('Lightness', 'Luminosidad')} value={guess.l} min={0} max={100} suffix="%" onChange={l => !revealed && setGuess(g => ({ ...g, l }))}
                track={`linear-gradient(90deg,#000,${hslToHex(guess.h, guess.s, 50)},#fff)`} thumb={guessHex} />
              {revealed ? (
                <motion.button type="button" className="btn btn-primary hh-cta" whileTap={{ scale: 0.96 }} onClick={next} autoFocus>
                  {results.length >= ROUNDS ? t('See results', 'Ver resultados') : t('Next color →', 'Siguiente color →')}
                </motion.button>
              ) : (
                <motion.button type="button" className="btn btn-primary hh-cta" whileTap={{ scale: 0.96 }} onClick={lockIn}>{t('Lock in my guess', 'Confirmar mi color')}</motion.button>
              )}
            </Reveal>
          </>
        ) : (
          <Reveal className="card hh-final">
            <p className="eyebrow">{mode === 'daily' ? t(`Daily challenge · ${today()}`, `Reto diario · ${today()}`) : t('Free play', 'Juego libre')}</p>
            <motion.div className="hh-total" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
              <span className="hh-grad">{total}</span><span className="muted">/{ROUNDS * 100}</span>
            </motion.div>
            <p className="muted" style={{ margin: 0 }}>{total >= 450 ? t('Color-perfect. Designers fear you.', 'Color perfecto. Los diseñadores te temen.') : total >= 350 ? t('Sharp eye — a few hues away from perfect.', 'Buen ojo: a pocos tonos de la perfección.') : t('Lightness is the usual culprit. Try matching it first.', 'La luminosidad suele ser la culpable. Intenta igualarla primero.')}</p>
            <div className="hh-pairs">
              {results.map((r, i) => (
                <div key={i} className="hh-pair" title={`ΔE ${r.d.toFixed(1)}`}>
                  <span style={{ background: r.target }} /><span style={{ background: r.guess }} />
                  <b className="mono">{r.score}</b>
                </div>
              ))}
            </div>
            {mode === 'daily' && best > 0 && <p className="small muted" style={{ margin: 0 }}>{t(`Your best today: ${best}`, `Tu mejor puntaje hoy: ${best}`)}</p>}
            <div className="chip-row" style={{ justifyContent: 'center' }}>
              <motion.button type="button" className="btn btn-primary" whileTap={{ scale: 0.96 }} onClick={share}>{copied ? t('Copied ✓', 'Copiado ✓') : t('Share result', 'Compartir resultado')} {results.map(r => tile(r.score)).join('')}</motion.button>
              <button type="button" className="btn btn-ghost" onClick={restart}>{mode === 'free' ? t('New colors', 'Nuevos colores') : t('Play again', 'Jugar otra vez')}</button>
            </div>
          </Reveal>
        )}
      </div>
    </ToolPage>
  );
}
