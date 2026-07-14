// Keeps the screen from locking during a session. Wake Lock only prevents
// screen-lock — it does NOT prevent iOS Safari from suspending JS/speech
// when the tab is backgrounded (app-switch, notification pull-down, etc.);
// that's a hard platform limitation with no web-API workaround, since
// SpeechSynthesis audio doesn't get the Media Session background exemption
// a real <audio> element would. Callers should pair this with an honest
// "keep this tab open and foregrounded" notice, not rely on it alone.
export const SUPPORTS_WAKE_LOCK = typeof navigator !== 'undefined' && 'wakeLock' in navigator;

let sentinel = null;

export async function requestWakeLock(onRelease) {
  if (!SUPPORTS_WAKE_LOCK) return { ok: false, reason: 'unsupported' };
  try {
    sentinel = await navigator.wakeLock.request('screen');
    sentinel.addEventListener('release', () => onRelease?.());
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err.message };
  }
}

export async function reacquireWakeLockIfNeeded(sessionActive, onRelease) {
  if (!SUPPORTS_WAKE_LOCK || !sessionActive || sentinel) return;
  await requestWakeLock(onRelease);
}

export function releaseWakeLock() {
  sentinel?.release().catch(() => {});
  sentinel = null;
}
