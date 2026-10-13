import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ToolPage from '../components/ToolPage';
import { Reveal } from '../components/ui';
import { contrastRatio, formatRatio, hslToHex, hslToRgb } from '../lib/color';
import { EASE } from '../lib/motion';
import { useLang } from '../i18n';
import { track } from '../lib/analytics';
import { haptic } from '../lib/haptics';
import { GamePrimer, Lesson, PracticeBadge, PracticeButton } from '../components/GamePrimer';

/* Pass or Fail: a quick-fire WCAG contrast game. Each round shows text on a
   background and asks whether it meets AA (4.5:1 for normal text, 3:1 for
   large text). Pairs are generated near the thresholds so it's a real test
   of the eye, never a coin flip right on the line. */

const ROUNDS = 20;
const SECONDS = 6;
const PRACTICE = 4;

// Text lightness that gives `ratio` against bg (binary search on L).
// Light text on dark bg: contrast grows with L; dark text on light bg: it shrinks.
function fgFor(bgRgb, h, s, ratio, lighter) {
  let lo = lighter ? 50 : 0, hi = lighter ? 100 : 50;
  for (let n = 0; n < 22; n++) {
    const mid = (lo + hi) / 2;
    const r = contrastRatio(hslToRgb(h, s, mid), bgRgb);
    if (lighter === (r < ratio)) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

function makeRound() {
  const large = Math.random() < 0.3;
  const need = large ? 3 : 4.5;
  // Aim a bit either side of the threshold, never inside the ±0.2 grey zone.
  const pass = Math.random() < 0.5;
  const offset = 0.25 + Math.random() * (large ? 1.6 : 2.4);
  const goal = Math.max(1.4, pass ? need + offset : need - offset);
  for (let tries = 0; tries < 30; tries++) {
    const bh = Math.random() * 360, bs = 20 + Math.random() * 70;
    const darkBg = Math.random() < 0.45;
    const bl = darkBg ? 8 + Math.random() * 22 : 70 + Math.random() * 26;
    const bgRgb = hslToRgb(bh, bs, bl);
    const fh = (bh + (Math.random() < 0.5 ? 0 : 150 + Math.random() * 60)) % 360, fs = 15 + Math.random() * 70;
    const fl = fgFor(bgRgb, fh, fs, goal, darkBg);
    const fgRgb = hslToRgb(fh, fs, fl);
    const ratio = contrastRatio(fgRgb, bgRgb);
    if (Math.abs(ratio - need) < 0.2 || Math.abs(ratio - goal) > 0.6) continue;
    return { bg: hslToHex(bh, bs, bl), fg: hslToHex(fh, fs, fl), ratio, large, need, pass: ratio >= need };
  }
  return { bg: '#FFFFFF', fg: '#767676', ratio: 4.54, large: false, need: 4.5, pass: true };
}

const SAMPLES = {
  en: ['Your order has shipped', 'Read the full case study', 'Save changes', 'Free returns for 30 days', 'Join the waitlist', 'Terms apply'],
  es: ['Tu pedido fue enviado', 'Lee el caso completo', 'Guardar cambios', 'Devoluciones gratis por 30 días', 'Únete a la lista de espera', 'Aplican condiciones'],
};

export default function PassOrFail() {
  const { t, lang } = useLang();
  const [phase, setPhase] = useState('intro'); // intro | play | over
  const [rounds, setRounds] = useState([]);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState([]); // { correct, said, ms }
  const [feedback, setFeedback] = useState(null);
  const [left, setLeft] = useState(SECONDS);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(() => { try { return +localStorage.getItem('passfail:best') || 0; } catch { return 0; } });
  const started = useRef(0);
  const [copied, setCopied] = useState(false);
  // Practice: a few untimed rounds where every answer waits for "Next" and explains itself.
  const [practice, setPractice] = useState(false);
  const [practiced, setPracticed] = useState(false);
  const total = practice ? PRACTICE : ROUNDS;

  const start = (asPractice = false) => {
    setPractice(asPractice);
    setRounds(Array.from({ length: asPractice ? PRACTICE : ROUNDS }, makeRound));
    setI(0); setAnswers([]); setFeedback(null); setStreak(0);
    setPhase('play');
    started.current = performance.now();
    track(asPractice ? 'Pass or Fail practice' : 'Pass or Fail start');
  };

  const advance = useCallback(() => {
    setFeedback(null);
    if (i + 1 >= total) {
      if (practice) { setPracticed(true); setPhase('intro'); } else setPhase('over');
    } else { setI(n => n + 1); started.current = performance.now(); }
  }, [i, total, practice]);

  const answer = useCallback((said) => {
    if (phase !== 'play' || feedback) return;
    const r = rounds[i];
    const correct = said !== null && said === r.pass;
    const ms = performance.now() - started.current;
    setAnswers(a => [...a, { correct, said, ms }]);
    setStreak(s => (correct ? s + 1 : 0));
    setFeedback({ correct, timeout: said === null });
    haptic(correct ? 10 : [30, 40, 30]);
    if (!practice) setTimeout(advance, correct ? 1100 : 2200);
  }, [phase, feedback, rounds, i, practice, advance]);

  // Countdown per round; running out counts as a miss.
  useEffect(() => {
    if (phase !== 'play' || feedback || practice) return;
    setLeft(SECONDS);
    const id = setInterval(() => {
      const s = SECONDS - (performance.now() - started.current) / 1000;
      setLeft(Math.max(0, s));
      if (s <= 0) { clearInterval(id); answer(null); }
    }, 100);
    return () => clearInterval(id);
  }, [phase, i, feedback, answer, practice]);

  // Keyboard: ← / F = fail, → / P = pass.
  useEffect(() => {
    const onKey = e => {
      if (phase !== 'play') return;
      if (feedback && practice && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); advance(); return; }
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'p') answer(true);
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'f') answer(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, answer, feedback, practice, advance]);

  const score = answers.filter(a => a.correct).length;
  useEffect(() => {
    if (phase !== 'over' || practice) return;
    track('Pass or Fail finished', { score });
    if (score > best) { setBest(score); try { localStorage.setItem('passfail:best', String(score)); } catch { /* private mode */ } }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  async function share() {
    const text = `Pass or Fail · ${score}/${ROUNDS} ${t('WCAG contrast calls', 'decisiones de contraste WCAG')}\n${answers.map(a => (a.correct ? '🟩' : '🟥')).join('')}\nfun.alevasquez.dev/pass-or-fail`;
    try {
      if (navigator.share && window.matchMedia('(pointer: coarse)').matches) await navigator.share({ text });
      else { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1600); }
    } catch { /* cancelled */ }
  }

  // Why a pair passes or fails, in plain words.
  const lesson = rd => {
    const kind = rd.large ? t('large text', 'texto grande') : t('normal text', 'texto normal');
    const ratio = formatRatio(rd.ratio);
    return rd.pass
      ? t(`${ratio}:1 is at or above the ${rd.need}:1 minimum for ${kind}, so it passes.`, `${ratio}:1 está en o sobre el mínimo de ${rd.need}:1 para ${kind}, así que pasa.`)
      : t(`${ratio}:1 is below the ${rd.need}:1 minimum for ${kind}, so it fails: some people would struggle to read it.`, `${ratio}:1 está bajo el mínimo de ${rd.need}:1 para ${kind}, así que falla: a algunas personas les costaría leerlo.`);
  };

  const r = rounds[i];
  const sample = SAMPLES[lang] || SAMPLES.en;
  const misses = rounds.map((rd, k) => ({ ...rd, ...answers[k] })).filter((x, k) => answers[k] && !answers[k].correct);
  const avg = answers.length ? answers.reduce((a, x) => a + Math.min(x.ms, SECONDS * 1000), 0) / answers.length / 1000 : 0;

  return (
    <ToolPage id="pass-or-fail" intro="Is this text easy enough to read on its background? Twenty quick rounds to train your eye for accessible contrast (the WCAG AA rule), with the real numbers revealed after every answer. No design experience needed.">
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: EASE }} className="card pf-intro">
            <div className="pf-demo" aria-hidden="true">
              <span style={{ background: '#FFFFFF', color: '#595959' }}>Aa 7.0</span>
              <span style={{ background: '#FFFFFF', color: '#949494' }}>Aa 3.0</span>
              <span style={{ background: '#1D1C1B', color: '#8A8784' }}>Aa 4.6</span>
            </div>
            <h2 className="pf-h">{t('Can you spot failing contrast?', '¿Puedes detectar el contraste que falla?')}</h2>
            <GamePrimer
              plain={t('Some text is hard to read because it blends into its background. You decide, by eye, whether each example stands out enough to meet the accessibility rule.', 'Hay textos difíciles de leer porque se confunden con el fondo. Tú decides a ojo si cada ejemplo resalta lo suficiente para cumplir la regla de accesibilidad.')}
              terms={[
                [t('Contrast ratio', 'Proporción de contraste'), t('How much the text stands out, from 1:1 (invisible) to 21:1 (black on white).', 'Cuánto resalta el texto, de 1:1 (invisible) a 21:1 (negro sobre blanco).')],
                ['WCAG AA', t('The accessibility standard most sites must meet: 4.5:1 for normal text, 3:1 for large or bold text.', 'El estándar de accesibilidad que la mayoría de sitios debe cumplir: 4.5:1 para texto normal y 3:1 para texto grande o en negrita.')],
              ]}
            />
            {practiced && <Lesson tone="ok">{t('Practice done. Now the real thing: same idea, 6 seconds per call.', 'Práctica lista. Ahora en serio: la misma idea, 6 segundos por respuesta.')}</Lesson>}
            <ul className="pf-rules">
              <li>{t(`${ROUNDS} rounds, ${SECONDS} seconds each.`, `${ROUNDS} rondas, ${SECONDS} segundos cada una.`)}</li>
              <li>{t('Normal text needs 4.5:1. Large or bold text needs 3:1.', 'El texto normal necesita 4.5:1. El texto grande o en negrita, 3:1.')}</li>
              <li>{t('Tap Pass or Fail, or use ← / → on a keyboard.', 'Toca Pasa o Falla, o usa ← / → en el teclado.')}</li>
            </ul>
            <motion.button type="button" className="btn btn-primary pf-start" whileTap={{ scale: 0.96 }} onClick={() => start(false)}>{t('Start the game', 'Empezar el juego')}</motion.button>
            {!practiced && <PracticeButton onClick={() => start(true)} />}
            {best > 0 && <p className="small muted" style={{ margin: 0 }}>{t(`Your best: ${best}/${ROUNDS}`, `Tu mejor puntaje: ${best}/${ROUNDS}`)}</p>}
          </motion.div>
        )}

        {phase === 'play' && r && (
          <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pf-play">
            {practice && <PracticeBadge onExit={() => start(false)} />}
            <div className="pf-hud">
              <span className="mono">{i + 1}<span className="muted">/{total}</span></span>
              <span className="pf-timer" aria-hidden="true"><motion.span style={{ width: `${practice ? 100 : (left / SECONDS) * 100}%`, background: !practice && left < 2 ? 'var(--fail)' : 'var(--accent-grad-linear)' }} /></span>
              <span className="mono">{streak > 2 ? `🔥 ${streak}` : `${score} ✓`}</span>
            </div>
            <motion.div key={i} className="pf-card" initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }} style={{ background: r.bg }}>
              <span className="pf-kind" style={{ color: r.fg, borderColor: r.fg }}>{r.large ? t('Large text · 3:1', 'Texto grande · 3:1') : t('Normal text · 4.5:1', 'Texto normal · 4.5:1')}</span>
              <p className="pf-sample" style={{ color: r.fg, fontSize: r.large ? 'clamp(26px, 6vw, 40px)' : 'clamp(16px, 3.6vw, 19px)', fontWeight: r.large ? 700 : 400 }}>
                {sample[i % sample.length]}
              </p>
              <AnimatePresence>
                {feedback && (
                  <motion.div className={'pf-feedback ' + (feedback.correct ? 'is-ok' : 'is-bad')} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }} role="status">
                    <strong>{feedback.timeout ? t('Time!', '¡Tiempo!') : feedback.correct ? t('Correct', 'Correcto') : t('Nope', 'No')}</strong>
                    <span className="mono">{formatRatio(r.ratio)}:1 · {t(`needs ${r.need}:1`, `necesita ${r.need}:1`)} · {r.pass ? t('passes', 'pasa') : t('fails', 'falla')}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            {feedback && practice && <Lesson tone={feedback.correct ? 'ok' : 'bad'}>{lesson(r)}</Lesson>}
            {feedback && practice ? (
              <motion.button type="button" className="btn btn-primary hh-cta" whileTap={{ scale: 0.97 }} onClick={advance}>{i + 1 >= total ? t('Finish practice', 'Terminar práctica') : t('Next →', 'Siguiente →')}</motion.button>
            ) : (
            <div className="pf-buttons">
              <motion.button type="button" className="pf-btn pf-fail" whileTap={{ scale: 0.94 }} onClick={() => answer(false)} disabled={!!feedback}>✕ {t('Fail', 'Falla')}</motion.button>
              <motion.button type="button" className="pf-btn pf-pass" whileTap={{ scale: 0.94 }} onClick={() => answer(true)} disabled={!!feedback}>✓ {t('Pass', 'Pasa')}</motion.button>
            </div>
            )}
          </motion.div>
        )}

        {phase === 'over' && (
          <motion.div key="over" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: EASE }} className="stack">
            <Reveal className="card pf-over">
              <motion.div className="hh-total" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
                <span className="hh-grad">{score}</span><span className="muted">/{ROUNDS}</span>
              </motion.div>
              <p className="muted" style={{ margin: 0 }}>
                {score >= 18 ? t('Accessibility auditor energy.', 'Nivel auditor de accesibilidad.') : score >= 14 ? t('Good eye. The near-misses are the tricky ones.', 'Buen ojo. Los casos al límite son los difíciles.') : t('Contrast is hard to judge by eye — that’s why we measure it.', 'El contraste es difícil de juzgar a ojo: por eso se mide.')}
                {' '}{t(`Avg. ${avg.toFixed(1)}s per call.`, `Promedio de ${avg.toFixed(1)} s por respuesta.`)}
              </p>
              <div className="pf-strip" aria-hidden="true">{answers.map((a, k) => <span key={k} className={a.correct ? 'is-ok' : 'is-bad'} />)}</div>
              <div className="chip-row" style={{ justifyContent: 'center' }}>
                <motion.button type="button" className="btn btn-primary" whileTap={{ scale: 0.96 }} onClick={share}>{copied ? t('Copied ✓', 'Copiado ✓') : t('Share score', 'Compartir puntaje')}</motion.button>
                <button type="button" className="btn btn-ghost" onClick={() => start(false)}>{t('Play again', 'Jugar otra vez')}</button>
                <Link to={lang === 'es' ? '/es/verificador-de-contraste' : '/contrast-checker'} className="btn btn-ghost">{t('Open Contrast Checker', 'Abrir el verificador')}</Link>
              </div>
            </Reveal>
            {misses.length > 0 && (
              <Reveal className="card">
                <h2 className="eyebrow">{t('The ones you missed', 'Las que fallaste')}</h2>
                <div className="pf-misses">
                  {misses.map((m, k) => (
                    <div key={k} className="pf-miss" style={{ background: m.bg, color: m.fg }}>
                      <span style={{ fontWeight: m.large ? 700 : 400, fontSize: m.large ? 20 : 15 }}>Aa {formatRatio(m.ratio)}:1</span>
                      <span className="pf-miss-note">{m.pass ? t(`Passes ${m.large ? '3' : '4.5'}:1`, `Pasa ${m.large ? '3' : '4.5'}:1`) : t(`Fails ${m.large ? '3' : '4.5'}:1`, `Falla ${m.large ? '3' : '4.5'}:1`)}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPage>
  );
}
