import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import App from './App.jsx';
import { registerSW } from 'virtual:pwa-register';

let sessionActive = false;
window.addEventListener('meditation-app:session-active', (e) => { sessionActive = e.detail; });

if (import.meta.env.PROD) {
  const updateSW = registerSW({
    immediate: false,
    onNeedRefresh() {
      if (!sessionActive) updateSW(true);
      // else: user is mid-session, defer — they'll get the update on next load.
    },
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
