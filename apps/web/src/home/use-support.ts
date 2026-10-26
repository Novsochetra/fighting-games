import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { useArcade, type Arcade } from '../arcade/arcade-context';
import { useRootClass } from '../arcade/use-root-class';
import { useIsTopScreen } from '../arcade/ScreenStack';
import { EVENTS } from './analytics-events.js';
import {
  isBackFromGame,
  shouldOfferSupport,
  SUPPORT_RESHOW_MS,
  SUPPORT_SNOOZE_MS,
} from './support-offer.js';
import { usePageShow } from './use-page-show';

function lookForReturn(preferences: Arcade['preferences']) {
  const playCount = preferences.playCount();
  const isReturn = isBackFromGame({ playCount, seenPlays: preferences.supportSeenPlays() });

  preferences.markSupportSeen(playCount);

  return { isReturn, playCount };
}

// Whether to ask now, which counts as asking: the banner then waits a week to come back.
function looksForSupport({ preferences, analytics, now }: Arcade, othersUp: boolean) {
  const isWanted = shouldOfferSupport({
    ...lookForReturn(preferences),
    hasGiven: preferences.hasGiven(),
    snoozedUntil: preferences.supportSnoozedUntil(),
    now: now(),
  });

  if (!isWanted || othersUp) {
    return false;
  }

  preferences.snoozeSupport(now() + SUPPORT_RESHOW_MS);
  analytics.track(EVENTS.supportShown);

  return true;
}

// The first look is the page's, made once however often React renders the arcade.
const firstLooks = new WeakMap<Arcade, boolean>();

function firstLook(arcade: Arcade, othersUp: boolean) {
  if (!firstLooks.has(arcade)) {
    firstLooks.set(arcade, looksForSupport(arcade, othersUp));
  }

  return firstLooks.get(arcade)!;
}

function useOnBackOnTop(onBack: () => void) {
  const isTop = useIsTopScreen();
  const wasTop = useRef(isTop);
  const back = useEffectEvent(onBack);

  useEffect(() => {
    if (isTop && !wasTop.current) {
      back();
    }

    wasTop.current = isTop;
  }, [isTop]);
}

// The install and analytics banners take the same place, so the arcade asks one thing at a time.
export function useSupport({ othersUp }: { othersUp: boolean }) {
  const arcade = useArcade();
  const { preferences, sound, analytics, now } = arcade;
  const [shown, setShown] = useState(() => firstLook(arcade, othersUp));
  // back on the arcade, from a game or from the supporters screen, it looks again, and steps
  // aside for a gift made meanwhile
  const lookAgain = () => {
    if (preferences.hasGiven()) {
      setShown(false);
    } else if (!shown && looksForSupport(arcade, othersUp)) {
      setShown(true);
    }
  };

  useRootClass('has-support-banner', shown);
  usePageShow(lookAgain);
  useOnBackOnTop(lookAgain);

  return {
    shown,
    notNow() {
      preferences.snoozeSupport(now() + SUPPORT_SNOOZE_MS);
      setShown(false);
      sound.play('sheetClose');
      analytics.track(EVENTS.supportDismiss);
    },
  };
}
