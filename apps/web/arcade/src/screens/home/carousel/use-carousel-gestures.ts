import { useEffect, useEffectEvent, useRef, type MouseEvent, type RefObject } from 'react';
import { createWheelStepper, swipeStep } from './gestures.js';
import { useHome } from '@/screens/home/home-context';

type Start = { x: number; y: number } | null;

// A drag that ends in a swipe also ends in a click on a card, which must not pick that card too.
function useSwipes(carousel: RefObject<HTMLElement | null>, step: (delta: number) => boolean) {
  const swipedRef = useRef(false);
  const onStep = useEffectEvent(step);

  useEffect(() => {
    const element = carousel.current!;
    const lifetime = new AbortController();
    const options = { signal: lifetime.signal };
    let start: Start = null;

    element.addEventListener(
      'pointerdown',
      (event) => {
        const isControl = Boolean(
          (event.target as Element)?.closest?.('.carousel__arrow, .save-button'),
        );

        start = event.button === 0 && !isControl ? { x: event.clientX, y: event.clientY } : null;
        swipedRef.current = false;
      },
      options,
    );
    element.addEventListener(
      'pointerup',
      (event) => {
        const delta = start
          ? swipeStep({ dx: event.clientX - start.x, dy: event.clientY - start.y })
          : 0;

        start = null;
        swipedRef.current = delta !== 0 && onStep(delta);
      },
      options,
    );
    element.addEventListener('pointercancel', () => (start = null), options);

    return () => lifetime.abort();
  }, [carousel]);

  return swipedRef;
}

// A sideways trackpad swipe moves one card, and would otherwise also take the browser back or
// forward a page, so the carousel holds on to it (passive: false).
function useWheel(carousel: RefObject<HTMLElement | null>, step: (delta: number) => boolean) {
  const onStep = useEffectEvent(step);

  useEffect(() => {
    const element = carousel.current!;
    const window = element.ownerDocument.defaultView!;
    const feed = createWheelStepper({ now: () => window.performance.now() });
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) {
        return;
      }

      event.preventDefault();
      const delta = feed(event);

      if (delta !== 0) {
        onStep(delta);
      }
    };

    element.addEventListener('wheel', onWheel, { passive: false });

    return () => element.removeEventListener('wheel', onWheel);
  }, [carousel]);
}

// Swipes and the wheel turn the carousel; a click picks a card, and opens the one already picked.
export function useCarouselGestures(carousel: RefObject<HTMLElement | null>) {
  const home = useHome();
  const swipedRef = useSwipes(carousel, home.step);

  useWheel(carousel, home.step);

  return (event: MouseEvent<HTMLElement>) => {
    const card = (event.target as Element).closest?.<HTMLElement>('.card');
    const index = card ? Number(card.dataset.gameIndex) : -1;
    const wasSwipe = swipedRef.current;

    swipedRef.current = false;

    if (index < 0 || wasSwipe) {
      return;
    }

    if (index === home.selected) {
      home.open(index, 'card');
    } else {
      home.select(index, { cue: true });
    }
  };
}
