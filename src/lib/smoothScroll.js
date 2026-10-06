import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

let lenis = null;

/* Inertial wheel/trackpad scrolling (Lenis). Touch keeps native scrolling,
   which already has momentum; reduced-motion users keep native scrolling. */
export function startSmoothScroll() {
  if (lenis || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return lenis;
  lenis = new Lenis({
    lerp: 0.09,
    wheelMultiplier: 0.9,
    smoothWheel: true,
    syncTouch: false,
    autoRaf: true,
    anchors: { offset: -96 },
  });
  return lenis;
}

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  else window.scrollTo(0, 0);
}

// Animated "back to top" (instant for reduced motion, where Lenis is off).
export function glideToTop() {
  if (lenis) lenis.scrollTo(0, { duration: 1.1, force: true });
  else window.scrollTo({ top: 0, behavior: 'auto' });
}

// Bring a game board into view when play starts: centered when it fits on
// screen, otherwise its top just under the floating header.
export function glideTo(el, header = 84) {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY;
  const target = Math.max(0, top - Math.max(header, (window.innerHeight - el.offsetHeight) / 2));
  if (lenis) lenis.scrollTo(target, { duration: 0.8, force: true });
  else window.scrollTo({ top: target, behavior: 'smooth' });
}

// Pause page smooth-scrolling (e.g. while the pointer is over an embedded
// page, so the page's momentum doesn't keep moving underneath it).
export function holdSmoothScroll(hold) {
  if (!lenis) return;
  if (hold) lenis.stop();
  else lenis.start();
}
