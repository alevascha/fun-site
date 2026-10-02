// Fades out the boot loader from index.html. Called once the first route
// (including lazily loaded tool pages) has actually rendered.
let dismissed = false;

export function dismissBootLoader() {
  if (dismissed) return;
  dismissed = true;
  const el = document.getElementById('boot-loader');
  if (!el) return;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    el.classList.add('done');
    setTimeout(() => el.remove(), 600);
  }));
}
