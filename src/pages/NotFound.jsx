import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Background from '../components/Background';
import SiteNav from '../components/SiteNav';
import { experiments, SITE } from '../experiments';
import { useLang } from '../i18n';
import SiteFooter from '../components/SiteFooter';

export default function NotFound() {
  const { t, to, name } = useLang();
  useEffect(() => {
    document.title = `${t('Page not found', 'Página no encontrada')} — ${SITE.name}`;
    let robots = document.head.querySelector('meta[name="robots"]');
    if (!robots) { robots = document.createElement('meta'); robots.name = 'robots'; document.head.appendChild(robots); }
    robots.content = 'noindex, follow';
    return () => { robots.content = 'index, follow, max-image-preview:large'; };
  }, [t]);

  return (
    <div className="page">
      <Background />
      <div className="page-inner">
        <SiteNav />
        <header className="tool-header">
          <Link to={to('/')} className="back-link"><span className="arrow" aria-hidden="true">←</span> {t('Back to the lab', 'Volver al lab')}</Link>
          <h1 className="tool-title">{t('Page not found', 'Página no encontrada')}</h1>
          <p className="tool-desc">{t('That page doesn’t exist (yet). Here’s everything in the lab:', 'Esa página no existe (todavía). Esto es todo lo que hay en el lab:')}</p>
        </header>
        <main className="more-grid">
          {experiments.filter(e => e.active).map(e => (
            <Link key={e.id} to={to(e.path)} className="more-link"><span className="more-link-emoji" aria-hidden="true">{e.emoji}</span><span style={{ flex: 1 }}>{name(e)}</span></Link>
          ))}
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
