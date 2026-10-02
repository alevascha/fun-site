import { useEffect } from 'react';
import { dismissBootLoader } from '../lib/boot';

/* Mini version of the boot loader, shown while a tool's code is loading
   after a client-side navigation. Fades in after 200ms so fast loads never
   flash it. */
export function RouteLoader() {
  return (
    <div className="route-loader" role="status" aria-live="polite">
      <div className="bl-orbit route-loader-orbit">
        <span className="bl-ring" /><span className="bl-ring" /><span className="bl-ring" />
        <div className="bl-logo" aria-hidden="true">f</div>
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}

/* Rendered inside <Suspense>, so its effect only runs once the real page
   (not the fallback) has mounted. */
export function BootDone() {
  useEffect(() => { dismissBootLoader(); }, []);
  return null;
}
