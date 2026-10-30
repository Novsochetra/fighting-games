import { useLayoutEffect, useRef, useState } from 'react';
import { settleEntrances } from './arrive-drawn';
import { useScreenRole } from './ScreenStack';

// A screen that slides in arrives drawn, as an iOS screen does. The entrances it plays as its page
// loads (its parts rising in) would replay over the slide each time, coming in late and dropping
// the slide's first frames. Parts that come in later, as a list loads, still rise in.
export function useArriveDrawn<T extends HTMLElement>(entrances: readonly string[]) {
  const root = useRef<T>(null);
  const role = useScreenRole();
  const [slidesIn] = useState(role === 'front' || role === 'back');

  useLayoutEffect(() => {
    if (slidesIn && root.current) {
      settleEntrances(root.current, entrances);
    }
  }, [slidesIn, entrances]);

  return root;
}
