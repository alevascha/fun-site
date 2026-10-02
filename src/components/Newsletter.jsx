import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SITE } from '../experiments';
import { useLang } from '../i18n';
import { Reveal } from './ui';
import { EASE } from '../lib/motion';
import { track } from '../lib/analytics';
import { haptic } from '../lib/haptics';
import { subscribe } from '../lib/subscribe';

/* Email signup. The provider (Kit, Buttondown, Formspree, a Google Sheet or
   Brevo — see lib/subscribe.js) stores the address and handles confirmation
   and unsubscribes; we only send the email. Most providers answer opaquely
   (no-cors), so success means "sent". */
export default function Newsletter({ source, waitlist = false, compact = false }) {
  const { lang, t, to } = useLang();
  const id = useId();
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle'); // idle | sending | done | error
  const { provider } = SITE.newsletter;
  const target = waitlist ? SITE.newsletter.waitlist || SITE.newsletter.newsletter : SITE.newsletter.newsletter;
  const action = provider && target;

  if (!action && !import.meta.env.DEV) return null;

  async function submit(e) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { setState('error'); return; }
    setState('sending');
    try {
      if (action) await subscribe({ provider, target, email, lang, list: waitlist ? 'waitlist' : 'newsletter' });
      setState('done');
      haptic(20);
      track(waitlist ? 'Waitlist signup' : 'Newsletter signup', { source: source || 'unknown', lang });
    } catch {
      setState('error');
    }
  }

  const title = waitlist
    ? t('Join the Lab Pro waitlist', 'Únete a la lista de espera de Lab Pro')
    : t('Get new experiments by email', 'Recibe los nuevos experimentos por email');
  const sub = waitlist
    ? t('Be the first to try the Figma plugins — and get a launch discount.', 'Sé de los primeros en probar los plugins de Figma, con descuento de lanzamiento.')
    : t('One short email when something new ships. No spam, unsubscribe anytime.', 'Un email corto cuando haya algo nuevo. Sin spam, te das de baja cuando quieras.');

  return (
    <Reveal as="section" className={'newsletter' + (compact ? ' newsletter-compact' : '')} aria-labelledby={`${id}-title`}>
      <div className="newsletter-copy">
        <h2 id={`${id}-title`} className="card-title" style={{ margin: 0 }}>{title}</h2>
        <p className="small muted" style={{ margin: '6px 0 0' }}>{sub}</p>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {state === 'done' ? (
          <motion.p key="done" role="status" className="newsletter-done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }}>
            <span aria-hidden="true">✓</span> {t('Almost there — check your inbox to confirm.', '¡Casi listo! Revisa tu correo para confirmar.')}
          </motion.p>
        ) : (
          <motion.form key="form" className="newsletter-form" onSubmit={submit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25, ease: EASE }}>
            <label htmlFor={`${id}-email`} className="sr-only">{t('Email address', 'Correo electrónico')}</label>
            <input
              id={`${id}-email`}
              type="email"
              className="input"
              placeholder={t('you@example.com', 'tu@correo.com')}
              autoComplete="email"
              value={email}
              aria-invalid={state === 'error'}
              aria-describedby={`${id}-note`}
              onChange={e => { setEmail(e.target.value); if (state === 'error') setState('idle'); }}
              required
            />
            <motion.button type="submit" className="btn btn-primary" whileTap={{ scale: 0.95 }} disabled={state === 'sending'}>
              {state === 'sending' ? t('Sending…', 'Enviando…') : waitlist ? t('Join', 'Unirme') : t('Subscribe', 'Suscribirme')}
            </motion.button>
            <p id={`${id}-note`} className="newsletter-note" role={state === 'error' ? 'alert' : undefined}>
              {state === 'error'
                ? t('Please enter a valid email address.', 'Escribe un correo electrónico válido.')
                : <>{t('By subscribing you agree to the', 'Al suscribirte aceptas la')} <a href={to('/privacy')}>{t('privacy policy', 'política de privacidad')}</a>.{!action && ' (dev: no newsletter provider configured)'}</>}
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </Reveal>
  );
}
