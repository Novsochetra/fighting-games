import { useEffect, useState, type RefObject } from 'react';
import { useArcade } from '@/services/arcade-context';
import { firstTurn, nextTurn } from './banner-turn.js';

// as long as --duration-banner-drift lets a banner zoom, less the crossfade (wallpapers-callout.css)
export const BANNER_TURN_MS = 6000;

// IntersectionObserver is a global of the browser, which the DOM's Window type does not name.
type ObservedWindow = Window & { IntersectionObserver?: typeof IntersectionObserver };

const observerOf = (window: Window) => (window as ObservedWindow).IntersectionObserver;

// The banners turn only while the card is on the screen, the page is in view and no pointer or
// focus rests on the card, and never for a visitor who asks for reduced motion.
export function useBannerTurn(count: number, card: RefObject<HTMLElement | null>) {
  const { window } = useArcade();
  const [turn, setTurn] = useState(firstTurn);
  const [isOnScreen, setOnScreen] = useState(() => !observerOf(window));
  const [isHeld, setHeld] = useState(false);

  useEffect(() => {
    const Observer = observerOf(window);

    if (!Observer || !card.current) {
      return undefined;
    }

    const observer = new Observer(([entry]: IntersectionObserverEntry[]) =>
      setOnScreen(Boolean(entry?.isIntersecting)),
    );

    observer.observe(card.current);

    return () => observer.disconnect();
  }, [window, card]);

  useEffect(() => {
    const isStill = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!isOnScreen || isHeld || isStill || count < 2) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      if (!window.document.hidden) {
        setTurn((last) => nextTurn(last, count));
      }
    }, BANNER_TURN_MS);

    return () => window.clearInterval(timer);
  }, [window, isOnScreen, isHeld, count]);

  return { turn, hold: () => setHeld(true), release: () => setHeld(false) };
}
