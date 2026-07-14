import { useEffect, useState } from 'react';
import { loadProgress, checkPersistence } from '../../lib/progress';

export function ProgressView() {
  const [progress, setProgress] = useState(() => loadProgress());
  const [persistent, setPersistent] = useState(true);

  useEffect(() => {
    setProgress(loadProgress());
    setPersistent(checkPersistence());
  }, []);

  return (
    <div className="progress-view">
      {!persistent && (
        <div className="banner banner-warn">
          Private browsing detected — your progress won't be saved after this tab closes.
        </div>
      )}
      <div className="stat-row">
        <div className="stat-tile">
          <span className="stat-value">{progress.history.length}</span>
          <span className="stat-label">Sessions completed</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value">{progress.totalMinutes}</span>
          <span className="stat-label">Minutes practiced</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value">{progress.currentStreak}</span>
          <span className="stat-label">Day streak</span>
        </div>
      </div>

      <h3>Recent sessions</h3>
      {progress.history.length === 0 ? (
        <p className="empty-state">Nothing yet — your first session will show up here.</p>
      ) : (
        <ul className="history-list">
          {[...progress.history].reverse().slice(0, 20).map((entry, i) => (
            <li key={i}>
              <span>{entry.title}</span>
              <span className="history-meta">{entry.date} · {entry.minutes} min</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
