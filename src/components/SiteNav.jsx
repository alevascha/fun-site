import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import Magnetic from './motion/Magnetic';

export default function SiteNav() {
  const { pathname } = useLocation();
  const onHome = pathname === '/';
  // Hides while scrolling down, slides back the moment you scroll up.
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  useMotionValueEvent(scrollY, 'change', y => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 240);
  });

  return (
    <motion.nav
      className="site-nav"
      aria-label="Main"
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: hidden ? -96 : 0, opacity: hidden ? 0 : 1, scale: hidden ? 0.96 : 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to="/" className="site-nav-brand" aria-label="The Fun Lab — home">
        <motion.span className="site-nav-logo" whileHover={{ rotate: -12, scale: 1.08 }} transition={{ type: 'spring', stiffness: 400, damping: 14 }}>
          f
        </motion.span>
        <span className="site-nav-brand-text">The Fun Lab</span>
      </Link>
      <div className="site-nav-links">
        <Link to="/" className="site-nav-link site-nav-link--hide-sm" aria-current={onHome ? 'page' : undefined}>
          {onHome && <motion.span layoutId="nav-pill" className="site-nav-link-bg" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
          Experiments
        </Link>
        <a href="https://www.alevasquez.dev/" className="site-nav-link site-nav-link--hide-sm">Portfolio</a>
      </div>
      <div className="site-nav-actions">
        <Magnetic strength={0.25}>
          <a href="https://www.alevasquez.dev/" target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
            alevasquez.dev <span className="arrow arrow-ne" aria-hidden="true">↗</span>
          </a>
        </Magnetic>
        <Magnetic strength={0.4}><ThemeToggle /></Magnetic>
      </div>
    </motion.nav>
  );
}
