import { useCallback, useEffect, useRef, useState } from 'react';
import { track } from '../lib/analytics';

export default function useCopy(timeout = 1400) {
  const [copied, setCopied] = useState(null);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = useCallback((text, key = 'default', event) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(key);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(null), timeout);
      if (event) track(event.name, event.props);
    }).catch(() => {});
  }, [timeout]);
  return [copied, copy];
}
