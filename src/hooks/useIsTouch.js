import { useSyncExternalStore } from 'react';

// Touch-first devices get their own motion language (scroll- and
// tap-driven) instead of a watered-down copy of the cursor effects.
const query = '(pointer: coarse)';
const subscribe = cb => {
  const mql = window.matchMedia(query);
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
};

export default function useIsTouch() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}
