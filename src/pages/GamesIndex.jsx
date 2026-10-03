import { Link } from 'react-router-dom';
import Background from '../components/Background';
import SiteNav from '../components/SiteNav';
import SiteFooter from '../components/SiteFooter';
import SplitText from '../components/motion/SplitText';
import Newsletter from '../components/Newsletter';
import usePageMeta from '../hooks/usePageMeta';
import { experiments } from '../experiments';
import { isNew } from '../lib/seen';
import { useLang } from '../i18n';
import { ExpCard } from './Home';

// Games only: the same cards as the home grid, filtered to the Games category.
export default function GamesIndex() {
  const { lang, t, to } = useLang();
  usePageMeta({
    title: t("Games for designers: color & contrast — Ale's Fun Lab", "Juegos para diseñadores: color y contraste — Ale's Fun Lab"),
    description: t('Quick, free browser games that train your eye for color and accessible contrast. Play on your phone or desktop.', 'Juegos rápidos y gratuitos en el navegador que entrenan tu ojo para el color y el contraste accesible. Juega en el teléfono o en la computadora.'),
    path: to('/games'),
    image: '/og/home.png',
    alternates: { en: '/games', es: '/es/juegos' },
  });
  const games = experiments.filter(e => e.active && e.category === 'Games');

  return (
    <div className="page">
      <Background />
      <div className="page-inner">
        <SiteNav />
        <header className="tool-header">
          <Link to={to('/')} className="back-link"><span className="arrow" aria-hidden="true">←</span> {t('Back to the lab', 'Volver al lab')}</Link>
          <SplitText key={lang} as="h1" className="tool-title" text={t('Games', 'Juegos')} delay={0.1} stagger={0.04} reactive />
          <p className="tool-desc">{t('Train your eye for color and contrast in a couple of minutes a day.', 'Entrena tu ojo para el color y el contraste en un par de minutos al día.')}</p>
        </header>
        <main className="card-grid">
          {games.map((exp, i) => <ExpCard key={exp.id} exp={exp} index={i} fresh={isNew(exp)} />)}
        </main>
        <Newsletter source="games" />
        <SiteFooter />
      </div>
    </div>
  );
}
