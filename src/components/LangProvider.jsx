import { useEffect } from 'react';
import { LangContext } from '../i18n';

export default function LangProvider({ lang, children }) {
  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem('funlab:lang', lang); } catch { /* storage blocked */ }
  }, [lang]);
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}
