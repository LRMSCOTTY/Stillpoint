import { useState } from 'react';
import { unlockAudioContext } from '../../lib/audioContext';
import { playBell, BELL_START } from '../../lib/singingBowl';
import { SUPPORTS_SPEECH, ensureVoicesLoaded, pickBestVoice, unlockSpeech, speakLine } from '../../lib/speechEngine';

// First-run calibration step: doubles as the required audio-unlock user
// gesture, and catches muted-device / no-TTS-installed / no-voices setups
// before a real session starts, rather than someone discovering silence
// mid-hypnosis-induction.
export function AudioCheck({ onDone }) {
  const [state, setState] = useState('idle'); // idle | checking | ok | no-speech

  async function runCheck() {
    setState('checking');
    unlockAudioContext();
    playBell(BELL_START);
    unlockSpeech();

    if (!SUPPORTS_SPEECH) {
      setState('no-speech');
      return;
    }
    const voices = await ensureVoicesLoaded();
    const voice = pickBestVoice(voices);
    if (!voice) {
      setState('no-speech');
      return;
    }
    speakLine('This is what your guide will sound like.', { voice, rate: 0.92 }, () => setState('ok'));
  }

  return (
    <div className="audio-check">
      <h2>Before we begin</h2>
      <p>Let's make sure sound is working — you should hear a soft bell, then a spoken line.</p>
      {state === 'idle' && (
        <button className="btn-primary" onClick={runCheck}>Tap to test sound</button>
      )}
      {state === 'checking' && <p className="audio-check-status">Listening for your device's voice…</p>}
      {state === 'ok' && (
        <>
          <p className="audio-check-status">Sound is working.</p>
          <button className="btn-primary" onClick={onDone}>Continue</button>
        </>
      )}
      {state === 'no-speech' && (
        <>
          <p className="audio-check-status audio-check-warning">
            Your browser doesn't have a voice available for narration. You can still use every
            session with on-screen captions and the bell/tone audio.
          </p>
          <button className="btn-primary" onClick={onDone}>Continue with captions</button>
        </>
      )}
      <p className="audio-check-hint">If you don't hear anything, check your device isn't on silent.</p>
    </div>
  );
}
