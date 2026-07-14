import { getAudioContext } from './audioContext';

/**
 * Binaural beats: two oscillators panned hard left/right at a carrier
 * frequency offset by a small "beat" frequency, which the brain perceives
 * as a slow pulsing tone (only over stereo headphones — on speakers the
 * two channels mix and the beat cancels out). Carrier/offset are per-phase
 * config, not hardcoded, so callers choose alpha/theta/delta targeting or
 * a session-specific carrier (e.g. the 888Hz "abundance frequency" used
 * for the hypnosis session) without any code change here.
 *
 * NOTE ON EVIDENCE: brainwave-entrainment claims for binaural beats are
 * suggestive in some small studies, not conclusively established — this
 * is included as an optional ambient layer, not a validated clinical
 * technique, and the UI says so.
 */
export class BinauralLayer {
  constructor() {
    this.nodes = null;
  }

  start({ carrier = 200, beat = 6, volume = 0.06 } = {}) {
    const audioCtx = getAudioContext();
    if (!audioCtx) return;
    this.stop();

    const master = audioCtx.createGain();
    master.gain.setValueAtTime(0, audioCtx.currentTime);
    master.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + 1.5);
    master.connect(audioCtx.destination);

    const left = audioCtx.createOscillator();
    left.type = 'sine';
    left.frequency.value = carrier;
    const leftPan = audioCtx.createStereoPanner();
    leftPan.pan.value = -1;
    left.connect(leftPan).connect(master);

    const right = audioCtx.createOscillator();
    right.type = 'sine';
    right.frequency.value = carrier + beat;
    const rightPan = audioCtx.createStereoPanner();
    rightPan.pan.value = 1;
    right.connect(rightPan).connect(master);

    left.start();
    right.start();
    this.nodes = { master, left, right, leftPan, rightPan };
  }

  /** Smoothly retune without restarting (e.g. moving from alpha to theta as
   * a session transitions from settling into deeper phases). */
  retune({ carrier = 200, beat = 6 } = {}) {
    if (!this.nodes) return this.start({ carrier, beat });
    const audioCtx = getAudioContext();
    const now = audioCtx.currentTime;
    this.nodes.left.frequency.linearRampToValueAtTime(carrier, now + 2);
    this.nodes.right.frequency.linearRampToValueAtTime(carrier + beat, now + 2);
  }

  stop() {
    if (!this.nodes) return;
    const audioCtx = getAudioContext();
    const { master, left, right } = this.nodes;
    const now = audioCtx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0, now + 0.4);
    setTimeout(() => {
      [left, right].forEach((osc) => {
        try { osc.stop(); } catch { /* already stopped */ }
      });
      master.disconnect();
    }, 500);
    this.nodes = null;
  }
}
