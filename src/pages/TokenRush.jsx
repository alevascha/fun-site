import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ToolPage from '../components/ToolPage';
import { Reveal, Segmented } from '../components/ui';
import { EASE } from '../lib/motion';
import { useLang } from '../i18n';
import { track } from '../lib/analytics';
import { haptic } from '../lib/haptics';
import { glideTo } from '../lib/smoothScroll';
import { GamePrimer, Lesson, PracticeBadge, PracticeButton } from '../components/GamePrimer';

/* Token Rush: a component is full of hard-coded values. Each round lights up
   one of them; pick the semantic token that should replace it. Several tokens
   share a value on purpose (space-md and radius-lg are both 16px), so you
   have to read what the value means, not just what it is. At the end, flip
   the theme: tokenized properties adapt, hard-coded leftovers break. */

const TOKENS = {
  'bg-canvas': { dark: '#0F172A', light: '#F1F5F9' },
  'bg-surface': { dark: '#1E293B', light: '#FFFFFF' },
  'bg-surface-raised': { dark: '#334155', light: '#E2E8F0' },
  'border-subtle': { dark: '#334155', light: '#CBD5E1' },
  'text-primary': { dark: '#F8FAFC', light: '#0F172A' },
  'text-secondary': { dark: '#94A3B8', light: '#475569' },
  'text-on-accent': { dark: '#FFFFFF', light: '#FFFFFF' },
  'accent': { dark: '#A855F7', light: '#7C3AED' },
  'space-xs': { dark: '4px', light: '4px' },
  'space-sm': { dark: '8px', light: '8px' },
  'space-md': { dark: '16px', light: '16px' },
  'space-lg': { dark: '24px', light: '24px' },
  'radius-sm': { dark: '8px', light: '8px' },
  'radius-md': { dark: '12px', light: '12px' },
  'radius-lg': { dark: '16px', light: '16px' },
  'font-size-sm': { dark: '14px', light: '14px' },
  'font-size-md': { dark: '16px', light: '16px' },
  'font-size-lg': { dark: '20px', light: '20px' },
};
// What each token is for, in plain words (used to explain answers).
const MEANING = {
  'bg-canvas': { en: 'the backdrop of the whole page', es: 'el fondo de toda la página' },
  'bg-surface': { en: 'cards and panels that sit on the page', es: 'tarjetas y paneles que van sobre la página' },
  'bg-surface-raised': { en: 'small things sitting on top of a card, like tags', es: 'cosas pequeñas sobre una tarjeta, como etiquetas' },
  'border-subtle': { en: 'quiet outlines around cards', es: 'contornos discretos alrededor de tarjetas' },
  'text-primary': { en: 'the main, most important text', es: 'el texto principal, el más importante' },
  'text-secondary': { en: 'supporting text that should be quieter', es: 'texto de apoyo que debe verse más suave' },
  'text-on-accent': { en: 'text placed on the brand color, like a button label', es: 'texto sobre el color de marca, como la etiqueta de un botón' },
  'accent': { en: 'the brand color for the main action', es: 'el color de marca para la acción principal' },
  'space-xs': { en: 'the tiniest gap', es: 'el espacio más pequeño' },
  'space-sm': { en: 'small gaps between related things', es: 'espacios pequeños entre cosas relacionadas' },
  'space-md': { en: 'padding inside cards (space, not corners)', es: 'el relleno dentro de tarjetas (espacio, no esquinas)' },
  'space-lg': { en: 'big gaps between sections', es: 'espacios grandes entre secciones' },
  'radius-sm': { en: 'rounded corners on small things like buttons', es: 'esquinas redondeadas de cosas pequeñas como botones' },
  'radius-md': { en: 'rounded corners on medium things like inputs', es: 'esquinas redondeadas de cosas medianas como campos' },
  'radius-lg': { en: 'rounded corners on big things like cards', es: 'esquinas redondeadas de cosas grandes como tarjetas' },
  'font-size-sm': { en: 'small body text', es: 'texto de cuerpo pequeño' },
  'font-size-md': { en: 'regular body text', es: 'texto de cuerpo normal' },
  'font-size-lg': { en: 'titles', es: 'títulos' },
};
const PRACTICE = 4;

