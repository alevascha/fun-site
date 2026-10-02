// The initial theme is applied by the inline script in index.html (before
// first paint, so there's no flash). These helpers keep it in sync after.
const KEY = 'funlab:theme';

export function getTheme() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

export function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem(KEY, theme); } catch { /* storage blocked */ }
  window.dispatchEvent(new CustomEvent('funlab:theme', { detail: theme }));
}
