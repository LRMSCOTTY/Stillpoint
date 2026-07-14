import { useEffect, useState } from 'react';
import { useSessionPlayer } from '../../hooks/useSessionPlayer';
import { BreathingPacer } from './BreathingPacer';
import { SUPPORTS_WAKE_LOCK } from '../../lib/wakeLock';

const PHASE_LABELS = {
  pretalk: 'Before we begin', intro: 'Settling in', body: 'Practice', induction: 'Induction',
  deepener: 'Going deeper', suggestion: 'Suggestion', visualization: 'Visualization',
  emergence: 'Returning', emergence_quick: 'Returning', outro: 'Closing',
};

export function SessionPlayer({ session, onExit }) {
  const [captionsOnly, setCaptionsOnly] = useState(false);
  const [binauralEnabled, setBinauralEnabled] = useState(true);
  const player = useSessionPlayer(session, { captionsOnly, binauralEnabled });
  const [confirmingEndImmediately, setConfirmingEndImmediately] = useState(false);

  useEffect(() => {
    if (player.status === 'done') onExit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player.status]);

  const isHypnosis = session.category === 'hypnosis';
  const showBreathingPacer = !isHypnosis && (player.currentPhase?.type === 'intro' || player.currentPhase?.type === 'body');

  return (
    <div className={`session-player ${isHypnosis ? 'theme-hypnosis' : 'theme-meditation'}`}>
      <header className="session-player-header">
        <h2>{session.title}</h2>
        <span className="phase-progress">
          {player.isForcedEmergence ? 'Returning' : PHASE_LABELS[player.currentPhase?.type] ?? ''}
          {!player.isForcedEmergence && ` · phase ${player.phaseIndex + 1} of ${player.totalPhases}`}
        </span>
      </header>

      {!SUPPORTS_WAKE_LOCK && player.status === 'playing' && (
        <div className="banner banner-warn">
          Your browser can't auto-keep the screen on — please disable auto-lock in your device
          settings for this session.
        </div>
      )}
      {player.status === 'playing' && (
        <div className="banner banner-info">
          Keep this tab open and your screen on — narration can't play in the background.
        </div>
      )}
      {player.error && (
        <div className="banner banner-warn">
          Audio hit a snag ({player.error}). <button onClick={() => setCaptionsOnly(true)}>Switch to captions</button>
        </div>
      )}

      {player.status === 'idle' && (
        <div className="session-start">
          <p className="about-blurb">{session.aboutBlurb}</p>
          <p className="est-minutes">About {session.estimatedMinutes} minutes</p>
          <button className="btn-primary" onClick={player.begin}>Begin Session</button>
          <button className="btn-secondary" onClick={onExit}>Back</button>
        </div>
      )}

      {(player.status === 'playing' || player.status === 'paused') && (
        <div className="session-active">
          {showBreathingPacer && <BreathingPacer active={player.status === 'playing'} />}
          <p className="caption-text" aria-live="polite">{player.captionText}</p>

          <div className="session-controls">
            {player.status === 'playing' ? (
              <button className="btn-secondary" onClick={player.pause}>Pause</button>
            ) : (
              <button className="btn-secondary" onClick={player.resume}>Resume</button>
            )}
            {!player.isForcedEmergence && (
              <button className="btn-secondary" onClick={player.skipPhase}>Skip phase</button>
            )}
            {!player.isForcedEmergence && (
              <button className="btn-danger" onClick={player.requestEnd}>End session</button>
            )}
          </div>

          {player.isForcedEmergence && (
            <div className="forced-emergence-note">
              <p>Bringing you gently back to full alertness before ending — almost there.</p>
              {!confirmingEndImmediately ? (
                <button className="btn-link" onClick={() => setConfirmingEndImmediately(true)}>
                  End immediately instead
                </button>
              ) : (
                <div>
                  <p className="banner-warn">This skips the re-alerting sequence. Are you sure?</p>
                  {/* requestEnd(), called while already in forced emergence, finishes immediately
                      via the hook's own cleanup path (stops speech/binaural/wake lock) rather than
                      bypassing it. */}
                  <button className="btn-danger" onClick={player.requestEnd}>Yes, end now</button>
                  <button className="btn-secondary" onClick={() => setConfirmingEndImmediately(false)}>Cancel</button>
                </div>
              )}
            </div>
          )}

          <label className="toggle-row">
            <input
              type="checkbox"
              checked={captionsOnly}
              onChange={(e) => setCaptionsOnly(e.target.checked)}
            />
            Captions only (no spoken narration)
          </label>
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={binauralEnabled}
              onChange={(e) => setBinauralEnabled(e.target.checked)}
            />
            Binaural beats {isHypnosis ? '(888Hz "abundance" carrier — headphones required)' : '(headphones required)'}
          </label>
        </div>
      )}
    </div>
  );
}
