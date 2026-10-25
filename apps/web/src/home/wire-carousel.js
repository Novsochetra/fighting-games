import { createWheelStepper, swipeStep } from './gestures.js';

function cardIndexOf(target) {
  const card = target?.closest?.('.card');
  return card ? Number(card.dataset.gameIndex) : -1;
}

// A drag that ends in a swipe also ends in a click on a card, which must not pick that card too.
function wireSwipes({ carousel, controller, signal }) {
  let start = null;
  let swiped = false;
  const options = { signal };
  carousel.addEventListener(
    'pointerdown',
    (event) => {
      const isArrow = Boolean(event.target?.closest?.('.carousel__arrow'));
      start = event.button === 0 && !isArrow ? { x: event.clientX, y: event.clientY } : null;
      swiped = false;
    },
    options,
  );
  carousel.addEventListener(
    'pointerup',
    (event) => {
      const step = start
        ? swipeStep({ dx: event.clientX - start.x, dy: event.clientY - start.y })
        : 0;
      start = null;
      swiped = step !== 0 && controller.step(step);
    },
    options,
  );
  carousel.addEventListener('pointercancel', () => (start = null), options);
  return () => {
    const wasSwipe = swiped;
    swiped = false;
    return wasSwipe;
  };
}

function wireWheel({ carousel, controller, window, signal }) {
  const feed = createWheelStepper({ now: () => window.performance.now() });
  const onWheel = (event) => {
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) {
      return;
    }
    // A sideways trackpad swipe would otherwise also take the browser back or forward a page.
    event.preventDefault();
    const step = feed(event);
    if (step !== 0) {
      controller.step(step);
    }
  };
  carousel.addEventListener('wheel', onWheel, { signal, passive: false });
}

export function wireCarousel({ elements, controller, signal }) {
  const { carousel, track, previous, next } = elements;
  const consumeSwipe = wireSwipes({ carousel, controller, signal });
  wireWheel({ carousel, controller, window: carousel.ownerDocument.defaultView, signal });
  track.addEventListener(
    'click',
    (event) => {
      const index = cardIndexOf(event.target);
      if (index < 0 || consumeSwipe()) {
        return;
      }
      if (index === controller.selectedIndex()) {
        controller.open(index, 'card');
      } else {
        controller.select(index, { cue: true });
      }
    },
    { signal },
  );
  previous.addEventListener('click', () => controller.step(-1), { signal });
  next.addEventListener('click', () => controller.step(1), { signal });
}
