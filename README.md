# Stillpoint

A calm, installable PWA for guided meditation and self-hypnosis sessions. No accounts, no
backend — everything runs client-side using the browser's built-in Speech Synthesis and Web
Audio APIs, with progress tracked locally.

## Sessions

- **Meditation** (5): Breath Focus (anapanasati), Body Scan (MBSR-style), Loving-Kindness
  (metta bhavana), Open Awareness (shikantaza-inspired), Self-Inquiry (Advaita-inspired).
- **Self-Hypnosis** (1): Wealth & Confidence Mindset — an Elman-style induction, staircase
  deepener, and a suggestion phase grounded in self-efficacy (not manifestation claims), with
  an 888Hz binaural "abundance" carrier and a guaranteed safe re-alerting sequence if ended
  early.

Every session includes an honest "About this practice" note naming its tradition/technique and,
for the hypnosis session, a contraindication note.

## Development

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build + PWA precache manifest
npm run preview   # serve the production build locally
```

Regenerate PWA icons (pure-Node PNG encoder, no native deps) with:

```bash
node scripts/generate-icons.mjs
```

## Architecture notes

See `src/hooks/useSessionPlayer.js` for the playback orchestration: a drift-free clock
(`src/lib/sessionClock.js`), a hardened `SpeechSynthesis` wrapper handling the real cross-browser
quirks of the Web Speech API (`src/lib/speechEngine.js`), and a forced-emergence chokepoint that
guarantees hypnosis sessions never end abruptly mid-suggestion.
