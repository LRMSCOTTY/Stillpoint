import { useEffect, useState } from 'react';

// Pure-CSS breathing circle. `pattern` is an array of [label, seconds] pairs,
// e.g. box breathing [['Inhale',4],['Hold',4],['Exhale',4],['Hold',4]].
export function BreathingPacer({ pattern = [['Inhale', 4], ['Hold', 4], ['Exhale', 4], ['Hold', 4]], active }) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!active) return undefined;
    const [, seconds] = pattern[stepIndex];
    const timer = setTimeout(() => setStepIndex((i) => (i + 1) % pattern.length), seconds * 1000);
    return () => clearTimeout(timer);
  }, [active, stepIndex, pattern]);

  const [label, seconds] = pattern[stepIndex];
  const isInhale = label.toLowerCase().startsWith('in');
  const isExhale = label.toLowerCase().startsWith('ex');
  const scaleClass = isInhale ? 'pacer-grow' : isExhale ? 'pacer-shrink' : 'pacer-hold';

  return (
    <div className="breathing-pacer" aria-hidden="true">
      <div className={`pacer-circle ${active ? scaleClass : ''}`} style={{ '--duration': `${seconds}s` }}>
        <span className="pacer-label">{active ? label : ''}</span>
      </div>
    </div>
  );
}
