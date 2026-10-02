import { motion } from 'framer-motion';
import { useLang } from '../i18n';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

/* Header button that opens the command palette (also ⌘K / Ctrl+K or "/"). */
export default function CommandHint() {
  const { t } = useLang();
  return (
    <motion.button
      type="button"
      className="cmd-hint"
      onClick={() => window.dispatchEvent(new CustomEvent('funlab:cmdk'))}
      whileTap={{ scale: 0.92 }}
      aria-label={t('Search tools and guides', 'Buscar herramientas y guías')}
      aria-keyshortcuts={isMac ? 'Meta+K' : 'Control+K'}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
      <kbd className="hide-sm">{isMac ? '⌘K' : 'Ctrl K'}</kbd>
    </motion.button>
  );
}
