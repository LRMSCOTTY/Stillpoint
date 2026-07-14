import { L, phase, estimateMinutes } from './schema.js';

// Hypnosis session binaural carrier is 888Hz — the "abundance frequency"
// popularized in manifestation/wealth audio content. This is a genre
// convention, not a clinically validated frequency; the app says so
// plainly in the aboutBlurb rather than implying a scientific claim.
const ABUNDANCE_ALPHA = { carrier: 888, beat: 10 };
const ABUNDANCE_THETA = { carrier: 888, beat: 6 };
const ABUNDANCE_DELTA = { carrier: 888, beat: 3 };

// Structure follows the real 4-stage clinical self-hypnosis session shape:
// pre-talk -> induction -> deepener -> suggestion/visualization -> emergence.
// Induction is modeled on the Dave Elman induction (breath, eye closure,
// eyelid-heaviness suggestion, mental arm-heaviness, backward counting
// with "twice as relaxed" repetition to quiet the mind) — the technique
// most widely taught as the clinical standard for speed and depth.
// Suggestion phrasing follows Ericksonian permissive convention ("you may
// notice...", "you can begin to...") and is deliberately built on
// self-efficacy (Bandura/Maddux: mental rehearsal raising confidence and
// follow-through) rather than literal "money will manifest" claims, which
// have no scientific support and are not used here.
export const HYPNOSIS_SESSION = {
  id: 'wealth-confidence',
  title: 'Wealth & Confidence Mindset',
  category: 'hypnosis',
  tradition: 'Self-hypnosis — Elman-style induction, Ericksonian permissive suggestion',
  aboutBlurb:
    'A self-hypnosis session built on real clinical technique: an Elman-style rapid induction, a staircase deepener, and a suggestion phase aimed at confidence, decisiveness, and follow-through. This is a focused visualization and self-suggestion practice — the honest mechanism is self-efficacy, not magic. It cannot promise a specific financial outcome, guarantee wealth, or replace real financial, legal, or medical advice. Not recommended during active psychosis or certain dissociative conditions — check with a clinician if that applies to you.',
  defaultRate: 0.82,
  phases: [
    phase('pretalk', 'pretalk', [
      L('Before we begin, a quick word. Hypnosis is not sleep, and you are never out of control.', 5500),
      L('You can hear everything, and you can open your eyes at any moment you choose.', 5500),
      L('All hypnosis is really self-hypnosis — I am only here to guide your own focus.', 6000),
      L('This is a practice for building confidence and clear-headed follow-through, nothing more mystical than that.', 6500),
      L('When you’re ready, find a seated position where you won’t be disturbed for the next while.', 5000),
    ]),
    phase('induction', 'induction', [
      L('Take one slow, deep breath in, and let it all the way out.', 5000),
      L('Let your eyes close now.', 4000),
      L('Imagine your eyelids growing pleasantly heavy, as if they no longer want to open.', 6000),
      L('That’s right. Heavier and heavier, and more relaxed with every passing second.', 6000),
      L('Now let that same heavy, relaxed feeling flow down into your arms.', 5500),
      L('Your arms may feel loose, or warm, or simply pleasantly still. Whatever you notice is right.', 6000),
      L('In a moment I’ll count backward from ten to one.', 4500),
      L('With each number, let yourself become twice as relaxed as the number before.', 6000),
      L('Ten. Twice as relaxed.', 4500),
      L('Nine. Twice as relaxed again.', 4500),
      L('Eight. Deeper still.', 4000),
      L('Seven. Letting go a little more.', 4500),
      L('Six. Twice as relaxed.', 4500),
      L('Five. Sinking comfortably down.', 4500),
      L('Four. Deeper and calmer.', 4500),
      L('Three. Almost all the way now.', 4500),
      L('Two. Twice as relaxed.', 4500),
      L('One. Completely, comfortably relaxed.', 6000),
    ], ABUNDANCE_ALPHA),
    phase('deepener', 'deepener', [
      L('Now imagine yourself standing at the top of a quiet staircase, ten steps leading down.', 6000),
      L('With each step, you’ll go twice as deep into this relaxed, focused state.', 6000),
      L('Ten. Stepping down.', 4000),
      L('Nine. Deeper.', 3500),
      L('Eight. Further down and further in.', 4500),
      L('Seven. Six. Deeper still.', 4500),
      L('Five. Halfway down, halfway deeper.', 5000),
      L('Four. Three.', 4000),
      L('Two. Almost at the bottom now.', 4500),
      L('One. All the way down, into a calm, focused, receptive state.', 6500),
    ], ABUNDANCE_THETA),
    phase('suggestion', 'suggestion', [
      L('In this calm state, your mind is simply more receptive to ideas you choose to accept.', 6000),
      L('You may notice a new steadiness in how you think about money and opportunity.', 6000),
      L('You can begin to release any old belief that says you don’t deserve success.', 6500),
      L('That belief was never really true. You are allowed to want more, and to pursue it clearly.', 6500),
      L('You may find yourself noticing opportunities you would have overlooked before.', 6000),
      L('When a good opportunity appears, you can recognize it, and act on it without needless hesitation.', 6500),
      L('You are becoming someone who follows through — who starts what they say they’ll start, and finishes it.', 6500),
      L('Mistakes and setbacks are simply information now, not reasons to stop.', 6000),
      L('You may notice your decisions becoming calmer, clearer, and more decisive.', 6000),
      L('Your confidence is not loud or arrogant. It is quiet, and it is solid.', 6500),
    ], ABUNDANCE_THETA),
    phase('visualization', 'visualization', [
      L('Picture a specific moment in your future, when your discipline has clearly paid off.', 6500),
      L('See where you are. Notice what you’re wearing, who is with you, what you can hear.', 6500),
      L('Feel the calm, earned confidence of having built this, step by step, choice by choice.', 6500),
      L('Now bring your thumb and one finger gently together, and hold that touch.', 6000),
      L('Let this touch link itself to exactly this feeling of grounded confidence.', 6500),
      L('From now on, this same touch can call this feeling back, any time you choose.', 6500),
      L('Release your fingers now, and simply rest in this state for a moment longer.', 6500),
    ], ABUNDANCE_DELTA),
    phase('emergence', 'emergence', [
      L('In a moment, I’ll count from one to five, and you’ll return fully alert.', 5000),
      L('One. Beginning to return.', 4000),
      L('Two. Energy returning to your arms and legs.', 4500),
      L('Three. Becoming more alert, halfway back now.', 4500),
      L('Four. Eyelids ready to open, fully aware of the room around you.', 5000),
      L('Five. Eyes open, fully alert, wide awake, and refreshed.', 5500),
    ]),
  ],
  // Guaranteed short re-alerting sequence — kept OUT of the normal
  // sequential `phases` array (never played as part of natural
  // completion) and only reached via the forced-emergence chokepoint in
  // useSessionPlayer when a session is stopped or skipped early. This
  // ensures no one is ever left mid-suggestion or mid-trance.
  emergenceQuick: phase('emergence_quick', 'emergence_quick', [
    L('Let’s bring you back now. In a moment, count from one to five with me.', 4000),
    L('One, two, three — energy returning to your whole body.', 4500),
    L('Four, five — eyes open, fully alert, and wide awake.', 4500),
  ]),
};

HYPNOSIS_SESSION.estimatedMinutes = estimateMinutes(HYPNOSIS_SESSION);
