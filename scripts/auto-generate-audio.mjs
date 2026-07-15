#!/usr/bin/env node
// One-shot, no-questions-asked version: run this on your OWN machine (this
// sandbox's network policy blocks api.elevenlabs.io, so it can't run here).
// Requires Node 18+ (built-in fetch, no npm install) and your API key.
//
// Usage:
//   ELEVENLABS_API_KEY=sk_... node scripts/auto-generate-audio.mjs
//
// Does everything in one pass, no interaction required:
//   1. Lists your available voices, auto-picks the best-scoring calm one
//      (no need to listen to previews first).
//   2. Generates all 154 narration lines across all 6 sessions into
//      public/audio/. Safe to re-run/resume if interrupted.
//   3. Commits and pushes the result to `main` for you.
//
// If you'd rather choose the voice yourself by ear, use tts-preview.mjs +
// generate-audio.mjs instead — this script is the fully hands-off version.

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { MEDITATION_SESSIONS } from '../src/data/sessions.js';
import { HYPNOSIS_SESSION } from '../src/data/hypnosis.js';

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error('Usage: ELEVENLABS_API_KEY=sk_... node scripts/auto-generate-audio.mjs');
  process.exit(1);
}

const CALM_KEYWORDS = ['calm', 'soft', 'warm', 'gentle', 'sooth', 'serene', 'relax', 'meditat', 'narrat', 'mellow'];

function scoreVoice(voice) {
  const haystack = JSON.stringify(voice.labels ?? {}).toLowerCase() + ' ' + (voice.description ?? '').toLowerCase();
  let score = 0;
  for (const kw of CALM_KEYWORDS) if (haystack.includes(kw)) score += 1;
  if (voice.category === 'premade') score += 0.5;
  return score;
}

async function pickVoice() {
  const res = await fetch('https://api.elevenlabs.io/v1/voices', { headers: { 'xi-api-key': API_KEY } });
  if (!res.ok) throw new Error(`Failed to list voices: ${res.status} ${await res.text()}`);
  const { voices } = await res.json();
  if (!voices?.length) throw new Error('No voices returned for this account.');
  const best = [...voices].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0];
  console.log(`Auto-selected voice: "${best.name}" (${best.voice_id})`);
  return best.voice_id;
}

const ALL_SESSIONS = [...MEDITATION_SESSIONS, HYPNOSIS_SESSION];

function collectLines(session) {
  const phases = [...session.phases, ...(session.emergenceQuick ? [session.emergenceQuick] : [])];
  const jobs = [];
  for (const phase of phases) {
    phase.lines.forEach((line, i) => {
      jobs.push({ sessionId: session.id, text: line.text, outPath: `public/audio/${session.id}/${phase.id}/${i}.mp3` });
    });
  }
  return jobs;
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateLine(voiceId, job, voiceSettings) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: { 'xi-api-key': API_KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({ text: job.text, model_id: 'eleven_multilingual_v2', voice_settings: voiceSettings }),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const voiceId = await pickVoice();

  const allJobs = ALL_SESSIONS.flatMap(collectLines);
  const pending = allJobs.filter((j) => !existsSync(j.outPath));
  console.log(`${allJobs.length} lines total, ${pending.length} to generate.`);

  let done = 0;
  for (const job of pending) {
    const voiceSettings = job.sessionId === 'wealth-confidence'
      ? { stability: 0.8, similarity_boost: 0.75, style: 0.1, use_speaker_boost: true }
      : { stability: 0.65, similarity_boost: 0.75, style: 0.2, use_speaker_boost: true };
    try {
      const audio = await generateLine(voiceId, job, voiceSettings);
      mkdirSync(job.outPath.substring(0, job.outPath.lastIndexOf('/')), { recursive: true });
      writeFileSync(job.outPath, audio);
      done += 1;
      console.log(`[${done}/${pending.length}] ${job.outPath}`);
    } catch (err) {
      console.error(`Failed on ${job.outPath}: ${err.message}`);
      console.error('Re-run the script to resume — completed files are kept.');
      process.exit(1);
    }
    await sleep(300);
  }

  console.log('\nAll narration audio generated. Committing and pushing...');
  execSync('git add public/audio', { stdio: 'inherit' });
  const hasChanges = execSync('git status --porcelain -- public/audio').toString().trim().length > 0;
  if (hasChanges) {
    execSync(`git commit -m "Add ElevenLabs narration audio (voice: ${voiceId})"`, { stdio: 'inherit' });
    execSync('git push origin main', { stdio: 'inherit' });
    console.log('\nDone — pushed to main. Tell Claude it\'s ready to wire audio playback into the app.');
  } else {
    console.log('\nNo new audio files to commit (already up to date).');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
