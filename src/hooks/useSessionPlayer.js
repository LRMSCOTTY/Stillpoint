import { useCallback, useEffect, useRef, useState } from 'react';
import { SessionClock } from '../lib/sessionClock';
import {
  SUPPORTS_SPEECH, ensureVoicesLoaded, pickBestVoice, unlockSpeech, stopAllSpeech, speakLine,
} from '../lib/speechEngine';
import { unlockAudioContext } from '../lib/audioContext';
import { playBell, BELL_START, BELL_INTERVAL, BELL_END } from '../lib/singingBowl';
import { BinauralLayer } from '../lib/binaural';
import { requestWakeLock, releaseWakeLock } from '../lib/wakeLock';
import { recordSessionComplete } from '../lib/progress';

export function useSessionPlayer(session, { captionsOnly = false, binauralEnabled = true, voiceURI } = {}) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const [status, setStatus] = useState('idle'); // idle | playing | paused | ending | done
  const [forcedEmergence, setForcedEmergence] = useState(false);
  const [captionText, setCaptionText] = useState('');
  const [error, setError] = useState(null);

  const clockRef = useRef(new SessionClock());
  const binauralRef = useRef(new BinauralLayer());
  const voiceRef = useRef(null);
  const wakeLockActiveRef = useRef(false);
  const statusRef = useRef(status);
  statusRef.current = status;

  const phases = session.phases;
  const currentPhase = forcedEmergence ? session.emergenceQuick : phases[phaseIndex];

  const applyBinaural = useCallback((ph) => {
    if (!binauralEnabled) return;
    if (ph?.binaural) binauralRef.current.retune(ph.binaural);
    else binauralRef.current.stop();
  }, [binauralEnabled]);

  const speakOrShow = useCallback((text, onDone) => {
    setCaptionText(text);
    if (captionsOnly || !SUPPORTS_SPEECH) {
      const timeout = setTimeout(() => onDone(), Math.min(6000, 900 + text.length * 45));
      return () => clearTimeout(timeout);
    }
    speakLine(text, { voice: voiceRef.current, rate: session.defaultRate, onError: setError }, () => onDone());
    return undefined;
  }, [captionsOnly, session.defaultRate]);

  const finish = useCallback((completed) => {
    stopAllSpeech();
    binauralRef.current.stop();
    releaseWakeLock();
    clockRef.current.pause();
    if (completed) {
      recordSessionComplete({
        sessionId: session.id,
        title: session.title,
        category: session.category,
        minutes: session.estimatedMinutes,
      });
    }
    setStatus('done');
  }, [session]);

  // Drive playback: whenever we're "playing" and land on a new line, speak it.
  // This same effect drives the forced-emergence sequence too, since
  // `currentPhase` transparently switches to session.emergenceQuick.
  useEffect(() => {
    if (status !== 'playing') return undefined;
    const ph = currentPhase;
    if (!ph) return undefined;
    const line = ph.lines[lineIndex];
    if (!line) {
      if (forcedEmergence) {
        finish(false);
        return undefined;
      }
      if (phaseIndex + 1 < phases.length) {
        setPhaseIndex((pi) => pi + 1);
        setLineIndex(0);
      } else {
        finish(true);
      }
      return undefined;
    }
    let cancelled = false;
    let pauseTimer;
    const cleanup = speakOrShow(line.text, () => {
      if (cancelled) return;
      pauseTimer = setTimeout(() => { if (!cancelled) setLineIndex((li) => li + 1); }, line.pauseAfterMs);
    });
    return () => {
      cancelled = true;
      clearTimeout(pauseTimer);
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, phaseIndex, lineIndex, forcedEmergence]);

  useEffect(() => {
    applyBinaural(currentPhase);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseIndex, forcedEmergence, binauralEnabled]);

  useEffect(() => {
    if (forcedEmergence) return;
    if (currentPhase?.type === 'intro') playBell(BELL_START);
    else if (currentPhase?.type === 'outro' || currentPhase?.type === 'emergence') playBell(BELL_END);
    else playBell(BELL_INTERVAL);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseIndex]);

  // Auto-pause on backgrounding; never silently "catch up" narration.
  useEffect(() => {
    function onVisibility() {
      if (document.visibilityState === 'hidden' && statusRef.current === 'playing') {
        pauseSession();
      } else if (document.visibilityState === 'visible' && wakeLockActiveRef.current) {
        requestWakeLock(() => { wakeLockActiveRef.current = false; }).then((r) => {
          wakeLockActiveRef.current = r.ok;
        });
      }
    }
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => {
    stopAllSpeech();
    binauralRef.current.stop();
    releaseWakeLock();
  }, []);

  // Let main.jsx know whether a session is in flight, so a PWA update never
  // yanks the user out mid-session (see registerSW's onNeedRefresh guard).
  useEffect(() => {
    const active = status === 'playing' || status === 'paused';
    window.dispatchEvent(new CustomEvent('meditation-app:session-active', { detail: active }));
  }, [status]);

  const begin = useCallback(async () => {
    // Gesture-critical unlocks first, synchronously, before any await.
    unlockAudioContext();
    unlockSpeech();
    clockRef.current.start();
    setStatus('playing');
    setPhaseIndex(0);
    setLineIndex(0);
    setForcedEmergence(false);

    const voices = await ensureVoicesLoaded();
    voiceRef.current = pickBestVoice(voices, voiceURI);
    const wl = await requestWakeLock(() => { wakeLockActiveRef.current = false; });
    wakeLockActiveRef.current = wl.ok;
  }, [voiceURI]);

  const pauseSession = useCallback(() => {
    stopAllSpeech();
    clockRef.current.pause();
    setStatus('paused');
  }, []);

  const resumeSession = useCallback(() => {
    clockRef.current.resume();
    setStatus('playing');
  }, []);

  /** Single chokepoint for every stop/skip action. Hypnosis sessions not
   * already in an emergence phase are forced through emergenceQuick before
   * actually exiting — never an abrupt mid-suggestion cutoff. */
  const requestEnd = useCallback(() => {
    const alreadyEmerging = forcedEmergence || currentPhase?.type === 'emergence';
    if (session.category === 'hypnosis' && session.emergenceQuick && !alreadyEmerging) {
      stopAllSpeech();
      setForcedEmergence(true);
      setLineIndex(0);
      setStatus('playing');
    } else {
      finish(false);
    }
  }, [session, currentPhase, forcedEmergence, finish]);

  const skipPhase = useCallback(() => {
    stopAllSpeech();
    if (forcedEmergence) return; // already in the mandatory re-alerting sequence
    if (phaseIndex + 1 < phases.length) {
      setPhaseIndex((pi) => pi + 1);
      setLineIndex(0);
    } else {
      finish(true);
    }
  }, [phaseIndex, phases.length, forcedEmergence, finish]);

  return {
    status, currentPhase, phaseIndex, totalPhases: phases.length, captionText, error,
    isForcedEmergence: forcedEmergence, ttsSupported: SUPPORTS_SPEECH,
    begin, pause: pauseSession, resume: resumeSession, skipPhase, requestEnd,
  };
}
