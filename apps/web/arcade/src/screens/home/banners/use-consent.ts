import { useState } from 'react';
import { useArcade } from '@/services/arcade-context';
import { useRootClass } from '@/hooks/use-root-class';

// The root's class lets a short screen lift the hero's buttons above the banner, and keeps the
// install and support banners out of its place until the player answers.
export function useConsent() {
  const { analytics, sound } = useArcade();
  const [shown, setShown] = useState(() => analytics.needsAnswer());
  const answer = (choose: () => void) => () => {
    choose();
    setShown(false);
    sound.play('sheetClose');
  };

  useRootClass('has-consent-banner', shown);

  return {
    shown,
    // saying no later must be as easy as saying yes, so the foot of the arcade asks again
    canAskAgain: analytics.isEnabled(),
    allow: answer(analytics.allow),
    refuse: answer(analytics.refuse),
    askAgain() {
      setShown(true);
      sound.play('sheetOpen');
    },
  };
}
