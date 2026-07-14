import { useState } from 'react';
import { AudioCheck } from './components/Onboarding/AudioCheck';
import { SessionLibrary } from './components/Home/SessionLibrary';
import { SessionPlayer } from './components/Session/SessionPlayer';
import { ProgressView } from './components/Progress/ProgressView';

const ONBOARDED_KEY = 'meditation-app:onboarded';

function readOnboarded() {
  try { return localStorage.getItem(ONBOARDED_KEY) === '1'; } catch { return false; }
}

export default function App() {
  const [onboarded, setOnboarded] = useState(readOnboarded);
  const [tab, setTab] = useState('home');
  const [activeSession, setActiveSession] = useState(null);

  function finishOnboarding() {
    try { localStorage.setItem(ONBOARDED_KEY, '1'); } catch { /* private browsing — fine, re-ask next time */ }
    setOnboarded(true);
  }

  if (!onboarded) {
    return (
      <div className="app-shell">
        <AudioCheck onDone={finishOnboarding} />
      </div>
    );
  }

  if (activeSession) {
    return (
      <div className="app-shell">
        <SessionPlayer session={activeSession} onExit={() => setActiveSession(null)} />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Stillpoint</h1>
        <nav className="tab-nav">
          <button className={tab === 'home' ? 'tab-active' : ''} onClick={() => setTab('home')}>Sessions</button>
          <button className={tab === 'progress' ? 'tab-active' : ''} onClick={() => setTab('progress')}>Progress</button>
        </nav>
      </header>
      <main>
        {tab === 'home' && <SessionLibrary onSelect={setActiveSession} />}
        {tab === 'progress' && <ProgressView />}
      </main>
    </div>
  );
}
