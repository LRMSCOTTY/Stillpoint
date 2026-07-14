// Shared authoring helpers. Playback is driven by sequential line dispatch
// (each line's TTS onend triggers the next after pauseAfterMs) — never by
// racing an elapsed clock against hand-picked timestamps, since real TTS
// duration varies by voice/rate/device and can't be predicted at authoring
// time. estimatedMinutes is a display-only approximation, never playback
// authority.

/** One TTS-safe line. Keep text under ~180 chars / ~12s spoken to stay clear
 * of the Chrome long-utterance cutoff bug — this also happens to match
 * authentic meditation/hypnosis delivery style (short phrases, real pauses). */
export function L(text, pauseAfterMs = 3000) {
  // Optional chaining: import.meta.env only exists under Vite. This module
  // is also imported directly by scripts/generate-audio.mjs under plain
  // Node (no Vite), where it must not throw.
  if (import.meta.env?.DEV && text.length > 180) {
    // eslint-disable-next-line no-console
    console.warn(`[session content] line exceeds 180 chars (${text.length}): "${text.slice(0, 40)}..."`);
  }
  return { text, pauseAfterMs };
}

export function phase(id, type, lines, binaural) {
  return { id, type, lines, ...(binaural ? { binaural } : {}) };
}

const WORDS_PER_MINUTE = 130; // slow, meditative delivery pace

export function estimateMinutes(session) {
  const words = session.phases.flatMap((p) => p.lines).reduce((sum, l) => sum + l.text.split(/\s+/).length, 0);
  const pauseMinutes = session.phases.flatMap((p) => p.lines).reduce((sum, l) => sum + l.pauseAfterMs, 0) / 60000;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE + pauseMinutes));
}
