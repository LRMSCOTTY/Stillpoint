import { getAudioContext } from './audioContext';

/**
 * Synthesized singing-bowl-style bell: a fundamental plus a slightly
 * detuned second partial (the ~5-cent detune produces natural acoustic
 * beating "for free", no separate LFO needed) plus one inharmonic overtone,
 * a soft mallet-strike attack, and an exponential decay tail (real
 * resonant bodies decay exponentially, not linearly — this is what makes
 * it read as an authentic bowl rather than a synth beep).
 */
export function playBell({ freq = 220, duration = 6, volume = 0.3 } = {}) {
  const audioCtx = getAudioContext();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;

  const master = audioCtx.createGain();
  master.gain.value = volume;
  master.connect(audioCtx.destination);

  const partials = [
    { ratio: 1.0, gain: 0.6 },
    { ratio: 1.005, gain: 0.5 }, // ~5 cents detuned -> slow natural beating
    { ratio: 2.42, gain: 0.15 }, // inharmonic overtone, real bowls aren't clean octaves
  ];

  partials.forEach(({ ratio, gain }) => {
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq * ratio;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(gain, now + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration); // can't ramp to exactly 0
    osc.connect(g).connect(master);
    osc.start(now);
    osc.stop(now + duration + 0.1);
    osc.onended = () => {
      osc.disconnect();
      g.disconnect();
    };
  });

  setTimeout(() => master.disconnect(), (duration + 0.2) * 1000);
}

export const BELL_START = { freq: 196, duration: 7, volume: 0.32 };
export const BELL_INTERVAL = { freq: 262, duration: 4.5, volume: 0.2 };
export const BELL_END = { freq: 220, duration: 8, volume: 0.35 };
