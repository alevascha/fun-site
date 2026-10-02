import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Background from '../components/Background';
import SiteNav from '../components/SiteNav';
import SiteFooter from '../components/SiteFooter';
import SplitText from '../components/motion/SplitText';
import { Reveal } from '../components/ui';
import { EASE } from '../lib/motion';
import usePageMeta from '../hooks/usePageMeta';
import { getStaticPage, STATIC_PAGES_ES } from '../pages-content';
import { useLang } from '../i18n';

export default function StaticPage({ id }) {
  const { lang, t, to } = useLang();
  const page = getStaticPage(id, lang);
  const enPath = getStaticPage(id).path;
  usePageMeta({ title: page.metaTitle, description: page.description, path: page.path, image: '/og/home.png', alternates: { en: enPath, es: STATIC_PAGES_ES[id].path } });
  useEffect(() => { document.documentElement.scrollTop = 0; }, [id]);

  return (
    <div className="page">
      <Background />
      <div className="page-inner">
        <SiteNav />
        <header className="tool-header" style={{ maxWidth: 820 }}>
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease: EASE }}>
            <Link to={to('/')} className="back-link"><span className="arrow" aria-hidden="true">←</span> {t('Back to the lab', 'Volver al lab')}</Link>
          </motion.div>
          <SplitText key={lang} as="h1" className="tool-title" text={page.title} delay={0.1} stagger={0.03} reactive />
          <p className="tool-desc">{page.description}</p>
          <p className="small muted" style={{ margin: 0 }}>{t('Last updated', 'Última actualización:')} {new Date(page.updated + 'T00:00:00').toLocaleDateString(lang === 'es' ? 'es' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </header>
        <main className="stack" style={{ maxWidth: 820 }}>
          {page.sections.map((s, i) => (
            <Reveal key={s.heading} className="card" delay={Math.min(i * 0.04, 0.2)}>
              <h2 className="card-title">{s.heading}</h2>
              {s.body.map(p => <p key={p.slice(0, 40)} className="muted" style={{ lineHeight: 1.7, margin: '10px 0 0' }}>{p}</p>)}
              {s.links && (
                <div className="chip-row" style={{ marginTop: 14 }}>
                  {s.links.map(l => <a key={l.href} className="btn btn-ghost btn-sm" href={l.href} target="_blank" rel="noopener noreferrer">{l.label} <span aria-hidden="true">↗</span></a>)}
                </div>
              )}
            </Reveal>
          ))}
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