const COLOR_TOKENS = Object.keys(TOKENS).filter(k => TOKENS[k].dark.startsWith('#'));
const SIZE_TOKENS = Object.keys(TOKENS).filter(k => !TOKENS[k].dark.startsWith('#'));

// Each slot is one property of the mock component, with the token it should use.
const SLOTS = [
  { id: 'page-bg', token: 'bg-canvas', en: 'Page background', es: 'Fondo de la página' },
  { id: 'card-bg', token: 'bg-surface', en: 'Card background', es: 'Fondo de la tarjeta' },
  { id: 'card-border', token: 'border-subtle', en: 'Card border', es: 'Borde de la tarjeta' },
  { id: 'card-radius', token: 'radius-lg', en: 'Card corner radius', es: 'Radio de la tarjeta' },
  { id: 'card-pad', token: 'space-md', en: 'Card padding', es: 'Padding de la tarjeta' },
  { id: 'title-color', token: 'text-primary', en: 'Title color', es: 'Color del título' },
  { id: 'title-size', token: 'font-size-lg', en: 'Title size', es: 'Tamaño del título' },
  { id: 'body-color', token: 'text-secondary', en: 'Body text color', es: 'Color del texto' },
  { id: 'body-size', token: 'font-size-sm', en: 'Body text size', es: 'Tamaño del texto' },
  { id: 'gap', token: 'space-sm', en: 'Gap between title and text', es: 'Espacio entre título y texto' },
  { id: 'chip-bg', token: 'bg-surface-raised', en: 'Tag background', es: 'Fondo de la etiqueta' },
  { id: 'btn-bg', token: 'accent', en: 'Button background', es: 'Fondo del botón' },
  { id: 'btn-text', token: 'text-on-accent', en: 'Button label color', es: 'Color del texto del botón' },
  { id: 'btn-radius', token: 'radius-sm', en: 'Button corner radius', es: 'Radio del botón' },
];
const SECONDS = 9;

const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);

// Tray: the right token, every token that shares its value (the traps), and filler of the same type.
function trayFor(slot) {
  const raw = TOKENS[slot.token].dark;
  const pool = raw.startsWith('#') ? COLOR_TOKENS : SIZE_TOKENS;
  const traps = pool.filter(k => k !== slot.token && TOKENS[k].dark === raw);
  const filler = shuffle(pool.filter(k => k !== slot.token && !traps.includes(k)));
  return shuffle([slot.token, ...traps, ...filler].slice(0, 6));
}

// Value of a slot: its token if tokenized, otherwise the hard-coded dark value.
const val = (slot, done, theme) => (done[slot] ? TOKENS[SLOTS.find(s => s.id === slot).token][theme] : TOKENS[SLOTS.find(s => s.id === slot).token].dark);

function Mock({ done = {}, theme = 'dark', active, es }) {
  const v = id => val(id, done, theme);
  const hi = id => (active === id ? ' tr-hi' : '');
  return (
    <div className={'tr-page' + hi('page-bg')} style={{ background: v('page-bg') }}>
      <div className={'tr-card' + hi('card-bg') + hi('card-border') + hi('card-radius') + hi('card-pad')} style={{ background: v('card-bg'), border: `1px solid ${v('card-border')}`, borderRadius: v('card-radius'), padding: v('card-pad'), gap: v('gap') }}>
        <span className={'tr-chip' + hi('chip-bg')} style={{ background: v('chip-bg'), color: v('title-color') }}>{es ? 'Nuevo' : 'New'}</span>
        <b className={hi('title-color') + hi('title-size')} style={{ color: v('title-color'), fontSize: v('title-size') }}>{es ? 'Reporte semanal' : 'Weekly report'}</b>
        <span className={hi('body-color') + hi('body-size') + hi('gap')} style={{ color: v('body-color'), fontSize: v('body-size') }}>{es ? 'Tus métricas de esta semana están listas.' : 'Your metrics for this week are ready.'}</span>
        <span className={'tr-btn' + hi('btn-bg') + hi('btn-text') + hi('btn-radius')} style={{ background: v('btn-bg'), color: v('btn-text'), borderRadius: v('btn-radius') }}>{es ? 'Ver reporte' : 'View report'}</span>
      </div>
    </div>
  );
}

