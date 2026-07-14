#!/usr/bin/env node
// Run this on your OWN machine (not in the sandbox — its network policy
// blocks api.elevenlabs.io). Requires Node 18+ (built-in fetch, no npm
// install needed), your ElevenLabs API key, and a chosen voice_id (see
// scripts/tts-preview.mjs to pick one first).
//
// Usage:
//   ELEVENLABS_API_KEY=sk_... VOICE_ID=<voice_id> node scripts/generate-audio.mjs
//
// Generates one MP3 per script line, for every session, into
// public/audio/<sessionId>/<phaseId>/<lineIndex>.mp3 — matching the
// phase/line structure in src/data/sessions.js and src/data/hypnosis.js.
// Safe to re-run: it skips any file that already exists, so an
// interrupted run (rate limit, network blip) can just be restarted.

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { MEDITATION_SESSIONS } from '../src/data/sessions.js';
import { HYPNOSIS_SESSION } from '../src/data/hypnosis.js';

const API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.VOICE_ID;
if (!API_KEY || !VOICE_ID) {
  console.error('Usage: ELEVENLABS_API_KEY=sk_... VOICE_ID=<voice_id> node scripts/generate-audio.mjs');
  process.exit(1);
}

// All sessions, including the hypnosis session's normal phases AND its
// separate emergenceQuick phase (also needs real audio, since it's what
// plays if someone ends the session early).
const ALL_SESSIONS = [...MEDITATION_SESSIONS, HYPNOSIS_SESSION];

function collectLines(session) {
  const phases = [...session.phases];
  if (session.emergenceQuick) phases.push(session.emergenceQuick);
  const jobs = [];
  for (const phase of phases) {
    phase.lines.forEach((line, i) => {
      jobs.push({
        sessionId: session.id,
        phaseId: phase.id,
        lineIndex: i,
        text: line.text,
        outPath: `public/audio/${session.id}/${phase.id}/${i}.mp3`,
      });
    });
  }
  return jobs;
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateLine(job, voiceSettings) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text: job.text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: voiceSettings,
    }),
  });
  if (!res.ok) {
    throw new Error(`${res.status} ${await res.text()}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const allJobs = ALL_SESSIONS.flatMap(collectLines);
  const pending = allJobs.filter((j) => !existsSync(j.outPath));
  console.log(`${allJobs.length} lines total, ${pending.length} to generate (${allJobs.length - pending.length} already exist).`);

  let done = 0;
  for (const job of pending) {
    // Slightly higher stability/lower style for the hypnosis session —
    // steadier, more monotone delivery suits induction/trance content
    // better than the more expressive default used for meditation.
    const voiceSettings = job.sessionId === 'wealth-confidence'
      ? { stability: 0.8, similarity_boost: 0.75, style: 0.1, use_speaker_boost: true }
      : { stability: 0.65, similarity_boost: 0.75, style: 0.2, use_speaker_boost: true };

    try {
      const audio = await generateLine(job, voiceSettings);
      mkdirSync(job.outPath.substring(0, job.outPath.lastIndexOf('/')), { recursive: true });
      writeFileSync(job.outPath, audio);
      done += 1;
      console.log(`[${done}/${pending.length}] ${job.outPath}`);
    } catch (err) {
      console.error(`Failed on ${job.outPath}: ${err.message}`);
      console.error('Re-run the script later to resume — completed files are kept.');
      process.exit(1);
    }
    await sleep(300); // be polite to the API rather than hammering it
  }

  console.log('\nAll narration audio generated in public/audio/.');
  console.log('Next: tell Claude it\'s done so it can wire audio playback into the app and push.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
