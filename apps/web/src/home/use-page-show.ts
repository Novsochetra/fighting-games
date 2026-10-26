import { useEffect, useEffectEvent } from 'react';
import { useArcade } from '../arcade/arcade-context';

// The back/forward cache brings the arcade back as it was left, without loading it again: back from a
// game, it runs this.
export function usePageShow(onRestored: () => void) {
  const { window } = useArcade();
  const restored = useEffectEvent(onRestored);

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        restored();
      }
    };

    window.addEventListener('pageshow', onPageShow);

    return () => window.removeEventListener('pageshow', onPageShow);
  }, [window]);
}
