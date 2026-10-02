import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Background from '../components/Background';
import SiteNav from '../components/SiteNav';
import SiteFooter from '../components/SiteFooter';
import SplitText from '../components/motion/SplitText';
import Magnetic from '../components/motion/Magnetic';
import Newsletter from '../components/Newsletter';
import { experiments, SITE } from '../experiments';
import { useLang } from '../i18n';
import { EASE } from '../lib/motion';
import { track } from '../lib/analytics';
import { haptic } from '../lib/haptics';

/* Landing page for the links in newsletter emails (/confirm?t=…, /unsubscribe?t=…).
   The token is sent to the signup endpoint (scripts/apps-script/Code.gs, ?action=…),
   which updates the Google Sheet and answers with the result. Running the
   request from the page (not the link itself) means mail scanners that
   pre-open links can't confirm or unsubscribe anyone by accident. */

const PICKS = ['contrast-checker', 'token-converter', 'palette-generator'];
const CONFETTI = ['#CD57FF', '#FF7AB6', '#FFCE1F', '#8B6CF0', '#7ED957'];

function useNoIndex() {
  useEffect(() => {
    let robots = document.head.querySelector('meta[name="robots"]');
    if (!robots) { robots = document.createElement('meta'); robots.name = 'robots'; document.head.appendChild(robots); }
    robots.content = 'noindex, nofollow';
    return () => { robots.content = 'index, follow, max-image-preview:large'; };
  }, []);
}

// Radial burst of brand-colored bits around the emblem.
function Confetti() {
  const bits = Array.from({ length: 28 }, (_, i) => {
    const a = (i / 28) * Math.PI * 2 + (i % 2 ? 0.12 : -0.08);
    const d = 90 + (i % 5) * 26;
    return { i, x: Math.cos(a) * d, y: Math.sin(a) * d, c: CONFETTI[i % CONFETTI.length], r: (i * 47) % 360, round: i % 3 === 0 };
  });
  return (
    <span className="sub-confetti" aria-hidden="true">
      {bits.map(b => (
        <motion.span
          key={b.i}
          className="sub-bit"
          style={{ background: b.c, borderRadius: b.round ? '50%' : 2 }}
          initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
          animate={{ x: b.x, y: [0, b.y, b.y + 40], scale: [0, 1, 0.8], rotate: b.r, opacity: [1, 1, 0] }}
          transition={{ duration: 1.4, ease: EASE, times: [0, 0.55, 1], delay: 0.15 }}
        />
      ))}
    </span>
  );
}

function Emblem({ status }) {
  const loading = status === 'loading';
  const good = status === 'confirmed' || status === 'already';
  return (
    <div className={'sub-emblem sub-' + status} aria-hidden="true">
      <span className="sub-ring" />
      <span className="sub-core">
        <AnimatePresence mode="wait">
          {loading && (
            <motion.span key="dots" className="sub-dots" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.6 }}>
              <i /><i /><i />
            </motion.span>
          )}
          {good && (
            <motion.svg key="check" viewBox="0 0 52 52" width="56" height="56" initial={{ scale: 0.4, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 320, damping: 14 }}>
              <motion.path d="M14 27 l8 8 l16 -18" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, ease: EASE, delay: 0.1 }} />
            </motion.svg>
          )}
          {status === 'unsubscribed' && (
            <motion.span key="wave" className="sub-glyph" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1, rotate: [0, 18, -10, 14, 0] }} transition={{ duration: 1.1, ease: EASE }}>👋</motion.span>
          )}
          {(status === 'invalid' || status === 'error') && (
            <motion.span key="q" className="sub-glyph" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1, x: [0, -6, 6, -3, 0] }} transition={{ duration: 0.6, ease: EASE }}>{status === 'invalid' ? '🔗' : '📡'}</motion.span>
          )}
        </AnimatePresence>
      </span>
      {good && <Confetti />}
    </div>
  );
}

