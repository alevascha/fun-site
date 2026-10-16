import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ToolPage from '../components/ToolPage';
import { Reveal } from '../components/ui';
import { EASE } from '../lib/motion';
import { useLang } from '../i18n';
import { track } from '../lib/analytics';
import { haptic } from '../lib/haptics';
import { glideTo } from '../lib/smoothScroll';
import './TabOrder.css';

/* Tab Order: five small screens. Tap their interactive elements in the
   order the Tab key should visit them (WCAG 2.4.3 Focus Order: the order
   has to follow the meaning, which on most screens is the reading order).
   Scored by the longest run of the right sequence you kept, so one swapped
   pair costs a little and a scrambled order costs a lot. */

const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);

// Longest common subsequence of two id lists.
function lcs(a, b) {
  const m = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let x = 1; x <= a.length; x++) for (let y = 1; y <= b.length; y++) m[x][y] = a[x - 1] === b[y - 1] ? m[x - 1][y - 1] + 1 : Math.max(m[x - 1][y], m[x][y - 1]);
  return m[a.length][b.length];
}

const SCREENS = [
  {
    id: 'login',
    title: ['Sign-in form', 'Formulario de acceso'],
    items: {
      email: { kind: 'input', label: ['Email', 'Correo'] },
      password: { kind: 'input', label: ['Password', 'Contraseña'] },
      forgot: { kind: 'link', label: ['Forgot password?', '¿Olvidaste tu contraseña?'] },
      signin: { kind: 'button', label: ['Sign in', 'Entrar'] },
      create: { kind: 'link', label: ['Create an account', 'Crear una cuenta'] },
    },
    order: ['email', 'password', 'forgot', 'signin', 'create'],
    lesson: ['Focus follows the reading order: the fields top to bottom, then the action. The “Forgot password?” link sits right under the password, so it comes before Sign in.', 'El foco sigue el orden de lectura: los campos de arriba abajo y luego la acción. El enlace “¿Olvidaste tu contraseña?” está justo debajo de la contraseña, así que va antes de Entrar.'],
    render: (B, es) => (
      <div className="to-col">
        <strong className="to-h">{es ? 'Inicia sesión' : 'Sign in'}</strong>
        {B('email')}
        {B('password')}
        <div className="to-end">{B('forgot')}</div>
        {B('signin')}
        <div className="to-center">{B('create')}</div>
      </div>
    ),
  },
  {
    id: 'header',
    title: ['Site header', 'Encabezado del sitio'],
    items: {
      skip: { kind: 'skip', label: ['Skip to content', 'Saltar al contenido'] },
      logo: { kind: 'logo', label: ['Acme', 'Acme'] },
      work: { kind: 'nav', label: ['Work', 'Trabajo'] },
      about: { kind: 'nav', label: ['About', 'Acerca de'] },
      blog: { kind: 'nav', label: ['Blog', 'Blog'] },
      search: { kind: 'icon', label: ['Search', 'Buscar'] },
      cta: { kind: 'button', label: ['Contact', 'Contacto'] },
    },
    order: ['skip', 'logo', 'work', 'about', 'blog', 'search', 'cta'],
    lesson: ['A skip link has to be the very first stop, so keyboard users can jump past the navigation on every page. After it, left to right.', 'El enlace para saltar tiene que ser la primera parada, para que quien usa teclado pueda saltarse la navegación en cada página. Después, de izquierda a derecha.'],
    render: B => (
      <div className="to-col">
        <div>{B('skip')}</div>
        <div className="to-bar">
          {B('logo')}
          <div className="to-row">{B('work')}{B('about')}{B('blog')}</div>
          <div className="to-row">{B('search')}{B('cta')}</div>
        </div>
      </div>
    ),
  },
  {
    id: 'checkout',
    title: ['Checkout', 'Pago'],
    items: {
      back: { kind: 'link', label: ['← Back to cart', '← Volver al carrito'] },
      card: { kind: 'input', label: ['Card number', 'Número de tarjeta'] },
      expiry: { kind: 'input', label: ['Expiry', 'Vencimiento'] },
      cvc: { kind: 'input', label: ['CVC', 'CVC'] },
      name: { kind: 'input', label: ['Name on card', 'Nombre en la tarjeta'] },
      save: { kind: 'check', label: ['Save this card', 'Guardar esta tarjeta'] },
      pay: { kind: 'button', label: ['Pay $48', 'Pagar $48'] },
    },
    order: ['back', 'card', 'expiry', 'cvc', 'name', 'save', 'pay'],
    lesson: ['Rows read left to right before moving down: Expiry, then CVC, then the next row. The back link at the top comes first even though it is small.', 'Las filas se leen de izquierda a derecha antes de bajar: Vencimiento, luego CVC y después la siguiente fila. El enlace de volver va primero aunque sea pequeño.'],
    render: B => (
      <div className="to-col">
        <div>{B('back')}</div>
        {B('card')}
        <div className="to-split">{B('expiry')}{B('cvc')}</div>
        {B('name')}
        {B('save')}
        {B('pay')}
      </div>
    ),
  },
  {
    id: 'grid',
    title: ['Product grid', 'Grilla de productos'],
    items: {
      all: { kind: 'link', label: ['View all', 'Ver todo'] },
      mug: { kind: 'product', label: ['Mug', 'Taza'] },
      tee: { kind: 'product', label: ['T-shirt', 'Camiseta'] },
      cap: { kind: 'product', label: ['Cap', 'Gorra'] },
      bag: { kind: 'product', label: ['Tote bag', 'Bolso'] },
    },
    order: ['all', 'mug', 'tee', 'cap', 'bag'],
    lesson: ['Grids read in rows, like text: left to right, then down. Reordering with CSS (order, row-reverse, grid-auto-flow: column) changes what people see but not where focus goes, which fails WCAG 2.4.3.', 'Las grillas se leen por filas, como un texto: de izquierda a derecha y luego hacia abajo. Reordenar con CSS (order, row-reverse, grid-auto-flow: column) cambia lo que se ve pero no a dónde va el foco, y eso falla WCAG 2.4.3.'],
    render: (B, es) => (
      <div className="to-col">
        <div className="to-bar"><strong className="to-h">{es ? 'Más vendidos' : 'Best sellers'}</strong>{B('all')}</div>
        <div className="to-grid">{B('mug')}{B('tee')}{B('cap')}{B('bag')}</div>
      </div>
    ),
  },
  {
    id: 'settings',
    title: ['Settings page', 'Página de ajustes'],
    items: {
      profile: { kind: 'sidelink', label: ['Profile', 'Perfil'] },
      notif: { kind: 'sidelink', label: ['Notifications', 'Notificaciones'] },
      billing: { kind: 'sidelink', label: ['Billing', 'Facturación'] },
      email: { kind: 'toggle', label: ['Email updates', 'Correos de novedades'] },
      digest: { kind: 'toggle', label: ['Weekly digest', 'Resumen semanal'] },
      savebtn: { kind: 'button', label: ['Save changes', 'Guardar cambios'] },
    },
    order: ['profile', 'notif', 'billing', 'email', 'digest', 'savebtn'],
    lesson: ['The sidebar comes first in the page, so its links are reached before the settings. Inside the main area: top to bottom, ending with Save.', 'La barra lateral va primero en la página, así que sus enlaces se alcanzan antes que los ajustes. Dentro del área principal: de arriba abajo, terminando en Guardar.'],
    render: (B, es) => (
      <div className="to-side-layout">
        <div className="to-side">{B('profile')}{B('notif')}{B('billing')}</div>
        <div className="to-col">
          <strong className="to-h">{es ? 'Notificaciones' : 'Notifications'}</strong>
          {B('email')}
          {B('digest')}
          <div className="to-end">{B('savebtn')}</div>
        </div>
      </div>
    ),
  },
];

