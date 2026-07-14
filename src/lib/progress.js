// All localStorage access is wrapped — Safari private browsing (and some
// locked-down embedded browsers) throw on storage access rather than just
// silently no-op-ing, and a thrown error here must never crash a session.
const memoryFallback = new Map();
const KEY = 'meditation-app:progress:v1';

let isPersistent = null;

export function checkPersistence() {
  if (isPersistent !== null) return isPersistent;
  try {
    localStorage.setItem('__probe__', '1');
    localStorage.removeItem('__probe__');
    isPersistent = true;
  } catch {
    isPersistent = false;
  }
  return isPersistent;
}

function safeGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return memoryFallback.has(key) ? memoryFallback.get(key) : fallback;
    return JSON.parse(raw);
  } catch {
    return memoryFallback.has(key) ? memoryFallback.get(key) : fallback;
  }
}

function safeSet(key, value) {
  memoryFallback.set(key, value);
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

const DEFAULT_STATE = { history: [], totalMinutes: 0, currentStreak: 0, lastCompletedDate: null };

export function loadProgress() {
  return safeGet(KEY, DEFAULT_STATE);
}

function daysBetween(a, b) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((new Date(b) - new Date(a)) / msPerDay);
}

export function recordSessionComplete({ sessionId, title, category, minutes }) {
  const state = loadProgress();
  const today = new Date().toISOString().slice(0, 10);

  let streak = state.currentStreak;
  if (state.lastCompletedDate === today) {
    // already logged one today, streak unchanged
  } else if (state.lastCompletedDate && daysBetween(state.lastCompletedDate, today) === 1) {
    streak += 1;
  } else {
    streak = 1;
  }

  const next = {
    history: [...state.history, { sessionId, title, category, minutes, date: today }].slice(-200),
    totalMinutes: Math.round((state.totalMinutes + minutes) * 10) / 10,
    currentStreak: streak,
    lastCompletedDate: today,
  };
  safeSet(KEY, next);
  return next;
}
