/* Performance helpers for modest devices. Nothing here removes motion: entry
   animations, hovers, the loader and the crossfade stay everywhere. It only
   pauses ambient effects nobody can see, and lightens them on weak hardware.

   - html.tab-hidden: the tab is in the background, every CSS animation pauses.
   - .is-offscreen: continuous CSS animations (featured plan ring, hero orb,
     marquee) pause while scrolled out of view.
   - html.lite ("lite mode"): set on devices with 4 or fewer CPU cores, 4 GB
     or less memory, Data Saver on, or when the first seconds run below ~40fps.
     Ambient effects get lighter: the background light only follows touches,
     orbs drift slower, half the particles, no frosted glass on the nav. */

const root = document.documentElement;
const listeners = new Set();
let lite = false;

export const isLite = () => lite;
export function onLiteChange(cb) { listeners.add(cb); return () => listeners.delete(cb); }

function setLite(reason) {
  if (lite) return;
  lite = true;
  root.classList.add('lite');
  root.dataset.lite = reason;
  listeners.forEach(cb => cb(true));
}

// Static signals, known before anything renders.
const cores = navigator.hardwareConcurrency || 0;
const memory = navigator.deviceMemory || 0; // Chromium only
const saveData = navigator.connection?.saveData === true;
if (saveData) setLite('save-data');
else if (cores && cores <= 4) setLite('cores');
else if (memory && memory <= 4) setLite('memory');

// Measured signal: sample frame times for a while once the page is showing.
// A device that can't hold ~40fps under the ambient effects gets lite mode.
export function measureFps(delay = 2600, duration = 1500) {
  if (lite || document.hidden) return;
  setTimeout(() => {
    if (lite || document.hidden) return;
    let frames = 0, start = 0;
    const tick = t => {
      if (!start) start = t;
      frames++;
      if (t - start < duration) requestAnimationFrame(tick);
      else if (frames / ((t - start) / 1000) < 40) setLite('fps');
    };
    requestAnimationFrame(tick);
  }, delay);
}

// Background tab: pause every CSS animation (rAF loops stop on their own).
const syncHidden = () => root.classList.toggle('tab-hidden', document.hidden);
document.addEventListener('visibilitychange', syncHidden);
syncHidden();

// Continuous CSS animations pause while off screen. New elements (route
// changes) are picked up by a MutationObserver.
const OFFSCREEN = '.pro-plan.is-featured, .hub-hero-orb, .marquee';
const io = new IntersectionObserver(entries => {
  for (const e of entries) e.target.classList.toggle('is-offscreen', !e.isIntersecting);
});
const seen = new WeakSet();
const scan = () => document.querySelectorAll(OFFSCREEN).forEach(el => { if (!seen.has(el)) { seen.add(el); io.observe(el); } });
let pending = 0;
export function watchOffscreen() {
  scan();
  // Batched to one scan per frame: tools re-render often.
  new MutationObserver(() => { if (!pending) pending = requestAnimationFrame(() => { pending = 0; scan(); }); })
    .observe(document.body, { childList: true, subtree: true });
}
