#!/usr/bin/env node
// Run this on your OWN machine (not in the sandbox — its network policy
// blocks api.elevenlabs.io). Requires Node 18+ (uses the built-in fetch,
// no npm install needed) and your ElevenLabs API key.
//
// Usage:
//   ELEVENLABS_API_KEY=sk_... node scripts/tts-preview.mjs
//
// Fetches your available voices, picks 5 calm/soothing-sounding candidates,
// generates a short preview line for each, and saves them to
// ./voice-previews/<voice-name>.mp3 so you can listen and choose one.

import { writeFileSync, mkdirSync } from 'node:fs';

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error('Set ELEVENLABS_API_KEY first, e.g.:\n  ELEVENLABS_API_KEY=sk_... node scripts/tts-preview.mjs');
  process.exit(1);
}

const PREVIEW_TEXT = 'Welcome to Stillpoint. Find a comfortable position, and let your breathing settle.';
const CALM_KEYWORDS = ['calm', 'soft', 'warm', 'gentle', 'sooth', 'serene', 'relax', 'meditat', 'narrat', 'mellow'];

function scoreVoice(voice) {
  const haystack = JSON.stringify(voice.labels ?? {}).toLowerCase() + ' ' + (voice.description ?? '').toLowerCase();
  let score = 0;
  for (const kw of CALM_KEYWORDS) if (haystack.includes(kw)) score += 1;
  // Mild preference for premade (well-tested) voices over community clones.
  if (voice.category === 'premade') score += 0.5;
  return score;
}

async function main() {
  const voicesRes = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: { 'xi-api-key': API_KEY },
  });
  if (!voicesRes.ok) {
    throw new Error(`Failed to list voices: ${voicesRes.status} ${await voicesRes.text()}`);
  }
  const { voices } = await voicesRes.json();
  if (!voices?.length) throw new Error('No voices returned for this account.');

  const ranked = [...voices].sort((a, b) => scoreVoice(b) - scoreVoice(a));
  const candidates = ranked.slice(0, 5);
  if (candidates.length < 5) {
    console.warn(`Only found ${candidates.length} voices on this account — generating previews for all of them.`);
  }

  mkdirSync('voice-previews', { recursive: true });

  for (const voice of candidates) {
    console.log(`Generating preview for "${voice.name}" (${voice.voice_id})...`);
    const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice.voice_id}`, {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: PREVIEW_TEXT,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.65, similarity_boost: 0.75, style: 0.2, use_speaker_boost: true },
      }),
    });
    if (!ttsRes.ok) {
      console.error(`  Failed: ${ttsRes.status} ${await ttsRes.text()}`);
      continue;
    }
    const buf = Buffer.from(await ttsRes.arrayBuffer());
    const safeName = voice.name.replace(/[^a-z0-9-]/gi, '_');
    const path = `voice-previews/${safeName}.mp3`;
    writeFileSync(path, buf);
    console.log(`  Saved ${path} (voice_id: ${voice.voice_id})`);
  }

  console.log('\nDone. Listen to the files in ./voice-previews/, then run:');
  console.log('  ELEVENLABS_API_KEY=sk_... VOICE_ID=<chosen voice_id> node scripts/generate-audio.mjs');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
