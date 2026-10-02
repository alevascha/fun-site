import { createContext, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { experiments } from './experiments.js';
import { ES, PAGE_PATHS } from './seo-es.js';
import { GUIDES } from './guides.js';

/* Minimal i18n. Spanish routes live under /es with translated slugs and
   render inside LangProvider (components/LangProvider.jsx); components call
   t('English', 'Español'). English is the default everywhere. */

export const LangContext = createContext('en');

// English path → Spanish path for every page that has one.
const EN_TO_ES = new Map([
  ...Object.entries(PAGE_PATHS),
  ...experiments.filter(e => ES[e.id]).map(e => [e.path, `/es/${ES[e.id].slug}`]),
  ...GUIDES.map(g => [`/guides/${g.slug}`, `/es/guias/${g.es.slug}`]),
]);
const ES_TO_EN = new Map([...EN_TO_ES].map(([en, es]) => [es, en]));

export function localize(enPath, lang) {
  if (lang !== 'es') return enPath;
  return EN_TO_ES.get(enPath) || enPath;
}

/* The same page in the other language (used by the header switcher). */
export function counterpart(pathname) {
  const clean = pathname.replace(/\/$/, '') || '/';
  if (ES_TO_EN.has(clean)) return { lang: 'en', path: ES_TO_EN.get(clean) };
  if (EN_TO_ES.has(clean)) return { lang: 'es', path: EN_TO_ES.get(clean) };
  return clean.startsWith('/es') ? { lang: 'en', path: '/' } : { lang: 'es', path: '/es' };
}

export function useLang() {
  const lang = useContext(LangContext);
  return useMemo(() => ({
    lang,
    t: (en, es) => (lang === 'es' && es != null ? es : en),
    to: enPath => localize(enPath, lang),
    // Tool name/description in the current language.
    name: exp => (lang === 'es' && ES[exp.id] ? ES[exp.id].name : exp.title),
    blurb: exp => (lang === 'es' && ES[exp.id] ? ES[exp.id].card : exp.description),
  }), [lang]);
}

export function useCounterpart() {
  const { pathname } = useLocation();
  return counterpart(pathname);
}
