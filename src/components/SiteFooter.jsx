import { Link } from 'react-router-dom';
import { useLang } from '../i18n';
import { track } from '../lib/analytics';
import { FOOTER_LINKS, PORTFOLIO_URL } from '../footer-links';

// Links come from src/footer-links.js (shared with the prerendered footer).
export default function SiteFooter({ children }) {
  const { lang, t, to } = useLang();
  return (
    <footer className="site-footer">
      <span>{t('Built for fun by', 'Hecho por diversión por')} <a href={`${PORTFOLIO_URL}/`}>Alejandro Vasquez</a></span>
      <nav aria-label={t('Footer', 'Pie de página')} className="footer-links">
        {FOOTER_LINKS.map(l => {
          const label = lang === 'es' ? l.es : l.en;
          const onClick = l.track ? () => track(l.track, { from: 'footer' }) : undefined;
          return l.path
            ? <Link key={l.path} to={to(l.path)} onClick={onClick}>{label}</Link>
            : <a key={l.href} href={lang === 'es' && l.hrefEs ? l.hrefEs : l.href} onClick={onClick}>{label}</a>;
        })}
        {children}
      </nav>
    </footer>
  );
}