export default function TokenRush() {
  const { t, lang } = useLang();
  const es = lang === 'es';
  const [phase, setPhase] = useState('intro');
  const [order, setOrder] = useState([]);
  const [i, setI] = useState(0);
  const [tray, setTray] = useState([]);
  const [done, setDone] = useState({});
  const [log, setLog] = useState([]);
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(SECONDS);
  const [fb, setFb] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [best, setBest] = useState(() => { try { return +localStorage.getItem('tokenrush:best') || 0; } catch { return 0; } });
  const [copied, setCopied] = useState(false);
  const t0 = useRef(0);
  // Practice: a few untimed rounds, each answer explained, waits for "Next".
  const [practice, setPractice] = useState(false);
  const [practiced, setPracticed] = useState(false);

  const start = (asPractice = false) => {
    setPractice(asPractice);
    const o = asPractice ? shuffle(SLOTS).slice(0, PRACTICE) : shuffle(SLOTS);
    setOrder(o); setI(0); setTray(trayFor(o[0])); setDone({}); setLog([]); setScore(0); setFb(null); setTheme('dark');
    t0.current = performance.now(); setPhase('play');
    track(asPractice ? 'Token Rush practice' : 'Token Rush start');
  };

  const slot = order[i];
  const next = useCallback(() => {
    setFb(null);
    if (i + 1 >= order.length) {
      if (practice) { setPracticed(true); setPhase('intro'); } else setPhase('over');
      return;
    }
    setI(n => n + 1); setTray(trayFor(order[i + 1])); t0.current = performance.now();
  }, [i, order, practice]);
  const choose = useCallback((token) => {
    if (!slot || fb) return;
    const ok = token === slot.token;
    const elapsed = (performance.now() - t0.current) / 1000;
    const pts = ok ? 100 + Math.round(Math.max(0, SECONDS - elapsed) * 10) : 0;
    setScore(s => s + pts);
    if (ok) setDone(d => ({ ...d, [slot.id]: true }));
    setLog(l => [...l, { ok, slot, said: token }]);
    setFb({ ok, said: token, timeout: token === null });
    haptic(ok ? 10 : [30, 40, 30]);
    if (!practice) setTimeout(next, ok ? 700 : 2600);
  }, [slot, fb, practice, next]);

  useEffect(() => {
    if (phase !== 'play' || fb || practice) return undefined;
    setLeft(SECONDS);
    const id = setInterval(() => {
      const s = SECONDS - (performance.now() - t0.current) / 1000;
      setLeft(Math.max(0, s));
      if (s <= 0) { clearInterval(id); choose(null); }
    }, 100);
    return () => clearInterval(id);
  }, [phase, i, fb, choose, practice]);

  useEffect(() => {
    if (phase !== 'play') return undefined;
    const onKey = e => {
      if (fb && practice && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); next(); return; }
      const n = +e.key; if (n >= 1 && n <= tray.length) choose(tray[n - 1]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, tray, choose, fb, practice, next]);

  const right = log.filter(x => x.ok).length;
  useEffect(() => {
    if (phase !== 'over' || practice) return;
    track('Token Rush finished', { score, right });
    if (score > best) { setBest(score); try { localStorage.setItem('tokenrush:best', String(score)); } catch { /* private mode */ } }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // On phones the intro text pushes the board down; bring it into view.
  useEffect(() => {
    if (phase !== 'play') return undefined;
    const id = setTimeout(() => glideTo(document.querySelector('.pf-play')), 450); // after the intro card exits
    return () => clearTimeout(id);
  }, [phase]);

  async function share() {
    const text = `Token Rush · ${right}/${SLOTS.length} ${t('values tokenized', 'valores tokenizados')} · ${score} pts\n${log.map(x => (x.ok ? '🟪' : '⬛')).join('')}\nfun.alevasquez.dev/token-rush`;
    try {
      if (navigator.share && window.matchMedia('(pointer: coarse)').matches) await navigator.share({ text });
      else { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1600); }
    } catch { /* cancelled */ }
  }

  const swatch = v => (v.startsWith('#') ? <span className="tr-sw" style={{ background: v }} /> : null);
  const misses = log.filter(x => !x.ok);
  const meaning = k => (es ? MEANING[k].es : MEANING[k].en);

  return (
    <ToolPage id="token-rush" intro="Products name their colors and sizes so one change updates every screen. Each round highlights a raw value in a card; pick the name (design token) it should use. Some names share a value, so think about what it’s for.">
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: EASE }} className="card pf-intro">
            <div className="tr-demo" aria-hidden="true"><code>#1E293B</code><span>→</span><code className="tr-token">bg-surface</code></div>
            <h2 className="pf-h">{t('Hard-coded values everywhere', 'Valores fijos por todas partes')}</h2>
            <GamePrimer
              plain={t('Big products name their colors and sizes (“card background”, “title size”) instead of repeating raw numbers everywhere. Then one change, like switching to light mode, updates every screen. You match each raw value to the right name.', 'Los productos grandes les ponen nombre a sus colores y tamaños (“fondo de tarjeta”, “tamaño de título”) en vez de repetir números sueltos por todas partes. Así un solo cambio, como pasar a modo claro, actualiza todas las pantallas. Tú emparejas cada valor con el nombre correcto.')}
              terms={[
                [t('Design token', 'Design token'), t('A named value, like bg-surface, used instead of a raw value like #1E293B.', 'Un valor con nombre, como bg-surface, que se usa en lugar de un valor suelto como #1E293B.')],
                [t('Hard-coded', 'Valor fijo'), t('A raw number typed straight into the design. It won’t change when the theme does.', 'Un número escrito directamente en el diseño. No cambia cuando cambia el tema.')],
                [t('The trap', 'La trampa'), t('Two tokens can share a value (space-md and radius-lg are both 16px). Pick by meaning: spacing or corners?', 'Dos tokens pueden compartir valor (space-md y radius-lg miden 16px). Elige por significado: ¿espacio o esquinas?')],
              ]}
            />
            {practiced && <Lesson tone="ok">{t(`Practice done. The real game has all ${SLOTS.length} properties and a timer.`, `Práctica lista. El juego real tiene las ${SLOTS.length} propiedades y un temporizador.`)}</Lesson>}
            <ul className="pf-rules">
              <li>{t(`${SLOTS.length} rounds. A property lights up with its raw value.`, `${SLOTS.length} rondas. Se ilumina una propiedad con su valor fijo.`)}</li>
              <li>{t('Pick the semantic token that should replace it. Same value ≠ same token.', 'Elige el token semántico que debería reemplazarlo. Mismo valor ≠ mismo token.')}</li>
              <li>{t('Faster answers score more. At the end, flip the theme and see what breaks.', 'Responder rápido suma más. Al final cambia el tema y mira qué se rompe.')}</li>
            </ul>
            <motion.button type="button" className="btn btn-primary pf-start" whileTap={{ scale: 0.96 }} onClick={() => start(false)}>{t('Start the game', 'Empezar el juego')}</motion.button>
            {!practiced && <PracticeButton onClick={() => start(true)} />}
            {best > 0 && <p className="small muted" style={{ margin: 0 }}>{t(`Your best: ${best} pts`, `Tu mejor puntaje: ${best} pts`)}</p>}
          </motion.div>
        )}

        {phase === 'play' && slot && (
          <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pf-play">
            {practice && <PracticeBadge onExit={() => start(false)} />}
            <div className="pf-hud">
              <span className="mono">{i + 1}<span className="muted">/{order.length}</span></span>
              <span className="pf-timer" aria-hidden="true"><span style={{ width: `${practice ? 100 : (left / SECONDS) * 100}%`, background: !practice && left < 3 ? 'var(--fail)' : 'var(--accent-grad-linear)' }} /></span>
              <span className="mono">{score}</span>
            </div>
            <Mock done={done} active={slot.id} es={es} />
            <div className="tr-ask">
              <span>{es ? slot.es : slot.en}</span>
              <code>{swatch(TOKENS[slot.token].dark)}{TOKENS[slot.token].dark}</code>
            </div>
            <div className="tr-tray">
              {tray.map((k, n) => (
                <motion.button key={k} type="button" whileTap={{ scale: 0.95 }} disabled={!!fb} onClick={() => choose(k)}
                  className={'tr-tok' + (fb && k === slot.token ? ' is-right' : '') + (fb && !fb.ok && k === fb.said ? ' is-wrong' : '')}>
                  <span className="sp-key" aria-hidden="true">{n + 1}</span>
                  <span className="tr-name">{k}</span>
                  <span className="tr-val">{swatch(TOKENS[k].dark)}{TOKENS[k].dark}</span>
                </motion.button>
              ))}
            </div>
            {fb && (!fb.ok || practice) && (
              <Lesson tone={fb.ok ? 'ok' : 'bad'}>
                {fb.ok
                  ? <><code>{slot.token}</code>{t(' is for ', ' es para ')}{meaning(slot.token)}{t('. Correct.', '. Correcto.')}</>
                  : <>{fb.timeout ? t('Time! ', '¡Tiempo! ') : ''}{t('It should be ', 'Debía ser ')}<code>{slot.token}</code>{t(', for ', ', para ')}{meaning(slot.token)}.{fb.said && <>{' '}<code>{fb.said}</code>{t(' is for ', ' es para ')}{meaning(fb.said)}.</>}</>}
              </Lesson>
            )}
            {fb && practice && <motion.button type="button" className="btn btn-primary hh-cta" whileTap={{ scale: 0.97 }} onClick={next}>{i + 1 >= order.length ? t('Finish practice', 'Terminar práctica') : t('Next →', 'Siguiente →')}</motion.button>}
          </motion.div>
        )}

        {phase === 'over' && (
          <motion.div key="over" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }} className="stack">
            <Reveal className="card pf-over">
              <motion.div className="hh-total" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
                <span className="hh-grad">{right}</span><span className="muted">/{SLOTS.length}</span>
              </motion.div>
              <p className="muted" style={{ margin: 0 }}>{score} pts · {right === SLOTS.length ? t('Fully tokenized. This component themes itself.', 'Totalmente tokenizado. Este componente se adapta solo al tema.') : t('Now flip the theme: anything you missed is still hard-coded.', 'Ahora cambia el tema: lo que fallaste sigue con valores fijos.')}</p>
              <Segmented value={theme} onChange={setTheme} options={[{ value: 'dark', label: t('Dark', 'Oscuro') }, { value: 'light', label: t('Light', 'Claro') }]} label={t('Theme', 'Tema')} />
              <div style={{ width: '100%', maxWidth: 420 }}><Mock done={done} theme={theme} es={es} /></div>
              <div className="chip-row" style={{ justifyContent: 'center' }}>
                <motion.button type="button" className="btn btn-primary" whileTap={{ scale: 0.96 }} onClick={share}>{copied ? t('Copied ✓', 'Copiado ✓') : t('Share score', 'Compartir puntaje')}</motion.button>
                <button type="button" className="btn btn-ghost" onClick={() => start(false)}>{t('Play again', 'Jugar otra vez')}</button>
                <Link to={es ? '/es/convertidor-de-tokens' : '/token-converter'} className="btn btn-ghost">{t('Open Token Converter', 'Abrir el convertidor')}</Link>
              </div>
            </Reveal>
            {misses.length > 0 && (
              <Reveal className="card">
                <h2 className="eyebrow">{t('Still hard-coded', 'Todavía con valores fijos')}</h2>
                <ul className="oe-list">{misses.map((x, k) => <li key={k} title={meaning(x.slot.token)}><span>{es ? x.slot.es : x.slot.en}</span><code>{x.slot.token}</code></li>)}</ul>
              </Reveal>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPage>
  );
}