export default function Subscription({ action }) {
  const { lang, t, to, name } = useLang();
  const [status, setStatus] = useState('loading'); // loading | confirmed | already | unsubscribed | invalid | error
  const [list, setList] = useState('newsletter');
  const [attempt, setAttempt] = useState(0);
  const started = useRef(-1);
  useNoIndex();

  useEffect(() => {
    document.title = action === 'confirm'
      ? `${t('Confirm your subscription', 'Confirma tu suscripción')} — ${SITE.name}`
      : `${t('Unsubscribe', 'Darte de baja')} — ${SITE.name}`;
  }, [action, t]);

  useEffect(() => {
    if (started.current === attempt) return; // StrictMode runs effects twice in dev
    started.current = attempt;
    const token = new URLSearchParams(window.location.search).get('t') || '';
    const endpoint = SITE.newsletter.newsletter;
    // Results arrive asynchronously; setState only ever runs in callbacks.
    const finish = s => setStatus(s);
    if (!token || !endpoint) { Promise.resolve('invalid').then(finish); return; }
    if (attempt) Promise.resolve('loading').then(finish);
    fetch(`${endpoint}?action=${action}&t=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(res => {
        if (!res.ok) return finish('invalid');
        if (res.list) setList(res.list);
        finish(res.status);
        haptic(12);
        track(action === 'confirm' ? 'Newsletter confirmed' : 'Newsletter unsubscribed', { list: res.list || 'newsletter', lang });
        // Keep the token out of history and shared screenshots.
        window.history.replaceState(null, '', window.location.pathname);
      })
      .catch(() => finish('error'));
  }, [action, attempt, lang]);

  const waitlist = list === 'waitlist';
  const copy = {
    loading: action === 'confirm'
      ? [t('Confirming…', 'Confirmando…'), t('One second while we save your spot.', 'Un segundo mientras guardamos tu lugar.')]
      : [t('Updating…', 'Actualizando…'), t('One second while we update your preferences.', 'Un segundo mientras actualizamos tus preferencias.')],
    confirmed: [t('You’re in!', '¡Listo, ya estás!'), waitlist
      ? t('You’re on the Lab Pro waitlist. You’ll be the first to know when the Figma plugins launch.', 'Ya estás en la lista de espera de Lab Pro. Serás de los primeros en saber cuándo salen los plugins de Figma.')
      : t('Your subscription is confirmed. New tools, guides and experiments will land in your inbox.', 'Tu suscripción está confirmada. Las herramientas, guías y experimentos nuevos llegarán a tu correo.')],
    already: [t('Already confirmed', 'Ya estaba confirmada'), t('You were already on the list. Nothing else to do: enjoy the lab.', 'Ya estabas en la lista. No tienes que hacer nada más: disfruta el lab.')],
    unsubscribed: [t('You’re unsubscribed', 'Te diste de baja'), t('You won’t get any more emails from the lab. Sorry to see you go; the tools stay free whenever you need them.', 'No recibirás más correos del lab. Lamentamos verte partir; las herramientas siguen gratis cuando las necesites.')],
    invalid: [t('This link doesn’t work', 'Este enlace no funciona'), t('It may be incomplete or already used. Try the button in the email again, or sign up below.', 'Puede estar incompleto o ya se usó. Prueba de nuevo el botón del correo o suscríbete abajo.')],
    error: [t('Couldn’t reach the server', 'No pudimos conectar con el servidor'), t('Check your connection and try again. Your link is still valid.', 'Revisa tu conexión e inténtalo de nuevo. Tu enlace sigue siendo válido.')],
  }[status];

  const good = status === 'confirmed' || status === 'already';
  const picks = PICKS.map(id => experiments.find(e => e.id === id)).filter(Boolean);

  return (
    <div className="page">
      <Background />
      <div className="page-inner">
        <SiteNav />
        <main className="sub-stage" aria-live="polite">
          <motion.div className="sub-card card" initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.7, ease: EASE }}>
            <span className="sub-card-bar" aria-hidden="true" />
            <Emblem status={status} />
            <p className="sub-eyebrow">
              <span className="gradient-dot" style={{ width: 8, height: 8 }} />{' '}
              {action === 'confirm' ? (waitlist ? 'Lab Pro · waitlist' : t('Newsletter', 'Newsletter')) : t('Email preferences', 'Preferencias de correo')}
            </p>
            <h1 className="sub-title">
              <SplitText key={status + lang} text={copy[0]} stagger={0.03} reactive charClassName={good ? 'grad-char' : undefined} />
            </h1>
            <AnimatePresence mode="wait">
              <motion.p key={status} className="sub-text" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.4, ease: EASE, delay: 0.15 }}>
                {copy[1]}
              </motion.p>
            </AnimatePresence>

            {status !== 'loading' && (
              <motion.div className="sub-actions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}>
                {status === 'error' ? (
                  <button type="button" className="btn btn-primary" onClick={() => setAttempt(a => a + 1)}>{t('Try again', 'Intentar de nuevo')}</button>
                ) : (
                  <Magnetic><Link to={to('/')} className="btn btn-primary">{t('Explore the lab', 'Explorar el lab')} →</Link></Magnetic>
                )}
                {good && !waitlist && <Link to={to('/pro')} className="btn btn-ghost">{t('Lab Pro for Figma', 'Lab Pro para Figma')}</Link>}
                {good && waitlist && <Link to={to('/guides')} className="btn btn-ghost">{t('Read the guides', 'Leer las guías')}</Link>}
              </motion.div>
            )}
          </motion.div>

          {good && (
            <motion.section className="sub-picks" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.45 }} aria-label={t('Start here', 'Empieza aquí')}>
              <p className="sub-picks-title">{t('Start with a favorite', 'Empieza con un favorito')}</p>
              <div className="more-grid">
                {picks.map((e, i) => (
                  <motion.div key={e.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.55 + i * 0.08 }}>
                    <Link to={to(e.path)} className="more-link"><span className="more-link-emoji" aria-hidden="true">{e.emoji}</span><span style={{ flex: 1 }}>{name(e)}</span><span aria-hidden="true">→</span></Link>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {(status === 'unsubscribed' || status === 'invalid') && (
            <motion.div className="sub-resubscribe" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.4 }}>
              <Newsletter source={status === 'unsubscribed' ? 'resubscribe' : 'confirm-retry'} compact />
            </motion.div>
          )}
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
