import { Link } from 'react-router-dom';

export default function SiteNav() {
  return (
    <nav className="site-nav">
      <Link to="/" className="site-nav-brand">🧪 The Fun Lab</Link>
      <a href="https://www.alevasquez.dev/" target="_blank" rel="noopener noreferrer" className="site-nav-pill">
        alevasquez.dev <span aria-hidden="true">↗</span>
      </a>
    </nav>
  );
}
