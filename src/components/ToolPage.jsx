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
import { FIGMA_PLUGINS } from '../pro-content';
import Steps from './Steps';
import { track } from '../lib/analytics';

// Figma's logo mark, monochrome so it follows the text color.
const FigmaMark = () => (
  <svg width="12" height="18" viewBox="0 0 38 57" aria-hidden="true" fill="currentColor">
    <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" opacity=".55" />
    <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" opacity=".85" />
    <path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" opacity=".7" />
    <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" />
    <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" opacity=".8" />
  </svg>
);

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
          {/* The description is the page's Largest Contentful Paint. Browsers
              skip opacity-0 elements when timing it, so the fade starts at
              0.01: it looks the same, and LCP no longer waits for it. */}
          <motion.p
            className="tool-desc"
            variants={{ hidden: { opacity: 0.01, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}
          >
            {lang === 'es' ? seo.intro || seo.description : intro || exp.description}
          </motion.p>
          {exp.category !== 'Games' && (
            <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }}>
              {FIGMA_PLUGINS[id]
                ? <a className="figma-chip" href={FIGMA_PLUGINS[id]} target="_blank" rel="noopener noreferrer" onClick={() => track('Figma plugin click', { tool: id, state: 'live' })}><FigmaMark /> {t('Open the Figma plugin', 'Abrir el plugin de Figma')} <span aria-hidden="true">↗</span></a>
                : <Link className="figma-chip" to={to('/pro')} onClick={() => track('Figma plugin click', { tool: id, state: 'soon' })}><FigmaMark /> {t('Figma plugin coming soon', 'Plugin de Figma muy pronto')} <span aria-hidden="true">→</span></Link>}
            </motion.div>
          )}
        </motion.header>

        <main>{children}</main>

        {/* ---------- How to use ---------- */}
        {seo.howTo?.length > 0 && (
          <section className="tool-section" aria-labelledby="tool-howto-title">
            <Reveal className="tool-section-head">
              <SplitText key={lang + 'how'} as="h2" id="tool-howto-title" className="hub-section-title" text={t(`How to use ${name(exp)}`, `Cómo usar ${name(exp)}`)} inView stagger={0.02} />
            </Reveal>
            <Steps items={seo.howTo.map(text => ({ text }))} />
          </section>
        )}

        {/* ---------- About + what it does (editorial, no card) ---------- */}
        {(seo.about?.length > 0 || seo.features?.length > 0) && (
          <section className="tool-section tool-about" aria-labelledby="tool-about-title">
            <Reveal className="tool-about-head">
              <SplitText key={lang + 'about'} as="h2" id="tool-about-title" className="hub-section-title" text={seo.about?.length ? t(`About ${name(exp)}`, `Sobre ${name(exp)}`) : t('What it does', 'Qué hace')} inView stagger={0.02} />
            </Reveal>
            <div className="tool-about-body">
              {seo.about?.map((para, i) => (
                <Reveal key={para.slice(0, 40)} as="p" className="tool-about-p" delay={i * 0.06}>{para}</Reveal>
              ))}
              {seo.features?.length > 0 && (
                <Reveal className="tool-features-block" delay={0.1}>
                  {seo.about?.length > 0 && <h3 className="tool-features-title">{t('What it does', 'Qué hace')}</h3>}
                  <ul className="check-list">
                    {seo.features.map(f => <li key={f}><span className="check-mark" aria-hidden="true">✓</span>{f}</li>)}
                  </ul>
                </Reveal>
              )}
            </div>
          </section>
        )}

        {/* ---------- FAQ (same card as /pro) ---------- */}
        {seo.faq?.length > 0 && (
          <Reveal as="section" className="card faq-card" aria-labelledby="tool-faq-title">
            <h2 id="tool-faq-title" className="card-title faq-card-title">{t('FAQ', 'Preguntas frecuentes')}</h2>
            <div className="stack faq-list" style={{ gap: 8 }}>
              {seo.faq.map(f => (
                <details key={f.q} className="faq">
                  <summary><h3 className="faq-q">{f.q}</h3></summary>
                  <p className="muted" style={{ margin: '8px 0 0', lineHeight: 1.6 }}>{f.a}</p>
                </details>
              ))}
            </div>
            {guide && (
              <Link to={to(`/guides/${guide.slug}`)} className="btn btn-ghost btn-sm faq-guide" style={{ marginTop: 16 }}>
                <span>📖 {t('Read the guide', 'Lee la guía')}: {guide[lang].title}</span> <span className="arrow" aria-hidden="true">→</span>
              </Link>
            )}
          </Reveal>
        )}

        <Feedback tool={id} />

        <Newsletter source={id} />

        <AdSlot slot="tool" />

        <Reveal as="section" style={{ marginTop: 'clamp(48px, 8vw, 96px)' }} aria-labelledby="more-title">
          <h2 id="more-title" className="hub-section-title" style={{ marginBottom: 24 }}>{t('More experiments', 'Más experimentos')}</h2>
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
