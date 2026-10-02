import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Background from '../components/Background';
import SiteNav from '../components/SiteNav';
import SiteFooter from '../components/SiteFooter';
import SplitText from '../components/motion/SplitText';
import Newsletter from '../components/Newsletter';
import usePageMeta from '../hooks/usePageMeta';
import { CHANGELOG } from '../changelog';
import { useLang } from '../i18n';
import { EASE, REVEAL_VIEWPORT } from '../lib/motion';

export default function Changelog() {
  const { lang, t, to } = useLang();
  usePageMeta({
    title: t("What's new — Ale's Fun Lab", "Novedades — Ale's Fun Lab"),
    description: t('New tools, guides and improvements in Ale’s Fun Lab, newest first.', 'Nuevas herramientas, guías y mejoras en Ale’s Fun Lab, de la más reciente a la más antigua.'),
    path: to('/changelog'),
    image: '/og/home.png',
    alternates: { en: '/changelog', es: '/es/novedades' },
  });

  return (
    <div className="page">
      <Background />
      <div className="page-inner">
        <SiteNav />
        <header className="tool-header">
          <Link to={to('/')} className="back-link"><span className="arrow" aria-hidden="true">←</span> {t('Back to the lab', 'Volver al lab')}</Link>
          <SplitText key={lang} as="h1" className="tool-title" text={t("What's new", 'Novedades')} delay={0.1} stagger={0.03} reactive />
          <p className="tool-desc">
            {t('Everything that shipped, newest first. Follow along by email or ', 'Todo lo que se publicó, de lo más reciente a lo más antiguo. Síguelo por email o por ')}
            <a href="/rss.xml">RSS</a>.
          </p>
        </header>
        <main className="timeline">
          {CHANGELOG.map((entry, i) => (
            <motion.article
              key={entry.id}
              className="timeline-item"
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={REVEAL_VIEWPORT}
              transition={{ duration: 0.6, ease: EASE, delay: i * 0.05 }}
            >
              <span className="timeline-dot" aria-hidden="true" />
              <time dateTime={entry.date} className="small muted">
                {new Date(entry.date + 'T00:00:00').toLocaleDateString(lang === 'es' ? 'es' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </time>
              <h2 className="card-title" style={{ margin: '4px 0 6px' }}>{entry[lang].title}</h2>
              <p className="muted" style={{ margin: 0, lineHeight: 1.65 }}>{entry[lang].body}</p>
            </motion.article>
          ))}
        </main>
        <Newsletter source="changelog" />
        <SiteFooter />
      </div>
    </div>
  );
}
