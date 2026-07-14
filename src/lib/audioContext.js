// Single shared AudioContext, created lazily and kept as a true module-level
// singleton (guards against React StrictMode's dev-only double-invoke
// creating duplicate contexts). Must be resumed from inside a user gesture.
let ctx = null;

export function getAudioContext() {
  if (!ctx) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

/** Call synchronously inside the "Begin Session" click handler, before any
 * await, to satisfy iOS Safari's gesture-attached autoplay requirement. */
export function unlockAudioContext() {
  const audioCtx = getAudioContext();
  if (!audioCtx) return;
  audioCtx.resume();
  const buffer = audioCtx.createBuffer(1, 1, 22050);
  const src = audioCtx.createBufferSource();
  src.buffer = buffer;
  src.connect(audioCtx.destination);
  src.start(0);
}
