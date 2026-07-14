import { L, phase, estimateMinutes } from './schema';

const ALPHA = { carrier: 200, beat: 10 };
const THETA = { carrier: 200, beat: 6 };

// 1. Breath focus — anapanasati-style (mindfulness of breathing). Follows
// the classic settle -> concentrate on breath -> briefly open to insight
// -> close structure, echoing the first tetrads of the Satipatthana Sutta's
// breathing scheme without the Pali terminology.
const breathFocus = {
  id: 'breath-focus',
  title: 'Breath Focus',
  category: 'meditation',
  tradition: 'Buddhist — Anapanasati (mindfulness of breathing)',
  aboutBlurb:
    'Rooted in anapanasati, the Buddha’s scheme of mindfulness of breathing. The breath is used as a single, always-available anchor for attention — first to settle and steady the mind, then to notice what is naturally arising.',
  defaultRate: 0.92,
  phases: [
    phase('intro', 'intro', [
      L('Find a position where your spine can be upright but not stiff.', 4000),
      L('Let your eyes close, or soften your gaze toward the floor.', 4000),
      L('There is nowhere else you need to be for these next few minutes.', 4000),
      L('Take one breath deliberately deeper than usual, and let it go with a sigh.', 6000),
    ], ALPHA),
    phase('settle', 'body', [
      L('Bring your attention to the physical sensation of breathing.', 4000),
      L('Not controlling it. Just noticing it, exactly as it already is.', 5000),
      L('Notice where you feel the breath most clearly — the nostrils, the chest, or the belly.', 5000),
      L('Rest your attention there, like sitting beside a river and watching it flow.', 6000),
    ], ALPHA),
    phase('concentrate', 'body', [
      L('When the breath is long, know that it is long.', 4500),
      L('When it is short, simply know that it is short.', 4500),
      L('If it helps, silently count each exhale — one, two, up to ten — then begin again at one.', 6000),
      L('When you notice the mind has wandered, that noticing is itself the practice working.', 5000),
      L('Gently, without frustration, return to the next breath.', 6000),
      L('There is nowhere to get to. Only this breath, and then the next.', 7000),
    ], THETA),
    phase('open', 'body', [
      L('Now let the counting fall away. Widen your attention slightly.', 5000),
      L('Notice the breath calming the body with each exhale.', 5000),
      L('Let the mind itself grow quiet, the way water grows still when left undisturbed.', 7000),
      L('If thoughts arise, let them pass like clouds, without following them.', 6000),
    ], THETA),
    phase('outro', 'outro', [
      L('Begin to deepen the breath again, on purpose now.', 4000),
      L('Notice the sounds in the room around you.', 4000),
      L('When you are ready, let your eyes open gently.', 4000),
      L('Carry this steadiness with you into whatever comes next.', 3000),
    ]),
  ],
};

// 2. Body scan — MBSR-style systematic sweep of attention through the body.
const bodyScan = {
  id: 'body-scan',
  title: 'Body Scan',
  category: 'meditation',
  tradition: 'Secular — Mindfulness-Based Stress Reduction (Jon Kabat-Zinn)',
  aboutBlurb:
    'The core practice of MBSR: a slow, systematic sweep of attention through the body, region by region, noticing sensation without needing to change it. Used clinically for stress, pain, and sleep.',
  defaultRate: 0.9,
  phases: [
    phase('intro', 'intro', [
      L('Lie down or sit comfortably, and allow your body to settle.', 5000),
      L('This practice is simple: we will move attention slowly through the body.', 5000),
      L('There is nothing to fix. Only to notice.', 5000),
    ], ALPHA),
    phase('feet', 'body', [
      L('Bring your attention down to your feet.', 4000),
      L('Notice any sensation there — warmth, coolness, pressure, or nothing much at all.', 6000),
      L('Whatever you find is fine. Simply notice it.', 5000),
    ], ALPHA),
    phase('legs', 'body', [
      L('Let attention rise into your lower legs, then your knees, then your thighs.', 6000),
      L('Notice the weight of your legs, wherever they are resting.', 6000),
    ], THETA),
    phase('torso', 'body', [
      L('Bring attention to your hips and lower back.', 4500),
      L('Notice your belly rising and falling gently with the breath.', 5000),
      L('Move up through your chest, and across your shoulders.', 5000),
      L('If you find tension anywhere, you don’t need to release it. Just notice it is there.', 6500),
    ], THETA),
    phase('arms', 'body', [
      L('Let attention travel down each arm, to the elbows, the wrists, the hands.', 6000),
      L('Notice your fingers, one by one if you like.', 5000),
    ], THETA),
    phase('head', 'body', [
      L('Bring attention up through your neck and into your face.', 5000),
      L('Soften your jaw. Soften the space between your eyebrows.', 5500),
      L('Notice the top of your head, and the air touching your skin.', 5500),
    ], THETA),
    phase('whole', 'body', [
      L('Now let attention expand to include the whole body at once.', 5500),
      L('Breathing as one whole, resting body.', 7000),
    ], ALPHA),
    phase('outro', 'outro', [
      L('Begin to wiggle your fingers and toes.', 3500),
      L('Take a slightly deeper breath.', 3500),
      L('In your own time, let your eyes open.', 3500),
    ]),
  ],
};

