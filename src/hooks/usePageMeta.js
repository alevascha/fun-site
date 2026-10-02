import { useEffect } from 'react';
import { SITE } from '../experiments';

function setMeta(attr, key, value) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

// Keeps <title> and the share tags in sync on client-side navigation.
// Crawlers get the same values from the prerendered HTML for each route.
function setAlternates(alternates) {
  document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach(l => l.remove());
  if (!alternates) return;
  const add = (hreflang, href) => {
    const l = document.createElement('link');
    l.rel = 'alternate'; l.hreflang = hreflang; l.href = SITE.url + href;
    document.head.appendChild(l);
  };
  add('en', alternates.en);
  add('es', alternates.es);
  add('x-default', alternates.en);
}

export default function usePageMeta({ title, description, path, image, alternates }) {
  useEffect(() => { setAlternates(alternates); }, [alternates?.en, alternates?.es]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.title = title;
    const url = SITE.url + path;
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', SITE.url + image);
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', SITE.url + image);
    const canonical = document.head.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', url);
  }, [title, description, path, image]);
}
