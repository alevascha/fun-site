import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ToolPage from '../components/ToolPage';
import { Reveal } from '../components/ui';
import { EASE } from '../lib/motion';
import { useLang } from '../i18n';
import { track } from '../lib/analytics';
import { haptic } from '../lib/haptics';
import { glideTo } from '../lib/smoothScroll';

/* State Panic: components fall down the screen with something happening to
   them ("keyboard user tabs in", "the server is saving"). Pick the UI state
   that event calls for before the component hits the floor. Right answers
   morph the component into that state; three misses and it's over. It gets
   faster every few components. */

const STATES = [
  { id: 'hover', en: 'Hover', es: 'Hover', key: '1' },
  { id: 'focus', en: 'Focus-visible', es: 'Focus-visible', key: '2' },
  { id: 'active', en: 'Pressed', es: 'Presionado', key: '3' },
  { id: 'loading', en: 'Loading', es: 'Cargando', key: '4' },
  { id: 'error', en: 'Error', es: 'Error', key: '5' },
  { id: 'disabled', en: 'Disabled', es: 'Deshabilitado', key: '6' },
];

const EVENTS = [
  { state: 'hover', en: 'The mouse pointer rests on it', es: 'El puntero del mouse se posa encima' },
  { state: 'hover', en: 'Cursor glides over it, no click yet', es: 'El cursor pasa por encima, sin clic todavía' },
  { state: 'focus', en: 'A keyboard user tabs onto it', es: 'Alguien llega con la tecla Tab' },
  { state: 'focus', en: 'Screen reader user moves here with the keyboard', es: 'Un usuario de lector de pantalla llega con el teclado' },
  { state: 'active', en: 'A finger is pressing down right now', es: 'Un dedo lo está presionando justo ahora' },
  { state: 'active', en: 'Mouse button is held down on it', es: 'El botón del mouse está presionado encima' },
  { state: 'loading', en: 'Request sent, waiting for the server', es: 'Solicitud enviada, esperando al servidor' },
  { state: 'loading', en: 'Saving your changes…', es: 'Guardando tus cambios…' },
  { state: 'error', en: 'Email typed as “hola@”', es: 'Correo escrito como “hola@”' },
  { state: 'error', en: 'The server answered 500', es: 'El servidor respondió 500' },
  { state: 'disabled', en: 'Form isn’t complete, can’t submit yet', es: 'El formulario no está completo, aún no se puede enviar' },
  { state: 'disabled', en: 'User doesn’t have permission for this', es: 'El usuario no tiene permiso para esto' },
];

const KINDS = ['button', 'input', 'toggle', 'card'];
const LIVES = 3;
const STAGE = 230; // px the component falls
const fallFor = n => Math.max(2.6, 7 - n * 0.28); // seconds

const pick = a => a[Math.floor(Math.random() * a.length)];
const makeItem = n => ({ id: n, kind: pick(KINDS), event: pick(EVENTS) });

function Component({ kind, state, es }) {
  const cls = `sp-comp sp-${kind} ${state ? 'is-' + state : ''}`;
  if (kind === 'input') return (
    <span className={cls}>
      <span className="sp-input-label">{es ? 'Correo' : 'Email'}</span>
      <span className="sp-input-field">{state === 'error' ? 'hola@' : state === 'loading' ? <span className="sp-spin" /> : 'ana@studio.com'}</span>
      {state === 'error' && <span className="sp-msg">{es ? 'Revisa el correo' : 'Check the email'}</span>}
    </span>
  );
  if (kind === 'toggle') return (
    <span className={cls}><span className="sp-knob">{state === 'loading' && <span className="sp-spin" />}</span><span>{es ? 'Notificaciones' : 'Notifications'}</span></span>
  );
  if (kind === 'card') return (
    <span className={cls}><b>{es ? 'Plan Pro' : 'Pro plan'}</b><span className="small">{state === 'error' ? (es ? 'No se pudo cargar' : 'Couldn’t load') : '$12 / mo'}</span>{state === 'loading' && <span className="sp-spin" />}</span>
  );
  return <span className={cls}>{state === 'loading' ? <span className="sp-spin" /> : null}{state === 'error' ? (es ? 'Reintentar' : 'Retry') : (es ? 'Guardar' : 'Save')}</span>;
}