// 3. Loving-kindness / metta — classic 5-stage progression.
const lovingKindness = {
  id: 'loving-kindness',
  title: 'Loving-Kindness',
  category: 'meditation',
  tradition: 'Buddhist — Metta Bhavana',
  aboutBlurb:
    'The classic metta progression, offering the same well-wishing phrases first to yourself, then outward in widening circles — to a loved one, a neutral person, someone difficult, and finally all beings.',
  defaultRate: 0.92,
  phases: [
    phase('intro', 'intro', [
      L('Settle into your seat, and let your breathing find its own rhythm.', 5000),
      L('We will offer a few simple phrases, first to yourself, then to others.', 5000),
      L('You don’t need to force any particular feeling. Just offer the words sincerely.', 5500),
    ], ALPHA),
    phase('self', 'body', [
      L('Bring yourself to mind, just as you are right now.', 4500),
      L('Silently repeat: may I be safe.', 4500),
      L('May I be healthy.', 4000),
      L('May I be at ease.', 4000),
      L('May I be happy.', 5000),
    ], ALPHA),
    phase('friend', 'body', [
      L('Now bring to mind someone you care about easily — a friend, a family member.', 5500),
      L('May you be safe.', 4000),
      L('May you be healthy.', 4000),
      L('May you be at ease.', 4000),
      L('May you be happy.', 5000),
    ], THETA),
    phase('neutral', 'body', [
      L('Now bring to mind someone neutral — perhaps a cashier, or someone you pass but don’t know well.', 5500),
      L('May you be safe. May you be healthy.', 5000),
      L('May you be at ease. May you be happy.', 5500),
    ], THETA),
    phase('difficult', 'body', [
      L('If you are willing, bring to mind someone you find difficult. Start small if you need to.', 6000),
      L('May you be safe.', 4000),
      L('May you be at ease.', 5000),
      L('This is a practice of your own heart, not a verdict on their behavior.', 6000),
    ], THETA),
    phase('all', 'body', [
      L('Now let the circle widen to include all beings, everywhere, without exception.', 6000),
      L('May all beings be safe.', 4500),
      L('May all beings be at ease.', 4500),
      L('May all beings be happy.', 6000),
    ], ALPHA),
    phase('outro', 'outro', [
      L('Let the phrases go, and simply rest for a moment.', 5000),
      L('Notice how you feel, without needing it to be any particular way.', 5000),
      L('When you’re ready, gently open your eyes.', 3500),
    ]),
  ],
};

// 4. Open awareness — shikantaza-inspired "just sitting", objectless.
const openAwareness = {
  id: 'open-awareness',
  title: 'Open Awareness',
  category: 'meditation',
  tradition: 'Zen — Shikantaza ("just sitting")',
  aboutBlurb:
    'Inspired by shikantaza, Soto Zen’s objectless sitting practice. There is no technique to perform here and nothing to attain — awareness is simply allowed to rest in itself, already complete.',
  defaultRate: 0.88,
  phases: [
    phase('intro', 'intro', [
      L('Sit upright, alert, and at ease.', 4500),
      L('This practice has no object to focus on. There is nothing to do.', 5500),
      L('Not even the breath needs to be managed. Simply be present, exactly as you are.', 6000),
    ], ALPHA),
    phase('body', 'body', [
      L('Let awareness be open, like the sky — vast enough to hold anything that arises.', 6500),
      L('Sounds, sensations, thoughts — let them come and go, like weather passing through open sky.', 6500),
      L('You are not trying to stop thinking. You are simply not chasing any single thought.', 6500),
      L('If you notice you’ve been carried away by a thought, that noticing is already awareness.', 6500),
      L('There is no better state to reach. This, exactly as it is, is the practice.', 7000),
      L('Simply sit. Simply be aware. Nothing to add, nothing to take away.', 8000),
    ], THETA),
    phase('outro', 'outro', [
      L('Let this open awareness remain as you begin to move gently.', 4500),
      L('When you’re ready, let your eyes open.', 3500),
    ]),
  ],
};

// 5. Self-inquiry — secularized "Who am I?" in the style of Ramana
// Maharshi's atma-vichara and modern non-dual pointers (Waking Up,
// the Headless Way's simple looking-back experiments).
const selfInquiry = {
  id: 'self-inquiry',
  title: 'Self-Inquiry',
  category: 'meditation',
  tradition: 'Advaita Vedanta-inspired self-inquiry, secularized',
  aboutBlurb:
    'Draws on Ramana Maharshi’s self-inquiry and on simple modern non-dual "looking" exercises. This is investigative rather than relaxing — it invites you to look directly at your own experience, not to think about it.',
  defaultRate: 0.85,
  phases: [
    phase('intro', 'intro', [
      L('Sit comfortably, eyes open or closed, whichever lets you look inward more easily.', 5500),
      L('This isn’t about relaxing. It’s about looking closely at your own direct experience.', 6000),
    ], ALPHA),
    phase('inquiry', 'body', [
      L('Notice that you are aware right now, of sounds, sensations, this voice.', 6000),
      L('Ask yourself, gently and without needing a clever answer: who is aware of this?', 7000),
      L('Don’t reach for a concept. Just look, the way you’d look for your glasses in a room.', 6500),
      L('Notice: can you actually find a separate someone who is looking? Or only looking itself?', 7000),
      L('If a thought arises, ask: who is this thought appearing to?', 6500),
      L('Keep tracing attention back toward whatever is aware, rather than what is noticed.', 6500),
      L('There’s no need to arrive anywhere. Just keep looking, simply and directly.', 7500),
    ], THETA),
    phase('rest', 'body', [
      L('Let the question go now, and simply rest as this open, aware presence.', 7000),
      L('Whatever you noticed, or didn’t, is exactly right for today.', 6000),
    ], THETA),
    phase('outro', 'outro', [
      L('Gently let ordinary thinking resume.', 4000),
      L('When you’re ready, let your eyes open.', 3500),
    ]),
  ],
};

export const MEDITATION_SESSIONS = [breathFocus, bodyScan, lovingKindness, openAwareness, selfInquiry].map(
  (s) => ({ ...s, estimatedMinutes: estimateMinutes(s) })
);
