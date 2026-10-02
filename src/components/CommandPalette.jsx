import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { experiments } from '../experiments';
import { GUIDES } from '../guides';
import { counterpart, useLang } from '../i18n';
import { getTheme, setTheme } from '../lib/theme';
import { EASE } from '../lib/motion';
import { track } from '../lib/analytics';

const normalize = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/* ⌘K / Ctrl+K / "/" — jump to any tool, guide or page, or run an action. */
export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const returnFocus = useRef(null);
  const navigate = useNavigate();
  const { lang, t, to, name, blurb } = useLang();

  const items = useMemo(() => {
    const tools = experiments.filter(e => e.active).map(e => ({
      id: e.id, group: t('Tools', 'Herramientas'), icon: e.emoji, label: name(e), hint: blurb(e), run: () => navigate(to(e.path)),
    }));
    const guides = GUIDES.map(g => ({
      id: `guide-${g.slug}`, group: t('Guides', 'Guías'), icon: '📖', label: g[lang].title, hint: g[lang].description, run: () => navigate(to(`/guides/${g.slug}`)),
    }));
    const pages = [
      { id: 'home', icon: '🏠', label: t('All experiments', 'Todos los experimentos'), path: '/' },
      { id: 'guides', icon: '📚', label: t('Guides', 'Guías'), path: '/guides' },
      { id: 'pro', icon: '✦', label: t('Lab Pro for Figma (waitlist)', 'Lab Pro para Figma (lista de espera)'), path: '/pro' },
      { id: 'changelog', icon: '🗞️', label: t("What's new", 'Novedades'), path: '/changelog' },
      { id: 'about', icon: '👋', label: t('About', 'Acerca de'), path: '/about' },
      { id: 'privacy', icon: '🔒', label: t('Privacy policy', 'Política de privacidad'), path: '/privacy' },
    ].map(p => ({ ...p, group: t('Pages', 'Páginas'), run: () => navigate(to(p.path)) }));
    const actions = [
      { id: 'theme', icon: '🌗', label: t('Toggle light / dark mode', 'Cambiar modo claro / oscuro'), run: () => setTheme(getTheme() === 'dark' ? 'light' : 'dark') },
      { id: 'lang', icon: '🌐', label: lang === 'es' ? 'Switch to English' : 'Cambiar a español', run: () => navigate(counterpart(window.location.pathname).path) },
      { id: 'portfolio', icon: '↗', label: t('Open my portfolio', 'Abrir mi portafolio'), run: () => window.open('https://www.alevasquez.dev/', '_blank', 'noopener') },
    ].map(a => ({ ...a, group: t('Actions', 'Acciones') }));
    return [...tools, ...guides, ...pages, ...actions];
  }, [lang, t, to, name, blurb, navigate]);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return items;
    const words = q.split(/\s+/);
    return items
      .map(it => {
        const hay = normalize(`${it.label} ${it.hint || ''} ${it.group}`);
        if (!words.every(w => hay.includes(w))) return null;
        return { it, score: normalize(it.label).startsWith(words[0]) ? 0 : normalize(it.label).includes(words[0]) ? 1 : 2 };
      })
      .filter(Boolean)
      .sort((a, b) => a.score - b.score)
      .map(r => r.it);
  }, [items, query]);

  useEffect(() => {
    const show = () => { setQuery(''); setActive(0); setOpen(true); };
    const onKey = e => {
      const typing = /input|textarea|select/i.test(document.activeElement?.tagName || '') || document.activeElement?.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if (open) setOpen(false); else show(); }
      else if (e.key === '/' && !typing && !open) { e.preventDefault(); show(); }
    };
    const onOpen = show;
    window.addEventListener('keydown', onKey);
    window.addEventListener('funlab:cmdk', onOpen);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('funlab:cmdk', onOpen); };
  }, [open]);

  useEffect(() => {
    if (open) {
      returnFocus.current = document.activeElement;
      requestAnimationFrame(() => inputRef.current?.focus());
      track('Command palette');
    } else {
      returnFocus.current?.focus?.();
    }
  }, [open]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  function choose(item) {
    setOpen(false);
    item.run();
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') { e.preventDefault(); setOpen(false); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive(i => Math.min(results.length - 1, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(i => Math.max(0, i - 1)); }
    else if (e.key === 'Enter' && results[active]) { e.preventDefault(); choose(results[active]); }
    else if (e.key === 'Tab') e.preventDefault(); // keep focus in the dialog
  }

  // Group header shown on the first item of each group.
  const firstOfGroup = new Set(results.filter((it, i) => i === 0 || results[i - 1].group !== it.group).map(it => it.id));

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="cmdk-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={() => setOpen(false)}>
          <motion.div
            className="cmdk"
            role="dialog"
            aria-modal="true"
            aria-label={t('Command palette', 'Paleta de comandos')}
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.25, ease: EASE }}
            onMouseDown={e => e.stopPropagation()}
            onKeyDown={onKeyDown}
          >
            <div className="cmdk-input-row">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
              <input
                ref={inputRef}
                className="cmdk-input"
                value={query}
                onChange={e => { setQuery(e.target.value); setActive(0); }}
                placeholder={t('Search tools, guides, actions…', 'Busca herramientas, guías, acciones…')}
                role="combobox"
                aria-expanded="true"
                aria-controls="cmdk-list"
                aria-activedescendant={results[active] ? `cmdk-${results[active].id}` : undefined}
                autoComplete="off"
                spellCheck={false}
              />
              <kbd>esc</kbd>
            </div>
            <div className="cmdk-list" id="cmdk-list" role="listbox" ref={listRef} data-lenis-prevent>
              {results.length === 0 && <p className="cmdk-empty">{t('Nothing found.', 'No se encontró nada.')}</p>}
              {results.map((it, i) => {
                const header = firstOfGroup.has(it.id) ? it.group : null;
                return (
                  <div key={it.id}>
                    {header && <div className="cmdk-group" role="presentation">{header}</div>}
                    <div
                      id={`cmdk-${it.id}`}
                      role="option"
                      aria-selected={i === active}
                      data-index={i}
                      className="cmdk-item"
                      onMouseMove={() => setActive(i)}
                      onClick={() => choose(it)}
                    >
                      {i === active && <motion.span layoutId="cmdk-active" className="cmdk-item-bg" transition={{ type: 'spring', stiffness: 600, damping: 40 }} />}
                      <span className="cmdk-icon" aria-hidden="true">{it.icon}</span>
                      <span className="cmdk-text">
                        <span className="cmdk-label">{it.label}</span>
                        {it.hint && <span className="cmdk-hint">{it.hint}</span>}
                      </span>
                      {i === active && <span className="cmdk-enter" aria-hidden="true">↵</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="cmdk-foot" aria-hidden="true">
              <span><kbd>↑</kbd><kbd>↓</kbd> {t('navigate', 'navegar')}</span>
              <span><kbd>↵</kbd> {t('open', 'abrir')}</span>
              <span><kbd>esc</kbd> {t('close', 'cerrar')}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