export default function StatePanic() {
  const { t, lang } = useLang();
  const es = lang === 'es';
  const [phase, setPhase] = useState('intro');
  const [item, setItem] = useState(null);
  const [progress, setProgress] = useState(0);
  const [resolved, setResolved] = useState(null); // { ok, state }
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [log, setLog] = useState([]);
  const [best, setBest] = useState(() => { try { return +localStorage.getItem('statepanic:best') || 0; } catch { return 0; } });
  const [copied, setCopied] = useState(false);
  const t0 = useRef(0);
  const n = useRef(0);

  const spawn = useCallback(() => {
    n.current += 1;
    setItem(makeItem(n.current)); setProgress(0); setResolved(null);
    t0.current = performance.now();
  }, []);

  const start = () => {
    n.current = 0; setScore(0); setLives(LIVES); setLog([]); setPhase('play'); spawn();
    track('State Panic start');
  };

  const settle = useCallback((said) => {
    if (!item || resolved) return;
    const ok = said === item.event.state;
    setResolved({ ok, state: ok ? said : item.event.state, timeout: said === null });
    setLog(l => [...l, { ok, event: item.event, said }]);
    haptic(ok ? 10 : [30, 40, 30]);
    if (ok) setScore(s => s + 1);
    const livesLeft = ok ? lives : lives - 1;
    if (!ok) setLives(livesLeft);
    setTimeout(() => { if (livesLeft <= 0) setPhase('over'); else spawn(); }, ok ? 650 : 1300);
  }, [item, resolved, lives, spawn]);

  // Falling: progress 0 → 1 over the current fall time; the floor is a miss.
  useEffect(() => {
    if (phase !== 'play' || !item || resolved) return undefined;
    let raf;
    const dur = fallFor(n.current) * 1000;
    const tick = () => {
      const p = (performance.now() - t0.current) / dur;
      if (p >= 1) { setProgress(1); settle(null); return; }
      setProgress(p); raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, item, resolved, settle]);

  useEffect(() => {
    if (phase !== 'play') return undefined;
    const onKey = e => { const s = STATES.find(x => x.key === e.key); if (s) settle(s.id); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, settle]);

  useEffect(() => {
    if (phase !== 'over') return;
    track('State Panic finished', { score });
    if (score > best) { setBest(score); try { localStorage.setItem('statepanic:best', String(score)); } catch { /* private mode */ } }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // On phones the intro text pushes the board down; bring it into view.
  useEffect(() => {
    if (phase !== 'play') return undefined;
    const id = setTimeout(() => glideTo(document.querySelector('.pf-play')), 450); // after the intro card exits
    return () => clearTimeout(id);
  }, [phase]);

  async function share() {
    const text = `State Panic · ${score} ${t('components saved', 'componentes salvados')}\n${log.map(x => (x.ok ? '🟩' : '💥')).join('')}\nfun.alevasquez.dev/state-panic`;
    try {
      if (navigator.share && window.matchMedia('(pointer: coarse)').matches) await navigator.share({ text });
      else { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1600); }
    } catch { /* cancelled */ }
  }

  const stateName = id => { const s = STATES.find(x => x.id === id); return es ? s.es : s.en; };
  const misses = log.filter(x => !x.ok);

  return (
    <ToolPage id="state-panic" intro="Components fall with something happening to them. Pick the right UI state (hover, focus, pressed, loading, error or disabled) before they hit the floor. Three misses and it’s over.">
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: EASE }} className="card pf-intro">
            <div className="sp-demo" aria-hidden="true"><Component kind="button" state="hover" es={es} /><Component kind="button" state="loading" es={es} /><Component kind="button" state="error" es={es} /></div>
            <h2 className="pf-h">{t('Every component has six lives', 'Cada componente tiene seis vidas')}</h2>
            <ul className="pf-rules">
              <li>{t('A component falls with an event attached. Pick the state it needs.', 'Cae un componente con un evento. Elige el estado que necesita.')}</li>
              <li>{t('Hit the floor or pick wrong and you lose a life. You have three.', 'Si toca el piso o eliges mal, pierdes una vida. Tienes tres.')}</li>
              <li>{t('Keys 1–6 work too. It speeds up as you go.', 'También funcionan las teclas 1–6. Cada vez va más rápido.')}</li>
            </ul>
            <motion.button type="button" className="btn btn-primary pf-start" whileTap={{ scale: 0.96 }} onClick={start}>{t('Start the game', 'Empezar el juego')}</motion.button>
            {best > 0 && <p className="small muted" style={{ margin: 0 }}>{t(`Your best: ${best}`, `Tu mejor puntaje: ${best}`)}</p>}
          </motion.div>
        )}

        {phase === 'play' && item && (
          <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pf-play">
            <div className="pf-hud">
              <span className="mono" aria-label={t(`${lives} lives`, `${lives} vidas`)}>{'❤️'.repeat(lives)}<span className="sp-lost">{'🖤'.repeat(LIVES - lives)}</span></span>
              <span className="muted small" style={{ textAlign: 'center' }}>{t('Speed', 'Velocidad')} ×{(7 / fallFor(n.current)).toFixed(1)}</span>
              <span className="mono">{score} ✓</span>
            </div>
            <div className="sp-stage" style={{ height: STAGE + 110 }}>
              <div className="sp-faller" style={{ transform: `translateY(${progress * STAGE}px)` }}>
                <span className="sp-event">{es ? item.event.es : item.event.en}</span>
                <motion.div key={item.id + (resolved ? resolved.state : '')} initial={resolved ? { scale: 0.9 } : false} animate={resolved && !resolved.ok ? { x: [0, -8, 8, -6, 6, 0] } : { scale: 1 }} transition={{ duration: 0.4 }}>
                  <Component kind={item.kind} state={resolved ? resolved.state : null} es={es} />
                </motion.div>
              </div>
              <div className="sp-floor" />
              <AnimatePresence>
                {resolved && (
                  <motion.div className={'pf-feedback ' + (resolved.ok ? 'is-ok' : 'is-bad')} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} role="status">
                    <strong>{resolved.ok ? t('Nice', 'Bien') : resolved.timeout ? t('Overflow!', '¡Desbordado!') : t('Nope', 'No')}</strong>
                    {!resolved.ok && <span className="small">{t('It needed: ', 'Necesitaba: ')}<b>{stateName(resolved.state)}</b></span>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="sp-buttons">
              {STATES.map(s => (
                <motion.button key={s.id} type="button" className="sp-btn" whileTap={{ scale: 0.94 }} disabled={!!resolved} onClick={() => settle(s.id)}>
                  <span className="sp-key" aria-hidden="true">{s.key}</span>{es ? s.es : s.en}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'over' && (
          <motion.div key="over" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }} className="stack">
            <Reveal className="card pf-over">
              <motion.div className="hh-total" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
                <span className="hh-grad">{score}</span>
              </motion.div>
              <p className="muted" style={{ margin: 0 }}>
                {score >= 25 ? t('State machine in human form.', 'Una máquina de estados con forma humana.') : score >= 12 ? t('Solid. Focus vs. hover is where most people slip.', 'Sólido. Focus vs. hover es donde casi todos se equivocan.') : t('Every state you skip is a bug report waiting to happen.', 'Cada estado que se omite es un reporte de bug esperando.')}
              </p>
              <div className="pf-strip" aria-hidden="true">{log.map((x, k) => <span key={k} className={x.ok ? 'is-ok' : 'is-bad'} />)}</div>
              <div className="chip-row" style={{ justifyContent: 'center' }}>
                <motion.button type="button" className="btn btn-primary" whileTap={{ scale: 0.96 }} onClick={share}>{copied ? t('Copied ✓', 'Copiado ✓') : t('Share score', 'Compartir puntaje')}</motion.button>
                <button type="button" className="btn btn-ghost" onClick={start}>{t('Play again', 'Jugar otra vez')}</button>
              </div>
            </Reveal>
            {misses.length > 0 && (
              <Reveal className="card">
                <h2 className="eyebrow">{t('The ones that got away', 'Los que se escaparon')}</h2>
                <ul className="oe-list">
                  {misses.map((x, k) => <li key={k}><span>{es ? x.event.es : x.event.en}</span><span className="mono">{stateName(x.event.state)}</span></li>)}
                </ul>
              </Reveal>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPage>
  );
}