export default function TabOrder() {
  const { t, lang } = useLang();
  const es = lang === 'es';
  const L = pair => (es ? pair[1] : pair[0]);
  const [phase, setPhase] = useState('intro');
  const [rounds, setRounds] = useState([]);
  const [i, setI] = useState(0);
  const [seq, setSeq] = useState([]);
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState([]);
  const [best, setBest] = useState(() => { try { return +localStorage.getItem('taborder:best') || 0; } catch { return 0; } });
  const [copied, setCopied] = useState(false);

  const start = () => {
    setRounds(shuffle(SCREENS)); setI(0); setSeq([]); setChecked(false); setResults([]);
    setPhase('play');
    track('Tab Order start');
  };

  const s = rounds[i];
  const n = s ? s.order.length : 0;
  const tap = id => {
    if (checked) return;
    haptic(6);
    // Tapping a numbered element takes it (and its number) out again.
    setSeq(q => (q.includes(id) ? q.filter(x => x !== id) : [...q, id]));
  };
  const check = () => {
    if (!s || checked || seq.length < n) return;
    const pts = Math.round((lcs(seq, s.order) / n) * 100);
    setResults(a => [...a, { id: s.id, title: s.title, pts }]);
    setChecked(true);
    haptic(pts >= 80 ? 10 : [20, 30, 20]);
  };
  const next = () => {
    if (i + 1 >= rounds.length) { setPhase('over'); return; }
    setI(x => x + 1); setSeq([]); setChecked(false);
  };

  // Enter checks, then moves on (once every element has a number).
  useEffect(() => {
    if (phase !== 'play') return undefined;
    const onKey = e => {
      if (e.key !== 'Enter' || e.target.closest?.('.to-t')) return;
      e.preventDefault(); if (checked) next(); else check();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const total = useMemo(() => (results.length ? Math.round(results.reduce((a, x) => a + x.pts, 0) / results.length) : 0), [results]);
  useEffect(() => {
    if (phase !== 'over') return;
    track('Tab Order finished', { score: total });
    if (total > best) { setBest(total); try { localStorage.setItem('taborder:best', String(total)); } catch { /* private mode */ } }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase !== 'play') return undefined;
    const id = setTimeout(() => glideTo(document.querySelector('.pf-play')), 450);
    return () => clearTimeout(id);
  }, [phase]);

  async function share() {
    const text = `Tab Order · ${total}%\n${results.map(x => (x.pts >= 90 ? '🟩' : x.pts >= 70 ? '🟨' : '🟥')).join('')}\nfun.alevasquez.dev/tab-order`;
    try {
      if (navigator.share && window.matchMedia('(pointer: coarse)').matches) await navigator.share({ text });
      else { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1600); }
    } catch { /* cancelled */ }
  }

  // One interactive element of the mock screen.
  const B = id => {
    const it = s.items[id];
    const mine = seq.indexOf(id) + 1;
    const right = s.order.indexOf(id) + 1;
    const state = checked ? (mine === right ? 'is-ok' : 'is-bad') : '';
    const label = L(it.label);
    return (
      <button
        key={id}
        type="button"
        className={`to-t to-${it.kind} ${mine ? 'is-set' : ''} ${state}`}
        onClick={() => tap(id)}
        aria-pressed={mine > 0}
        aria-label={mine ? t(`${label}, stop ${mine}`, `${label}, parada ${mine}`) : label}
      >
        {it.kind === 'input' && <><span className="to-label">{label}</span><span className="to-box" /></>}
        {it.kind === 'toggle' && <><span>{label}</span><span className="to-switch" /></>}
        {it.kind === 'check' && <><span className="to-tick" />{label}</>}
        {it.kind === 'logo' && <><span className="to-logo-mark" />{label}</>}
        {it.kind === 'icon' && <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg><span className="sr-only">{label}</span></>}
        {it.kind === 'product' && <><span className="to-thumb" /><span className="to-pname">{label}</span><span className="to-add">{t('Add', 'Añadir')}</span></>}
        {['button', 'link', 'nav', 'skip', 'sidelink'].includes(it.kind) && label}
        <AnimatePresence>
          {mine > 0 && (
            <motion.span key="n" className="to-badge" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={{ type: 'spring', stiffness: 420, damping: 22 }} aria-hidden="true">{mine}</motion.span>
          )}
        </AnimatePresence>
        {checked && mine !== right && <span className="to-right" aria-hidden="true">{right}</span>}
      </button>
    );
  };

  const last = results[results.length - 1];
  return (
    <ToolPage id="tab-order" intro="Five small screens. Tap their buttons, links and fields in the order the Tab key should visit them, then see the right order and why.">
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: EASE }} className="card pf-intro">
            <div className="to-demo" aria-hidden="true">
              {[1, 2, 3].map(k => <span key={k} className="to-demo-item" style={{ animationDelay: `${(k - 1) * 0.5}s` }}><span className="to-badge">{k}</span></span>)}
            </div>
            <h2 className="pf-h">{t('Where does Tab go next?', '¿A dónde va el Tab después?')}</h2>
            <ul className="pf-rules">
              <li>{t('Five screens: a form, a header, a checkout, a grid and a settings page.', 'Cinco pantallas: un formulario, un encabezado, un pago, una grilla y una página de ajustes.')}</li>
              <li>{t('Tap every interactive element in the order a keyboard should reach it. Tap again to undo.', 'Toca cada elemento interactivo en el orden en que el teclado debería llegar. Toca de nuevo para deshacer.')}</li>
              <li>{t('Check to see the right order and the rule behind it.', 'Revisa para ver el orden correcto y la regla detrás.')}</li>
            </ul>
            <motion.button type="button" className="btn btn-primary pf-start" whileTap={{ scale: 0.96 }} onClick={start}>{t('Start the game', 'Empezar el juego')}</motion.button>
            {best > 0 && <p className="small muted" style={{ margin: 0 }}>{t(`Your best: ${best}%`, `Tu mejor puntaje: ${best}%`)}</p>}
          </motion.div>
        )}

        {phase === 'play' && s && (
          <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pf-play">
            <div className="pf-hud">
              <span className="mono">{i + 1}<span className="muted">/{rounds.length}</span></span>
              <strong className="oe-title">{L(s.title)}</strong>
              <span className="mono">{seq.length}<span className="muted">/{n}</span></span>
            </div>
            <motion.div key={s.id} className="oe-stage to-stage" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35, ease: EASE }}>
              <div className="to-screen">{s.render(B, es)}</div>
            </motion.div>
            {!checked && <p className="muted small" style={{ margin: 0, textAlign: 'center' }}>{t('Tap the elements in Tab order.', 'Toca los elementos en el orden del Tab.')}</p>}
            <AnimatePresence>
              {checked && last && (
                <motion.div className={'eg-result ' + (last.pts >= 70 ? 'is-ok' : 'is-bad')} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }} role="status">
                  <strong>{last.pts}%</strong>
                  <span className="small">{L(s.lesson)}</span>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="to-actions">
              {!checked && <button type="button" className="btn btn-ghost" onClick={() => setSeq([])} disabled={!seq.length}>{t('Clear', 'Borrar')}</button>}
              {checked
                ? <motion.button type="button" className="btn btn-primary hh-cta" whileTap={{ scale: 0.97 }} onClick={next}>{i + 1 >= rounds.length ? t('See my score', 'Ver mi puntaje') : t('Next screen →', 'Siguiente pantalla →')}</motion.button>
                : <motion.button type="button" className="btn btn-primary hh-cta" whileTap={{ scale: 0.97 }} onClick={check} disabled={seq.length < n}>{seq.length < n ? t(`${n - seq.length} left to number`, `Faltan ${n - seq.length} por numerar`) : t('Check my order', 'Revisar mi orden')}</motion.button>}
            </div>
          </motion.div>
        )}

        {phase === 'over' && (
          <motion.div key="over" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }} className="stack">
            <Reveal className="card pf-over">
              <motion.div className="hh-total" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
                <span className="hh-grad">{total}</span><span className="muted">%</span>
              </motion.div>
              <p className="muted" style={{ margin: 0 }}>
                {total >= 90 ? t('Keyboard users would thank you. Ship it.', 'Quienes usan teclado te lo agradecerían. A producción.') : total >= 75 ? t('Close. Skip links and grids are the usual traps.', 'Cerca. Los enlaces para saltar y las grillas son las trampas de siempre.') : t('Try it for real: unplug the mouse and Tab through a site you built.', 'Pruébalo de verdad: desconecta el mouse y recorre con Tab un sitio que hayas hecho.')}
              </p>
              <div className="pf-strip" aria-hidden="true">{results.map((x, k) => <span key={k} className={x.pts >= 70 ? 'is-ok' : 'is-bad'} />)}</div>
              <div className="chip-row" style={{ justifyContent: 'center' }}>
                <motion.button type="button" className="btn btn-primary" whileTap={{ scale: 0.96 }} onClick={share}>{copied ? t('Copied ✓', 'Copiado ✓') : t('Share score', 'Compartir puntaje')}</motion.button>
                <button type="button" className="btn btn-ghost" onClick={start}>{t('Play again', 'Jugar otra vez')}</button>
              </div>
            </Reveal>
            <Reveal className="card">
              <h2 className="eyebrow">{t('Screen by screen', 'Pantalla por pantalla')}</h2>
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
