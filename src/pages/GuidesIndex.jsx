import { Link } from 'react-router-dom';
import Background from '../components/Background';
import SiteNav from '../components/SiteNav';
import SiteFooter from '../components/SiteFooter';
import SplitText from '../components/motion/SplitText';
import TokenOrbit from '../components/motion/TokenOrbit';
import Newsletter from '../components/Newsletter';
import { Reveal } from '../components/ui';
import usePageMeta from '../hooks/usePageMeta';
import { GUIDES } from '../guides';
import { useLang } from '../i18n';
import { getExperiment } from '../experiments';

export default function GuidesIndex() {
  const { lang, t, to, name } = useLang();
  usePageMeta({
    title: t("Guides: color, accessibility, type & tokens — Ale's Fun Lab", "Guías: color, accesibilidad, tipografía y tokens — Ale's Fun Lab"),
    description: t('Short, practical guides on color contrast, fluid typography, design tokens and designing for translation — each with a free tool.', 'Guías breves y prácticas sobre contraste de color, tipografía fluida, design tokens y diseño para la traducción, cada una con una herramienta gratuita.'),
    path: to('/guides'),
    image: '/og/home.png',
    alternates: { en: '/guides', es: '/es/guias' },
  });

  return (
    <div className="page">
      <Background />
      <div className="page-inner">
        <SiteNav />
        <header className="tool-header guides-header">
          <TokenOrbit className="guides-orbit" />
          <Link to={to('/')} className="back-link"><span className="arrow" aria-hidden="true">←</span> {t('Back to the lab', 'Volver al lab')}</Link>
          <SplitText key={lang} as="h1" className="tool-title" text={t('Guides', 'Guías')} delay={0.1} stagger={0.04} reactive />
          <p className="tool-desc">{t('Short, practical answers to the questions behind each tool.', 'Respuestas breves y prácticas a las preguntas detrás de cada herramienta.')}</p>
        </header>
        <main className="card-grid">
          {GUIDES.map((g, i) => {
            const tool = getExperiment(g.tool);
            return (
              <Reveal key={g.slug} delay={i * 0.05}>
                <Link to={to(`/guides/${g.slug}`)} className="guide-card">
                  <span className="guide-card-meta">📖 {g.minutes} min · {tool.emoji} {name(tool)}</span>
                  <h2 className="exp-card-title" style={{ fontSize: 26 }}>{g[lang].title}</h2>
                  <p className="exp-card-desc">{g[lang].description}</p>
                </Link>
              </Reveal>
            );
          })}
        </main>
        <Newsletter source="guides" />
        <SiteFooter />
      </div>
    </div>
  );
}
