// Robust wrapper around window.speechSynthesis addressing the real,
// well-documented cross-browser bugs in the Web Speech API:
//  - utterances need to stay referenced or Chrome can silently GC/drop them
//  - the voice list is frequently empty on first call; must wait for
//    'onvoiceschanged' (with a timeout fallback for engines that never fire it)
//  - long utterances (~15s+) can silently stop in Chrome — mitigated upstream
//    by keeping authored lines short, chunked, and dispatched sequentially
//  - a stale cancelled queue's callbacks must never affect a newer queue
//  - speechSynthesis can go idle-silent after a pause — a keep-alive ping helps
export const SUPPORTS_SPEECH = typeof window !== 'undefined' && 'speechSynthesis' in window;

const pendingUtterances = new Set();
let generation = 0;
let keepAliveTimer = null;

function startKeepAlive() {
  if (keepAliveTimer || !SUPPORTS_SPEECH) return;
  keepAliveTimer = setInterval(() => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
      speechSynthesis.resume();
    }
  }, 10000);
}

function stopKeepAlive() {
  clearInterval(keepAliveTimer);
  keepAliveTimer = null;
}

export function ensureVoicesLoaded(timeoutMs = 2000) {
  if (!SUPPORTS_SPEECH) return Promise.resolve([]);
  return new Promise((resolve) => {
    const existing = speechSynthesis.getVoices();
    if (existing.length) return resolve(existing);
    const timer = setTimeout(() => resolve(speechSynthesis.getVoices()), timeoutMs);
    speechSynthesis.onvoiceschanged = () => {
      clearTimeout(timer);
      resolve(speechSynthesis.getVoices());
    };
  });
}

function scoreVoice(v) {
  let score = 0;
  // Offline reliability outweighs name-based quality signals — a "better"
  // cloud voice that silently fails offline defeats the PWA's offline goal.
  if (v.localService) score += 100;
  if (/natural|neural|premium|enhanced|studio/i.test(v.name)) score += 10;
  if (v.lang.startsWith('en')) score += 5;
  return score;
}

export function pickBestVoice(voices, preferredURI) {
  if (!voices.length) return null;
  if (preferredURI) {
    const preferred = voices.find((v) => v.voiceURI === preferredURI);
    if (preferred) return preferred;
  }
  return [...voices].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0];
}

/** Must be called synchronously inside a user-gesture handler (e.g. the
 * "Begin Session" onClick), before any `await`, or iOS Safari will not treat
 * a later async speak() call as gesture-attached. */
export function unlockSpeech() {
  if (!SUPPORTS_SPEECH) return;
  speechSynthesis.cancel();
  const unlock = new SpeechSynthesisUtterance(' ');
  unlock.volume = 0;
  pendingUtterances.add(unlock);
  unlock.onend = unlock.onerror = () => pendingUtterances.delete(unlock);
  speechSynthesis.speak(unlock);
}

export function stopAllSpeech() {
  generation++;
  if (SUPPORTS_SPEECH) speechSynthesis.cancel();
  pendingUtterances.clear();
  stopKeepAlive();
}

/**
 * Speak one line and invoke onDone when it finishes (or immediately, with
 * onDone({ skipped: true }), if speech is unsupported/unavailable). Call
 * stopAllSpeech() to cancel everything in flight — individual lines aren't
 * cancelled one at a time, the whole queue's generation is retired instead.
 */
export function speakLine(text, { voice, rate = 0.9, pitch = 1, volume = 1, onError } = {}, onDone) {
  if (!SUPPORTS_SPEECH) {
    onDone({ skipped: true });
    return;
  }
  const myGen = generation;
  const utterance = new SpeechSynthesisUtterance(text);
  if (voice) utterance.voice = voice;
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = volume;
  pendingUtterances.add(utterance);
  startKeepAlive();

  const finish = (result) => {
    pendingUtterances.delete(utterance);
    if (myGen !== generation) return; // stale callback from a cancelled queue — ignore
    onDone(result);
  };
  utterance.onend = () => finish({ skipped: false });
  utterance.onerror = (e) => {
    onError?.(e.error);
    finish({ skipped: true, error: e.error });
  };
  speechSynthesis.speak(utterance);
}
