import { useMemo, useState } from 'react';
import { MEDITATION_SESSIONS } from '../../data/sessions';
import { HYPNOSIS_SESSION } from '../../data/hypnosis';

const ALL_SESSIONS = [...MEDITATION_SESSIONS, HYPNOSIS_SESSION];
const FILTERS = ['all', 'meditation', 'hypnosis'];

export function SessionLibrary({ onSelect }) {
  const [filter, setFilter] = useState('all');

  const visible = useMemo(
    () => (filter === 'all' ? ALL_SESSIONS : ALL_SESSIONS.filter((s) => s.category === filter)),
    [filter]
  );

  return (
    <div className="session-library">
      <div className="filter-row">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`filter-chip ${filter === f ? 'filter-chip-active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f === 'meditation' ? 'Meditation' : 'Self-Hypnosis'}
          </button>
        ))}
      </div>

      <div className="session-grid">
        {visible.map((session) => (
          <button
            key={session.id}
            className={`session-card ${session.category === 'hypnosis' ? 'session-card-hypnosis' : ''}`}
            onClick={() => onSelect(session)}
          >
            <span className="session-card-category">
              {session.category === 'hypnosis' ? 'Self-Hypnosis' : 'Meditation'}
            </span>
            <h3>{session.title}</h3>
            <p className="session-card-tradition">{session.tradition}</p>
            <p className="session-card-minutes">{session.estimatedMinutes} min</p>
          </button>
        ))}
      </div>
    </div>
  );
}
