import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE } from '../experiments';
import { useLang } from '../i18n';

/* A Google AdSense display unit. Renders nothing until SITE.adsenseClient and
   the slot id are set. Space is reserved up front (min-height) so the ad
   doesn't push content around when it loads (no layout shift). In a
   single-page app each new <ins> must be pushed once, hence the key on the
   current path. */
export default function AdSlot({ slot, label: labelProp, minHeight = 120 }) {
  const { t } = useLang();
  const label = labelProp ?? t('Advertisement', 'Publicidad');
  const { pathname } = useLocation();
  const ref = useRef(null);
  const id = SITE.adSlots[slot];

  useEffect(() => {
    if (!SITE.adsenseClient || !id || !ref.current) return;
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch { /* blocked or not loaded */ }
  }, [id, pathname]);

  if (!SITE.adsenseClient || !id) return null;

  return (
    <aside className="ad-slot" aria-label={label} style={{ minHeight }}>
      <span className="ad-slot-label">{label}</span>
      <ins
        key={pathname}
        ref={ref}
        className="adsbygoogle"
        style={{ display: 'block', minHeight: minHeight - 24 }}
        data-ad-client={SITE.adsenseClient}
        data-ad-slot={id}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
