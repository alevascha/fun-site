import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ToolPage from '../components/ToolPage';
import { Reveal } from '../components/ui';
import { contrastRatio, formatRatio, hslToHex, hslToRgb } from '../lib/color';
import { EASE } from '../lib/motion';
import { useLang } from '../i18n';
import { track } from '../lib/analytics';
import { haptic } from '../lib/haptics';
import { glideTo } from '../lib/smoothScroll';

/* Contrast Survival: the background drifts through hues and lightness, faster
   and faster. You hold the text lightness so the pair keeps passing WCAG:
   AA (4.5:1) first, AAA (7:1) after 20 seconds. Health drains while the pair
   fails and slowly refills while it passes. Survive as long as you can. */

const AAA_AT = 20; // seconds
const DRAIN = 26; // health per second while failing
const REGEN = 6;

// Background path: a few slow sine waves so it never repeats predictably.
function bgAt(t) {
  const speed = 1 + t / 25;
  const h = (t * 18 * speed + 40 * Math.sin(t * 0.37)) % 360;
  const s = 55 + 30 * Math.sin(t * 0.21 * speed);
  // Lightness swings through the middle quickly: at mid-tones no text color
  // can reach 7:1, so lingering there would be unfair rather than hard.
  const w = Math.sin(t * 0.45 * speed - Math.PI / 2); // starts dark, so white text passes at first
  const l = 50 + 44 * Math.sign(w) * Math.sqrt(Math.abs(w));
  return [((h % 360) + 360) % 360, s, Math.min(94, Math.max(6, l))];
}

