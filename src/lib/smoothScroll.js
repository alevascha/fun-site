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
