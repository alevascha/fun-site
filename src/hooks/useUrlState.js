import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

/* Mirrors a tool's settings into the query string (debounced, replace — no
   history spam), so the current URL always reproduces what's on screen.
   `serialize` returns a plain object of string values; empty ones are
   dropped. The first render is skipped so a clean URL stays clean until the
   person changes something. */
export default function useUrlState(serialize, deps) {
  const [, setParams] = useSearchParams();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const id = setTimeout(() => {
      const entries = Object.entries(serialize()).filter(([, v]) => v !== '' && v != null);
      setParams(Object.fromEntries(entries), { replace: true });
    }, 250);
    return () => clearTimeout(id);
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}

export const num = (v, fallback, min = -Infinity, max = Infinity) => {
  const n = Number(v);
  return v != null && v !== '' && Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};
