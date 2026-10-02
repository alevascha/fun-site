import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import SiteNav from './SiteNav';
import Background from './Background';
import { experiments, getExperiment, getPageMeta, getSeo } from '../experiments';
import usePageMeta from '../hooks/usePageMeta';
import { markOpened } from '../lib/seen';
import { Reveal } from './ui';
import { EASE } from '../lib/motion';
import SplitText from './motion/SplitText';
import SiteFooter from './SiteFooter';
import AdSlot from './AdSlot';
import Newsletter from './Newsletter';
import Feedback from './Feedback';
import { useLang } from '../i18n';
import { GUIDES } from '../guides';

export default function ToolPage({ id, intro, children }) {
  const exp = getExperiment(id);
  const { lang, t, to, name } = useLang();
  usePageMeta(getPageMeta(exp, lang));
  useEffect(() => { markOpened(id); }, [id]);

  const others = experiments.filter(e => e.active && e.id !== id);
  const seo = getSeo(id, lang);
  const guide = GUIDES.find(g => g.tool === id);

  // The header drifts up and fades as the tool scrolls into focus.
  const headerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: headerRef, offset: ['start start', 'end start'] });
  const headerY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0]);

  return (
    <div className="page" style={{ '--tool-accent': exp.accent }}>
      <Background />
      <div className="page-inner">
        <SiteNav />
        <motion.header
          ref={headerRef}
          style={{ y: headerY, opacity: headerOpacity }}
          className="tool-header"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        >
          <motion.div variants={{ hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE } } }}>
            <Link to={to('/')} className="back-link"><span className="arrow" aria-hidden="true">←</span> {t('Back to the lab', 'Volver al lab')}</Link>
          </motion.div>
          <motion.div
            className="tool-title-row"
            variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } }}
          >
            <motion.div
              className="tool-emoji"
              initial={{ rotate: -20, scale: 0.6 }}
              animate={{ rotate: 0, scale: 1 }}
              whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 260, damping: 14 }}
            >
              <span aria-hidden="true">{exp.emoji}</span>
            </motion.div>
            <SplitText key={lang} as="h1" className="tool-title" text={name(exp)} delay={0.15} stagger={0.025} reactive />
          </motion.div>
          <motion.p
            className="tool-desc"
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}
          >
            {lang === 'es' ? seo.intro || seo.description : intro || exp.description}
          </motion.p>
        </motion.header>

        <main>{children}</main>

        {(seo.features?.length > 0 || seo.faq?.length > 0) && (
          <Reveal as="section" className="grid-2" style={{ marginTop: 'clamp(48px, 8vw, 96px)' }} aria-label={t('About this tool', 'Sobre esta herramienta')}>
            {seo.features?.length > 0 && (
              <div className="card">
                <h2 className="card-title">{t('What it does', 'Qué hace')}</h2>
                <ul className="muted" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
                  {seo.features.map(f => <li key={f}>{f}</li>)}
                </ul>
              </div>
            )}
            {seo.faq?.length > 0 && (
              <div className="card">
                <h2 className="card-title">{t('FAQ', 'Preguntas frecuentes')}</h2>
                <div className="stack" style={{ gap: 8 }}>
                  {seo.faq.map(f => (
                    <details key={f.q} className="faq">
                      <summary>{f.q}</summary>
                      <p className="muted" style={{ margin: '8px 0 0', lineHeight: 1.6 }}>{f.a}</p>
                    </details>
                  ))}
                </div>
                {guide && (
                  <Link to={to(`/guides/${guide.slug}`)} className="btn btn-ghost btn-sm" style={{ marginTop: 14 }}>
                    📖 {t('Read the guide', 'Lee la guía')}: {guide[lang].title} <span className="arrow" aria-hidden="true">→</span>
                  </Link>
                )}
              </div>
            )}
          </Reveal>
        )}

        <Feedback tool={id} />

        <Newsletter source={id} />

        <AdSlot slot="tool" />

        <Reveal as="section" style={{ marginTop: 'clamp(48px, 8vw, 96px)' }} aria-labelledby="more-title">
          <h2 id="more-title" style={{ fontSize: 'clamp(28px, 4vw, 40px)', margin: '0 0 20px' }}>{t('More experiments', 'Más experimentos')}</h2>
          <div className="more-grid">
            {others.map(o => (
              <motion.div key={o.id} whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }}>
                <Link to={to(o.path)} className="more-link" data-cursor={t('Go', 'Ir')}>
                  <span className="more-link-emoji" aria-hidden="true">{o.emoji}</span>
                  <span style={{ flex: 1 }}>{name(o)}</span>
                  <span aria-hidden="true" className="muted">→</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </Reveal>

        <SiteFooter>
          <a href="https://www.alevasquez.dev/" target="_blank" rel="noopener noreferrer" className="btn btn-chip btn-sm">
            {t('Work with me', 'Trabajemos juntos')} <span className="arrow" aria-hidden="true">→</span>
          </a>
        </SiteFooter>
      </div>
    </div>
  );
}
