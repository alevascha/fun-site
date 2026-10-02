import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Background from '../components/Background';
import SiteNav from '../components/SiteNav';
import SiteFooter from '../components/SiteFooter';
import SplitText from '../components/motion/SplitText';
import Magnetic from '../components/motion/Magnetic';
import { experiments, SITE } from '../experiments';
import { GUIDES } from '../guides';
import { ES, PAGE_PATHS } from '../seo-es';
import { useLang } from '../i18n';
import { EASE } from '../lib/motion';
import { track } from '../lib/analytics';

// Edit distance, for "did you mean…" on mistyped URLs.
function distance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return row[b.length];
}

const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

export default function NotFound() {
  const { lang, t, to, name, blurb } = useLang();
  const { pathname } = useLocation();
  const [query, setQuery] = useState('');

  useEffect(() => {
    document.title = `${t('Page not found', 'Página no encontrada')} — ${SITE.name}`;
    let robots = document.head.querySelector('meta[name="robots"]');
    if (!robots) { robots = document.createElement('meta'); robots.name = 'robots'; document.head.appendChild(robots); }
    robots.content = 'noindex, follow';
    track('404', { path: pathname });
    return () => { robots.content = 'index, follow, max-image-preview:large'; };
  }, [t, pathname]);

  // Everything a visitor might have been looking for, in this language.
  const pages = useMemo(() => {
    const tools = experiments.filter(e => e.active).map(e => ({
      key: e.id, emoji: e.emoji, label: name(e), hint: blurb(e), href: to(e.path),
      slugs: [e.path.slice(1), ES[e.id]?.slug].filter(Boolean),
    }));
    const guides = GUIDES.map(g => ({
      key: g.slug, emoji: '📘', label: g[lang].title, hint: t('Guide', 'Guía'),
      href: lang === 'es' ? `/es/guias/${g.es.slug}` : `/guides/${g.slug}`, slugs: [g.slug, g.es.slug],
    }));
    const other = [['/guides', '📚', t('Guides', 'Guías')], ['/pro', '✦', 'Lab Pro'], ['/changelog', '🗞️', t("What's new", 'Novedades')], ['/about', '👋', t('About', 'Acerca de')]]
      .map(([p, emoji, label]) => ({ key: p, emoji, label, hint: '', href: to(p), slugs: [p.slice(1), (PAGE_PATHS[p] || '').split('/').pop()] }));
    return [...tools, ...guides, ...other];
  }, [lang, name, blurb, t, to]);

  // Closest page to the URL that was typed.
  const suggestion = useMemo(() => {
    const typed = norm(decodeURIComponent(pathname.replace(/^\/es\b/, '').split('/').filter(Boolean).pop() || ''));
    if (typed.length < 3) return null;
    let best = null;
    for (const p of pages) {
      for (const s of p.slugs) {
        const n = norm(s);
        const score = n.includes(typed) || typed.includes(n) ? 0 : distance(typed, n) / Math.max(n.length, typed.length);
        if (!best || score < best.score) best = { page: p, score };
      }
    }
    return best && best.score <= 0.45 ? best.page : null;
  }, [pathname, pages]);

  const q = norm(query);
  const results = q ? pages.filter(p => norm(`${p.label} ${p.hint} ${p.slugs.join(' ')}`).includes(q)) : pages.slice(0, experiments.filter(e => e.active).length);

  return (
    <div className="page">
      <Background />
      <div className="page-inner">
        <SiteNav />
        <main className="nf-stage">
          <motion.div className="nf-code" aria-hidden="true" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: EASE }}>
            {'404'.split('').map((d, i) => (
              <motion.span key={i} className="grad-char" style={{ '--i': i, '--n': 3 }} animate={{ y: [0, -14, 0] }} transition={{ duration: 2.4, ease: 'easeInOut', repeat: Infinity, delay: i * 0.18 }}>{d}</motion.span>
            ))}
          </motion.div>
          <h1 className="nf-title"><SplitText key={lang} text={t('This page wandered off', 'Esta página se perdió')} stagger={0.025} reactive /></h1>
          <p className="nf-text">
            {t('The link may be broken or the page may have moved. ', 'Puede que el enlace esté roto o que la página se haya movido. ')}
            <code className="nf-path">{pathname}</code>
          </p>

          <AnimatePresence>
            {suggestion && (
              <motion.div className="nf-suggest" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}>
                <span className="muted">{t('Did you mean', '¿Quisiste decir')}</span>
                <Magnetic><Link to={suggestion.href} className="btn btn-primary" onClick={() => track('404 suggestion', { to: suggestion.href })}>{suggestion.emoji} {suggestion.label} →</Link></Magnetic>
                {lang === 'es' && <span className="muted">?</span>}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div className="nf-search" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.4 }}>
            <label className="sr-only" htmlFor="nf-q">{t('Search the lab', 'Buscar en el lab')}</label>
            <span aria-hidden="true">⌕</span>
            <input id="nf-q" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder={t('Search tools and guides…', 'Busca herramientas y guías…')} autoComplete="off" />
          </motion.div>

          <motion.div className="more-grid nf-results" layout>
            <AnimatePresence initial={false} mode="popLayout">
              {results.map((p, i) => (
                <motion.div key={p.key} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.35, ease: EASE, delay: Math.min(i * 0.03, 0.3) }}>
                  <Link to={p.href} className="more-link"><span className="more-link-emoji" aria-hidden="true">{p.emoji}</span><span style={{ flex: 1 }}>{p.label}</span></Link>
                </motion.div>
              ))}
            </AnimatePresence>
            {results.length === 0 && <p className="muted" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>{t('Nothing matches that. Try “color” or “tokens”.', 'Nada coincide. Prueba “color” o “tokens”.')}</p>}
          </motion.div>

          <Link to={to('/')} className="back-link" style={{ marginTop: 8 }}><span className="arrow" aria-hidden="true">←</span> {t('Back to the lab', 'Volver al lab')}</Link>
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
