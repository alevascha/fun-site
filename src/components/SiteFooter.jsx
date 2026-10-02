import { Link } from 'react-router-dom';

export default function SiteFooter({ children }) {
  return (
    <footer className="site-footer">
      <span>Built for fun by Alejandro Vasquez</span>
      <nav aria-label="Footer" className="footer-links">
        <Link to="/about">About</Link>
        <Link to="/privacy">Privacy</Link>
        {children}
      </nav>
    </footer>
  );
}