export default function ContrastSurvival() {
  const { t, lang } = useLang();
  const es = lang === 'es';
  const [phase, setPhase] = useState('intro');
  const [L, setL] = useState(98);
  const [frame, setFrame] = useState({ t: 0, bg: [260, 60, 20], hp: 100 });
  const [best, setBest] = useState(() => { try { return +localStorage.getItem('contrastsurvival:best') || 0; } catch { return 0; } });
  const [copied, setCopied] = useState(false);
  const state = useRef({ t0: 0, last: 0, hp: 100, failing: 0 });
  const Lref = useRef(L);
  Lref.current = L;

  const start = () => {
    state.current = { t0: performance.now(), last: performance.now(), hp: 100, failing: 0 };
    setL(98); setFrame({ t: 0, bg: bgAt(0), hp: 100 }); setPhase('play');
    track('Contrast Survival start');
  };

  useEffect(() => {
    if (phase !== 'play') return undefined;
    let raf;
    const tick = now => {
      const st = state.current;
      const dt = Math.min(0.25, (now - st.last) / 1000);
      st.last = now;
      const time = (now - st.t0) / 1000;
      const bg = bgAt(time);
      const need = time >= AAA_AT ? 7 : 4.5;
      const ratio = contrastRatio(hslToRgb(bg[0], 12, Lref.current), hslToRgb(...bg));
      const ok = ratio >= need;
      st.hp = Math.min(100, Math.max(0, st.hp + (ok ? REGEN : -DRAIN) * dt));
      if (!ok) st.failing += dt;
      setFrame({ t: time, bg, hp: st.hp, ratio, need, ok });
      if (st.hp <= 0) { haptic([40, 60, 40]); setPhase('over'); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  // ↑ / ↓ move the text lightness, Shift for bigger steps.
  useEffect(() => {
    if (phase !== 'play') return undefined;
    const onKey = e => {
      const d = e.shiftKey ? 8 : 3;
      if (e.key === 'ArrowUp') { e.preventDefault(); setL(v => Math.min(100, v + d)); }
      if (e.key === 'ArrowDown') { e.preventDefault(); setL(v => Math.max(0, v - d)); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase]);

  const survived = +frame.t.toFixed(1);
  useEffect(() => {
    if (phase !== 'over') return;
    track('Contrast Survival finished', { seconds: survived });
    if (survived > best) { setBest(survived); try { localStorage.setItem('contrastsurvival:best', String(survived)); } catch { /* private mode */ } }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // On phones the intro text pushes the board down; bring it into view.
  useEffect(() => {
    if (phase !== 'play') return undefined;
    const id = setTimeout(() => glideTo(document.querySelector('.pf-play')), 450); // after the intro card exits
    return () => clearTimeout(id);
  }, [phase]);

  async function share() {
    const text = `Contrast Survival · ${survived}s ${t('of readable text', 'de texto legible')}${survived >= AAA_AT ? ' (AAA 💪)' : ''}\nfun.alevasquez.dev/contrast-survival`;
    try {
      if (navigator.share && window.matchMedia('(pointer: coarse)').matches) await navigator.share({ text });
      else { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1600); }
    } catch { /* cancelled */ }
  }

  const bgHex = hslToHex(...frame.bg);
  const fgHex = hslToHex(frame.bg[0], 12, L);

  return (
    <ToolPage id="contrast-survival" intro="The background keeps shifting color and lightness. Hold the text lightness so the pair keeps passing WCAG: AA at 4.5:1 first, AAA at 7:1 after twenty seconds. Survive as long as you can.">
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: EASE }} className="card pf-intro">
            <div className="pf-demo" aria-hidden="true">
              <span style={{ background: '#2B1B4A', color: '#F2EEF8' }}>Aa 13.9</span>
              <span style={{ background: '#C9B8EE', color: '#4A3E5C' }}>Aa 5.2</span>
              <span style={{ background: '#7A5BC8', color: '#B9A9E0' }}>Aa 2.0</span>
            </div>
            <h2 className="pf-h">{t('Keep the text readable', 'Mantén el texto legible')}</h2>
            <ul className="pf-rules">
              <li>{t('The background drifts. You control only the text lightness.', 'El fondo cambia. Tú solo controlas la luminosidad del texto.')}</li>
              <li>{t('Stay above 4.5:1. After 20 seconds the bar rises to AAA, 7:1.', 'Mantente sobre 4.5:1. A los 20 segundos la exigencia sube a AAA, 7:1.')}</li>
              <li>{t('Failing drains your health. Use the slider or ↑ / ↓.', 'Fallar te quita salud. Usa el control o ↑ / ↓.')}</li>
            </ul>
            <motion.button type="button" className="btn btn-primary pf-start" whileTap={{ scale: 0.96 }} onClick={start}>{t('Start the game', 'Empezar el juego')}</motion.button>
            {best > 0 && <p className="small muted" style={{ margin: 0 }}>{t(`Your best: ${best}s`, `Tu mejor tiempo: ${best} s`)}</p>}
          </motion.div>
        )}

        {phase === 'play' && (
          <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pf-play">
            <div className="pf-hud">
              <span className="mono">{frame.t.toFixed(1)}s</span>
              <span className="pf-timer" aria-label={t('Health', 'Salud')}><span style={{ width: `${frame.hp}%`, background: frame.hp < 35 ? 'var(--fail)' : 'var(--accent-grad-linear)' }} /></span>
              <span className={'cs-need' + (frame.need === 7 ? ' is-aaa' : '')}>{frame.need === 7 ? 'AAA 7:1' : 'AA 4.5:1'}</span>
            </div>
            <div className={'pf-card cs-card' + (frame.ok === false ? ' is-failing' : '')} style={{ background: bgHex }}>
              <p className="cs-text" style={{ color: fgHex }}>{es ? 'Esto tiene que seguir siendo legible.' : 'This has to stay readable.'}</p>
              <span className="cs-ratio mono" style={{ color: fgHex, borderColor: fgHex }}>{frame.ratio ? formatRatio(frame.ratio) : '–'}:1 {frame.ok ? '✓' : '✕'}</span>
              <AnimatePresence>{frame.t >= AAA_AT && frame.t < AAA_AT + 2 && (
                <motion.span className="cs-level" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>{t('Level up: AAA', 'Sube de nivel: AAA')}</motion.span>
              )}</AnimatePresence>
            </div>
            <div className="hh-slider">
              <div className="hh-slider-head"><span>{t('Text lightness', 'Luminosidad del texto')}</span><span className="mono">{Math.round(L)}%</span></div>
              <input type="range" min="0" max="100" step="1" value={L} aria-label={t('Text lightness', 'Luminosidad del texto')} onChange={e => setL(+e.target.value)}
                style={{ '--track': `linear-gradient(90deg, ${hslToHex(frame.bg[0], 12, 0)}, ${hslToHex(frame.bg[0], 12, 50)}, ${hslToHex(frame.bg[0], 12, 100)})`, '--thumb': fgHex }} />
            </div>
          </motion.div>
        )}

        {phase === 'over' && (
          <motion.div key="over" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }} className="stack">
            <Reveal className="card pf-over">
              <motion.div className="hh-total" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
                <span className="hh-grad">{survived}</span><span className="muted">s</span>
              </motion.div>
              <p className="muted" style={{ margin: 0 }}>
                {survived >= 45 ? t('AAA survivor. Your text would pass any audit.', 'Sobreviviente AAA. Tu texto pasaría cualquier auditoría.') : survived >= AAA_AT ? t('You made it to AAA. 7:1 is a whole different game.', 'Llegaste a AAA. 7:1 es otro juego.') : t('Mid-tones are the trap: neither light nor dark text passes on them.', 'Los tonos medios son la trampa: ni el texto claro ni el oscuro pasan sobre ellos.')}
              </p>
              <div className="pf-demo" aria-hidden="true"><span style={{ background: bgHex, color: fgHex }}>{t('Last frame', 'Último cuadro')} · {frame.ratio ? formatRatio(frame.ratio) : '–'}:1</span></div>
              <div className="chip-row" style={{ justifyContent: 'center' }}>
                <motion.button type="button" className="btn btn-primary" whileTap={{ scale: 0.96 }} onClick={share}>{copied ? t('Copied ✓', 'Copiado ✓') : t('Share score', 'Compartir puntaje')}</motion.button>
                <button type="button" className="btn btn-ghost" onClick={start}>{t('Play again', 'Jugar otra vez')}</button>
                <Link to={es ? '/es/verificador-de-contraste' : '/contrast-checker'} className="btn btn-ghost">{t('Open Contrast Checker', 'Abrir el verificador')}</Link>
              </div>
            </Reveal>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPage>
  );
}
