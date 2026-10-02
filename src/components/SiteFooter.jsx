import { Link } from 'react-router-dom';
import { useLang } from '../i18n';

export default function SiteFooter({ children }) {
  const { lang, t, to } = useLang();
  return (
    <footer className="site-footer">
      <span>{t('Built for fun by Alejandro Vasquez', 'Hecho por diversión por Alejandro Vasquez')}</span>
      <nav aria-label={t('Footer', 'Pie de página')} className="footer-links">
        <Link to={to('/guides')}>{t('Guides', 'Guías')}</Link>
        <Link to={to('/changelog')}>{t("What's new", 'Novedades')}</Link>
        <Link to={to('/pro')}>Pro</Link>
        <Link to={to('/about')}>{t('About', 'Acerca de')}</Link>
        <Link to={to('/privacy')}>{t('Privacy', 'Privacidad')}</Link>
        <a href={lang === 'es' ? '/es/rss.xml' : '/rss.xml'}>RSS</a>
        {children}
      </nav>
    </footer>
  );
}
