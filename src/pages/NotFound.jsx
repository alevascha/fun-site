import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Background from '../components/Background';
import SiteNav from '../components/SiteNav';
import { experiments, SITE } from '../experiments';

export default function NotFound() {
  useEffect(() => {
    document.title = `Page not found — ${SITE.name}`;
    let robots = document.head.querySelector('meta[name="robots"]');
    if (!robots) { robots = document.createElement('meta'); robots.name = 'robots'; document.head.appendChild(robots); }
    robots.content = 'noindex, follow';
    return () => { robots.content = 'index, follow, max-image-preview:large'; };
  }, []);

  return (
    <div className="page">
      <Background />
      <div className="page-inner">
        <SiteNav />
        <header className="tool-header">
          <Link to="/" className="back-link"><span className="arrow" aria-hidden="true">←</span> Back to the lab</Link>
          <h1 className="tool-title">Page not found</h1>
          <p className="tool-desc">That experiment doesn’t exist (yet). Here’s everything in the lab:</p>
        </header>
        <main className="more-grid">
          {experiments.filter(e => e.active).map(e => (
            <Link key={e.id} to={e.path} className="more-link"><span className="more-link-emoji" aria-hidden="true">{e.emoji}</span><span style={{ flex: 1 }}>{e.title}</span></Link>
          ))}
        </main>
      </div>
    </div>
  );
}
