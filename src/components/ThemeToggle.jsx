import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getTheme, setTheme } from '../lib/theme';
import { track } from '../lib/analytics';

const Moon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a.6.6 0 0 0-.8-.7A9.5 9.5 0 1 0 21.2 15.4a.6.6 0 0 0-.7-.8Z" />
  </svg>
);
const Sun = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4.2" fill="currentColor" stroke="none" />
    <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
  </svg>
);

export default function ThemeToggle() {
  const [theme, setLocal] = useState(getTheme);

  useEffect(() => {
    const onChange = e => setLocal(e.detail);
    window.addEventListener('funlab:theme', onChange);
    return () => window.removeEventListener('funlab:theme', onChange);
  }, []);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    track('Theme toggle', { theme: next });
  }

  return (
    <motion.button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.9 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          style={{ display: 'grid' }}
          initial={{ y: 18, rotate: -90, opacity: 0 }}
          animate={{ y: 0, rotate: 0, opacity: 1 }}
          exit={{ y: -18, rotate: 90, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          {theme === 'dark' ? <Moon /> : <Sun />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
