import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ToolPage from '../components/ToolPage';
import { Reveal } from '../components/ui';
import { EASE } from '../lib/motion';
import { useLang } from '../i18n';
import { track } from '../lib/analytics';
import { haptic } from '../lib/haptics';
import { glideTo } from '../lib/smoothScroll';
import { GamePrimer, Lesson, PracticeBadge, PracticeButton } from '../components/GamePrimer';

/* State Panic: components fall down the screen with something happening to
   them ("keyboard user tabs in", "the server is saving"). Pick the UI state
   that event calls for before the component hits the floor. Right answers
   morph the component into that state; three misses and it's over. It gets
   faster every few components. */

// `why` is the plain-language meaning, used in the glossary and to explain misses.
const STATES = [
  { id: 'hover', en: 'Hover', es: 'Hover', key: '1', why: { en: 'a mouse pointer is resting on it, but nothing has been clicked yet.', es: 'el puntero del mouse está encima, pero todavía no se hizo clic.' } },
  { id: 'focus', en: 'Focus-visible', es: 'Focus-visible', key: '2', why: { en: 'someone reached it with the keyboard (Tab key), so it needs a visible outline to show where they are.', es: 'alguien llegó con el teclado (tecla Tab), así que necesita un contorno visible que muestre dónde está.' } },
  { id: 'active', en: 'Pressed', es: 'Presionado', key: '3', why: { en: 'a finger or mouse button is pushing it down at this very moment.', es: 'un dedo o el botón del mouse lo está presionando en este mismo momento.' } },
  { id: 'loading', en: 'Loading', es: 'Cargando', key: '4', why: { en: 'the app is waiting for something (usually the server), so it shows a spinner.', es: 'la app está esperando algo (normalmente al servidor), así que muestra un indicador de carga.' } },
  { id: 'error', en: 'Error', es: 'Error', key: '5', why: { en: 'something went wrong (bad input or a failed request) and the user needs to know.', es: 'algo salió mal (un dato incorrecto o una solicitud fallida) y el usuario tiene que saberlo.' } },
  { id: 'disabled', en: 'Disabled', es: 'Deshabilitado', key: '6', why: { en: 'it can’t be used right now, for example because a form isn’t finished.', es: 'no se puede usar por ahora, por ejemplo porque un formulario no está completo.' } },
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
// Practice: one event per state, in random order, so every state gets introduced once.
const practiceItems = () => STATES.map(s => pick(EVENTS.filter(e => e.state === s.id)))
  .map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0])
  .map(([, event], k) => ({ id: 'p' + k, kind: pick(KINDS), event }));

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
  // Practice: components don't fall, no lives are lost, every answer is explained.
  const [practice, setPractice] = useState(false);
  const [practiced, setPracticed] = useState(false);
  const queue = useRef([]);

  const spawn = useCallback(() => {
    n.current += 1;
    setItem(queue.current.length ? queue.current.shift() : makeItem(n.current)); setProgress(0); setResolved(null);
    t0.current = performance.now();
  }, []);

  const start = (asPractice = false) => {
    setPractice(asPractice);
    queue.current = asPractice ? practiceItems() : [];
    n.current = 0; setScore(0); setLives(LIVES); setLog([]); setPhase('play'); spawn();
    track(asPractice ? 'State Panic practice' : 'State Panic start');
  };

  const nextPractice = useCallback(() => {
    if (queue.current.length) spawn();
    else { setPracticed(true); setPhase('intro'); }
  }, [spawn]);

  const settle = useCallback((said) => {
    if (!item || resolved) return;
    const ok = said === item.event.state;
    setResolved({ ok, state: ok ? said : item.event.state, timeout: said === null });
    setLog(l => [...l, { ok, event: item.event, said }]);
    haptic(ok ? 10 : [30, 40, 30]);
    if (ok) setScore(s => s + 1);
    if (practice) return; // waits for "Next"
    const livesLeft = ok ? lives : lives - 1;
    if (!ok) setLives(livesLeft);
    setTimeout(() => { if (livesLeft <= 0) setPhase('over'); else spawn(); }, ok ? 650 : 2200);
  }, [item, resolved, lives, spawn, practice]);

  // Falling: progress 0 → 1 over the current fall time; the floor is a miss.
  useEffect(() => {
    if (phase !== 'play' || !item || resolved || practice) return undefined;
    let raf;
    const dur = fallFor(n.current) * 1000;
    const tick = () => {
      const p = (performance.now() - t0.current) / dur;
      if (p >= 1) { setProgress(1); settle(null); return; }
      setProgress(p); raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, item, resolved, settle, practice]);

  useEffect(() => {
    if (phase !== 'play') return undefined;
    const onKey = e => {
      if (resolved && practice && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); nextPractice(); return; }
      const s = STATES.find(x => x.key === e.key); if (s) settle(s.id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, settle, resolved, practice, nextPractice]);

  useEffect(() => {
    if (phase !== 'over' || practice) return;
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
  const stateWhy = id => { const s = STATES.find(x => x.id === id); return es ? s.why.es : s.why.en; };
  const misses = log.filter(x => !x.ok);

  return (
    <ToolPage id="state-panic" intro="Buttons and fields change how they look depending on what’s happening: someone points at them, presses them, or the app is loading. Read the situation and pick the right look before the component hits the floor.">
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: EASE }} className="card pf-intro">
            <div className="sp-demo" aria-hidden="true"><Component kind="button" state="hover" es={es} /><Component kind="button" state="loading" es={es} /><Component kind="button" state="error" es={es} /></div>
            <h2 className="pf-h">{t('Every component has six lives', 'Cada componente tiene seis vidas')}</h2>
            <GamePrimer
              plain={t('Buttons and fields look different depending on what is happening to them: being pointed at, pressed, loading, broken. You read a short situation and pick how the component should look.', 'Los botones y campos se ven distintos según lo que les pasa: el puntero encima, presionados, cargando, con error. Lees una situación corta y eliges cómo debería verse el componente.')}
              terms={STATES.map(s => [es ? s.es : s.en, (es ? 'Cuando ' : 'When ') + stateWhy(s.id)])}
            />
            {practiced && <Lesson tone="ok">{t('Practice done. In the real game components fall and speed up, and you have three lives.', 'Práctica lista. En el juego real los componentes caen cada vez más rápido y tienes tres vidas.')}</Lesson>}
            <ul className="pf-rules">
              <li>{t('A component falls with an event attached. Pick the state it needs.', 'Cae un componente con un evento. Elige el estado que necesita.')}</li>
              <li>{t('Hit the floor or pick wrong and you lose a life. You have three.', 'Si toca el piso o eliges mal, pierdes una vida. Tienes tres.')}</li>
              <li>{t('Keys 1–6 work too. It speeds up as you go.', 'También funcionan las teclas 1–6. Cada vez va más rápido.')}</li>
            </ul>
            <motion.button type="button" className="btn btn-primary pf-start" whileTap={{ scale: 0.96 }} onClick={() => start(false)}>{t('Start the game', 'Empezar el juego')}</motion.button>
            {!practiced && <PracticeButton onClick={() => start(true)} />}
            {best > 0 && <p className="small muted" style={{ margin: 0 }}>{t(`Your best: ${best}`, `Tu mejor puntaje: ${best}`)}</p>}
          </motion.div>
        )}

        {phase === 'play' && item && (
          <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pf-play">
            {practice && <PracticeBadge onExit={() => start(false)} />}
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
                    {!resolved.ok && <span className="small">{t('It needed: ', 'Necesitaba: ')}<b>{stateName(resolved.state)}</b>{!practice && <>{' - '}{stateWhy(resolved.state)}</>}</span>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {resolved && practice && (
              <>
                <Lesson tone={resolved.ok ? 'ok' : 'bad'}>
                  <b>{stateName(resolved.state)}</b>{t(': use it when ', ': se usa cuando ')}{stateWhy(resolved.state)}
                </Lesson>
                <motion.button type="button" className="btn btn-primary hh-cta" whileTap={{ scale: 0.97 }} onClick={nextPractice}>{queue.current.length ? t('Next →', 'Siguiente →') : t('Finish practice', 'Terminar práctica')}</motion.button>
              </>
            )}
            {!(resolved && practice) && <div className="sp-buttons">
              {STATES.map(s => (
                <motion.button key={s.id} type="button" className="sp-btn" whileTap={{ scale: 0.94 }} disabled={!!resolved} onClick={() => settle(s.id)}>
                  <span className="sp-key" aria-hidden="true">{s.key}</span>{es ? s.es : s.en}
                </motion.button>
              ))}
            </div>}
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
                <button type="button" className="btn btn-ghost" onClick={() => start(false)}>{t('Play again', 'Jugar otra vez')}</button>
              </div>
            </Reveal>
            {misses.length > 0 && (
              <Reveal className="card">
                <h2 className="eyebrow">{t('The ones that got away', 'Los que se escaparon')}</h2>
                <ul className="oe-list">
                  {misses.map((x, k) => <li key={k} title={stateWhy(x.event.state)}><span>{es ? x.event.es : x.event.en}</span><span className="mono">{stateName(x.event.state)}</span></li>)}
                </ul>
              </Reveal>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPage>
  );
}
