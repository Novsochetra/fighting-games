import {
  animateWith,
  prefersReducedMotion,
  readDuration,
  readTiming,
  readToken,
} from '@/styles/motion-tokens.js';

// a move this small is rounding, not a change of place
const STILL_PX = 0.5;

const isShown = (element) => !element.hidden && element.getClientRects().length > 0;

// What each element does through a change, from where it was and where it is now: one shown in both
// glides from its old place, one that comes rises in, and one that goes fades out where it stood.
export function planSwap(before, after) {
  return before.map((was, i) => {
    const now = after[i];

    if (was.shown && now.shown) {
      const dx = was.rect.left - now.rect.left;
      const dy = was.rect.top - now.rect.top;
      const moved = Math.abs(dx) > STILL_PX || Math.abs(dy) > STILL_PX;

      return moved ? { kind: 'move', dx, dy } : { kind: 'stay' };
    }

    if (now.shown) {
      return { kind: 'enter' };
    }

    return { kind: was.shown && was.opacity > 0 ? 'leave' : 'none' };
  });
}

function measure(element) {
  const shown = isShown(element);
  const style = element.ownerDocument.defaultView.getComputedStyle(element);

  return {
    shown,
    rect: shown ? element.getBoundingClientRect() : null,
    opacity: shown ? Number(style.opacity || 1) : 0,
  };
}

// The element has already left the layout, so a copy taken before the change stands where it was
// and fades there. The copy drops its ids and stays out of reach, so it is never found, focused or
// announced in the element's place.
function standInFor(element, copy, was) {
  for (const node of [copy, ...copy.querySelectorAll('[id]')]) {
    node.removeAttribute('id');
  }

  copy.setAttribute('inert', '');
  copy.setAttribute('aria-hidden', 'true');
  Object.assign(copy.style, {
    position: 'absolute',
    top: '0',
    left: '0',
    margin: '0',
    boxSizing: 'border-box',
    inlineSize: `${was.rect.width}px`,
    blockSize: `${was.rect.height}px`,
    pointerEvents: 'none',
  });
  element.before(copy);
  const origin = copy.getBoundingClientRect();

  copy.style.top = `${was.rect.top - origin.top}px`;
  copy.style.left = `${was.rect.left - origin.left}px`;

  return copy;
}

function fadeOut(element, copy, { was, timing }) {
  const ghost = standInFor(element, copy, was);
  const fade = animateWith(ghost, [{ opacity: was.opacity }, { opacity: 0 }], {
    ...timing.leave,
    fill: 'forwards',
  });
  const remove = () => ghost.remove();

  if (!fade) {
    remove();
    return null;
  }

  fade.finished.then(remove, remove);

  return fade;
}

function readSwapTiming(document) {
  return {
    move: readTiming(document, { duration: '--duration-rise', easing: '--easing-spring' }),
    leave: readTiming(document, { duration: '--duration-normal', easing: '--easing-standard' }),
    stagger: readDuration(document, '--duration-stagger') / 2,
    rise: readToken(document, '--offset-rise') || '0px',
  };
}

// What comes in waits while the rest makes room, as on iOS: rising at once, the stats came in under
// Become a supporter as it still slid down across them.
export function enterDelay(plan, { leave }) {
  const makesRoom = plan.some((step) => step.kind === 'move' || step.kind === 'leave');

  return makesRoom ? leave.duration : 0;
}

function play(elements, { plan, before, copies, timing }) {
  const wait = enterDelay(plan, timing);
  let entered = 0;

  return plan.map((step, i) => {
    const element = elements[i];

    if (step.kind === 'move') {
      const frames = [{ translate: `${step.dx}px ${step.dy}px` }, { translate: '0 0' }];

      return animateWith(element, frames, timing.move);
    }

    if (step.kind === 'enter') {
      const frames = [
        { opacity: 0, translate: `0 ${timing.rise}` },
        { opacity: 1, translate: '0 0' },
      ];
      const delay = wait + entered++ * timing.stagger;

      return animateWith(element, frames, { ...timing.move, delay, fill: 'backwards' });
    }

    return step.kind === 'leave' ? fadeOut(element, copies[i], { was: before[i], timing }) : null;
  });
}

// Canceling rejects the animation's finished promise; browsers count that as handled, but not every
// engine does, and a stopped glide is no error.
export function stopSwap(running) {
  for (const animation of running.splice(0)) {
    animation.finished.catch(() => {});
    animation.cancel();
  }
}

function canAnimate(document) {
  const window = document.defaultView;

  return !prefersReducedMotion(window) && readDuration(document, '--duration-rise') > 0;
}

// Where the blocks show just before a change, none inside another; null when nothing animates.
export function snapshotSwap(elements) {
  if (!canAnimate(elements[0].ownerDocument)) {
    return null;
  }

  const before = elements.map(measure);
  const copies = elements.map((element, i) => (before[i].shown ? element.cloneNode(true) : null));

  return { before, copies };
}

// Moves the blocks from where the snapshot saw them to where the change put them.
export function playSwap(elements, { before, copies }) {
  const plan = planSwap(before, elements.map(measure));
  const timing = readSwapTiming(elements[0].ownerDocument);

  return play(elements, { plan, before, copies, timing }).filter(Boolean);
}
