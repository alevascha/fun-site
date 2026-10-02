// "New" badge logic: an experiment is new while it's recent (added within
// NEW_WINDOW_DAYS) and this visitor hasn't opened it yet.
const KEY = 'funlab:opened';
const NEW_WINDOW_DAYS = 45;

function readOpened() {
  try { return new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch { return new Set(); }
}

export function markOpened(id) {
  try {
    const opened = readOpened();
    if (opened.has(id)) return;
    opened.add(id);
    localStorage.setItem(KEY, JSON.stringify([...opened]));
  } catch { /* storage blocked */ }
}

export function isNew(exp, now = Date.now()) {
  if (!exp.addedAt || !exp.active) return false;
  const age = (now - new Date(exp.addedAt + 'T00:00:00').getTime()) / 86400000;
  return age <= NEW_WINDOW_DAYS && !readOpened().has(exp.id);
}
