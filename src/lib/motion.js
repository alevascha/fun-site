export const EASE = [0.16, 1, 0.3, 1];

// Huge top margin: anything above the viewport also counts as "in view", so
// content you jumped past (anchor links, fast flicks, back-navigation scroll
// restore) is never left invisible. Bottom inset delays reveals slightly.
export const REVEAL_VIEWPORT = { once: true, margin: '100000px 0px -60px 0px' };
