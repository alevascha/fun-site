import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import Magnetic from './motion/Magnetic';
import { useCounterpart, useLang } from '../i18n';
import { track } from '../lib/analytics';
import CommandHint from './CommandHint';
import { glideToTop } from '../lib/smoothScroll';

/* EN | ES pill that jumps to the same page in the other language. */
function LangSwitch() {
  const { lang } = useLang();
  const other = useCounterpart();
  const { search } = useLocation(); // keep a tool's shared settings when switching
  const options = [{ code: 'en', label: 'EN', name: 'English' }, { code: 'es', label: 'ES', name: 'Español' }];
  return (
    <div className="lang-switch" role="group" aria-label={lang === 'es' ? 'Idioma' : 'Language'}>
      {options.map(o => {
        const active = o.code === lang;
        return active ? (
          <span key={o.code} className="lang-switch-btn" aria-current="true" lang={o.code} title={o.name}>
            <motion.span layoutId="lang-pill" className="lang-switch-pill" transition={{ type: 'spring', stiffness: 420, damping: 32 }} />
            <span>{o.label}</span>
          </span>
        ) : (
          <Link key={o.code} to={other.path + search} className="lang-switch-btn" hrefLang={o.code} lang={o.code} title={o.name} onClick={() => track('Language switch', { to: o.code })}>
            <span>{o.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

export default function SiteNav() {
  const { pathname } = useLocation();
  const { t, to } = useLang();
  const onHome = pathname === '/' || pathname === '/es';
  // Hides while scrolling down, slides back the moment you scroll up.
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);
  const menuBtnRef = useRef(null);
  useMotionValueEvent(scrollY, 'change', y => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(!menuOpen && y > prev && y > 240);
  });

  // Phone menu: closes on navigation, Escape (focus back to the button) and outside taps.
  useEffect(() => { setMenuOpen(false); }, [pathname]); // eslint-disable-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = e => { if (e.key === 'Escape') { setMenuOpen(false); menuBtnRef.current?.focus(); } };
    const onDown = e => { if (!navRef.current?.contains(e.target)) setMenuOpen(false); };
    addEventListener('keydown', onKey);
    addEventListener('pointerdown', onDown);
    return () => { removeEventListener('keydown', onKey); removeEventListener('pointerdown', onDown); };
  }, [menuOpen]);

  const links = [
    { to: '/', label: t('Experiments', 'Experimentos'), current: onHome },
    { to: '/games', label: t('Games', 'Juegos'), current: pathname.includes('/games') || pathname.includes('/juegos') },
    { to: '/guides', label: t('Guides', 'Guías'), current: pathname.includes('/guides') || pathname.includes('/guias') },
    { to: '/pro', label: 'Pro', current: /\/pro$/.test(pathname) },
  ];

  return (
    <motion.nav
      ref={navRef}
      className="site-nav"
      aria-label={t('Main', 'Principal')}
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: hidden ? -96 : 0, opacity: hidden ? 0 : 1, scale: hidden ? 0.96 : 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={to('/')}
        className="site-nav-brand"
        aria-label={onHome ? t("Ale's Fun Lab — back to top", "Ale's Fun Lab — volver arriba") : t("Ale's Fun Lab — home", "Ale's Fun Lab — inicio")}
        // Already home: the logo works as "back to top" instead of a no-op.
        onClick={e => { if (onHome) { e.preventDefault(); glideToTop(); } }}
      >
        <motion.span className="site-nav-logo" whileHover={{ rotate: -12, scale: 1.08 }} transition={{ type: 'spring', stiffness: 400, damping: 14 }}>
          f
        </motion.span>
        <span className="site-nav-brand-text">Ale's Fun Lab</span>
      </Link>
      <div className="site-nav-links">
        <Link to={to('/')} className="site-nav-link site-nav-link--hide-sm" aria-current={onHome ? 'page' : undefined}>
          {onHome && <motion.span layoutId="nav-pill" className="site-nav-link-bg" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
          {t('Experiments', 'Experimentos')}
        </Link>
        <Link to={to('/games')} className="site-nav-link site-nav-link--hide-sm" aria-current={pathname.includes('/games') || pathname.includes('/juegos') ? 'page' : undefined}>
          {t('Games', 'Juegos')}
        </Link>
        <Link to={to('/guides')} className="site-nav-link site-nav-link--hide-sm" aria-current={pathname.includes('/guides') || pathname.includes('/guias') ? 'page' : undefined}>
          {t('Guides', 'Guías')}
        </Link>
        <Link to={to('/pro')} className="site-nav-link site-nav-link--hide-sm">Pro</Link>
      </div>
      <div className="site-nav-actions">
        <CommandHint />
        <LangSwitch />
        <Magnetic strength={0.25} className="hide-md">
          <a href="https://www.alevasquez.dev/" target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
            alevasquez.dev <span className="arrow arrow-ne" aria-hidden="true">↗</span>
          </a>
        </Magnetic>
        <Magnetic strength={0.4}><ThemeToggle /></Magnetic>
        <button
          ref={menuBtnRef}
          type="button"
          className="site-nav-menu-btn"
          aria-expanded={menuOpen}
          aria-controls="site-nav-menu"
          aria-label={menuOpen ? t('Close menu', 'Cerrar menú') : t('Open menu', 'Abrir menú')}
          onClick={() => setMenuOpen(o => !o)}
        >
          <span className={'menu-icon' + (menuOpen ? ' is-open' : '')} aria-hidden="true"><i /><i /></span>
        </button>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="site-nav-menu"
            className="site-nav-menu"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <ul>
              {links.map((l, i) => (
                <motion.li key={l.to} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i }}>
                  <Link to={to(l.to)} aria-current={l.current ? 'page' : undefined} onClick={() => setMenuOpen(false)}>
                    {l.label} <span className="arrow" aria-hidden="true">→</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
            <a href="https://www.alevasquez.dev/" target="_blank" rel="noopener noreferrer" className="btn btn-primary site-nav-menu-cta">
              alevasquez.dev <span className="arrow arrow-ne" aria-hidden="true">↗</span>
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
