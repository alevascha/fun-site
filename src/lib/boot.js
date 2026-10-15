// Fades out the boot loader from index.html once the first route (including
// lazily loaded tool pages) has rendered. On the first visit of a session it
// stays at least INTRO_MS so the whole animation plays, like the portfolio
// intro; if the app takes longer, it stays until the app is ready. On later
// loads it only ever shows when the app is slow (it fades in after 0.15s, so
// a fast load removes it before it appears), so a page is never left blank.
const INTRO_MS = 2000;
const KEY = 'funlab:intro';
let dismissed = false;

export function dismissBootLoader() {
  if (dismissed) return;
  dismissed = true;
  const el = document.getElementById('boot-loader');
  if (!el) return;
  let seen = false;
  try { seen = !!sessionStorage.getItem(KEY); } catch { /* storage blocked */ }
  try { sessionStorage.setItem(KEY, '1'); } catch { /* storage blocked */ }
  // performance.now() counts from the start of the page load.
  const wait = seen ? 0 : Math.max(0, INTRO_MS - performance.now());
  setTimeout(() => requestAnimationFrame(() => requestAnimationFrame(() => {
    const root = document.documentElement;
    // Crossfade into the site only if the loader was actually on screen.
    const shown = parseFloat(getComputedStyle(el).opacity) > 0.05;
    el.classList.add('done');
    if (shown) root.classList.add('site-reveal');
    setTimeout(() => { el.remove(); root.classList.remove('site-reveal'); }, shown ? 1000 : 0);
  })), wait);
}
