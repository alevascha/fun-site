import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Background from '../components/Background';
import SiteNav from '../components/SiteNav';
import SiteFooter from '../components/SiteFooter';
import SplitText from '../components/motion/SplitText';
import TokenOrbit from '../components/motion/TokenOrbit';
import Magnetic from '../components/motion/Magnetic';
import Newsletter from '../components/Newsletter';
import { Reveal } from '../components/ui';
import usePageMeta from '../hooks/usePageMeta';
import { useLang } from '../i18n';
import { EASE } from '../lib/motion';
import { experiments } from '../experiments';
import { FREE_USES, PRO_PLUGINS } from '../pro-content';
import { PLUGIN_PAGES } from '../plugin-pages';
import { track } from '../lib/analytics';

const accentFor = p => p.accent || experiments.find(e => e.path === p.tool)?.accent || '#cd57ff';

export default function PluginsIndex() {
  const { lang, t, to } = useLang();
  usePageMeta({
    title: t("Figma plugins for design systems and accessibility - Ale's Fun Lab", "Plugins de Figma para design systems y accesibilidad - Ale's Fun Lab"),
    description: t(`13 Figma plugins for design systems: palettes, contrast, type, tokens, accessibility, modes, breakpoints, specs, copy and icons. ${FREE_USES} free uses each.`, `13 plugins de Figma para design systems: paletas, contraste, tipografía, tokens, accesibilidad, modos, breakpoints, specs, textos e íconos. ${FREE_USES} usos gratis cada uno.`),
    path: to('/plugins'),
    image: '/og/home.png',
    alternates: { en: '/plugins', es: '/es/plugins' },
  });

  return (
    <div className="page">
      <Background />
      <div className="page-inner">
        <SiteNav />
        <header className="tool-header guides-header">
          <TokenOrbit className="guides-orbit" />
          <Link to={to('/')} className="back-link"><span className="arrow" aria-hidden="true">←</span> {t('Back to the lab', 'Volver al lab')}</Link>
          <SplitText key={lang} as="h1" className="tool-title" text={t('Figma plugins', 'Plugins de Figma')} delay={0.1} stagger={0.04} reactive />
          <p className="tool-desc">{t(`The lab’s tools, working inside your Figma files: from a brand color to a token pipeline, from contrast to the accessibility handoff. Every plugin is free to try with ${FREE_USES} uses.`, `Las herramientas del lab, trabajando dentro de tus archivos de Figma: de un color de marca a un flujo de tokens, del contraste a la entrega de accesibilidad. Cada plugin se prueba gratis con ${FREE_USES} usos.`)}</p>
          <motion.div className="hub-hero-actions" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.3 }}>
            <Magnetic>
              <Link to={to('/pro') + '#pricing'} className="btn btn-primary" onClick={() => track('Plugins CTA', { cta: 'pricing' })}>
                {t('See pricing', 'Ver precios')} <span className="arrow" aria-hidden="true">›</span>
              </Link>
            </Magnetic>
            <Magnetic>
              <Link to={to('/pro') + '#waitlist'} className="btn btn-chip" onClick={() => track('Plugins CTA', { cta: 'waitlist' })}>
                <span className="gradient-dot" /> {t('Join the waitlist', 'Únete a la lista de espera')}
              </Link>
            </Magnetic>
          </motion.div>
        </header>
        <main className="card-grid plugin-grid">
          {PRO_PLUGINS.map((p, i) => {
            const page = PLUGIN_PAGES[p.id];
            return (
              <Reveal key={p.id} delay={i * 0.05}>
                <Link to={to(`/plugins/${page.slug}`)} className="guide-card plugin-card" style={{ '--item-accent': accentFor(p) }}>
                  <span className="plugin-card-top">
                    <img src={`/plugin-assets/${p.id}/icon.png`} alt="" width="48" height="48" className="plugin-card-icon" loading="lazy" />
                    <span className="guide-card-meta">{t('Figma plugin', 'Plugin de Figma')}{p.tool ? ' · ' + t('free web version', 'versión web gratis') : ''}</span>
                  </span>
                  <h2 className="exp-card-title" style={{ fontSize: 28 }}>{p[lang].name}</h2>
                  <p className="exp-card-desc">{p[lang].pitch}</p>
                  <span className="plugin-card-link">{t('See the plugin', 'Ver el plugin')} <span className="arrow" aria-hidden="true">→</span></span>
                </Link>
              </Reveal>
            );
          })}
        </main>
        <div id="waitlist" style={{ scrollMarginTop: 96 }}>
          <Newsletter source="plugins" waitlist />
        </div>
        <SiteFooter />
      </div>
    </div>
  );
}
