import { prefersReducedMotion, readTiming, readToken } from '../home/motion-tokens.js';
import type { Move } from './stack-model';

export interface Slide {
  front: Keyframe[];
  back: Keyframe[];
}

export interface SlideLook {
  offsetUnder: string;
  dimUnder: string;
  shadow: string;
  reduced: boolean;
}

const AT_REST: Keyframe = { translate: '0 0', filter: 'none', opacity: 1 };

// A push slides the screen arriving in from the right with a shadow on its edge, over the one left,
// which slides a little to the left and dims; a pop plays it backwards, as an iOS navigation stack
// does. With reduced motion the screen arriving or leaving only fades, as iOS dissolves.
export function slideFrames(move: Exclude<Move, 'none'>, look: SlideLook): Slide {
  if (look.reduced) {
    const shown = [{ opacity: 0 }, { opacity: 1 }];

    return move === 'push'
      ? { front: shown, back: [AT_REST, AT_REST] }
      : { front: [...shown].reverse(), back: [AT_REST, AT_REST] };
  }

  const offside: Keyframe = { translate: '100% 0', boxShadow: look.shadow };
  const onTop: Keyframe = { translate: '0 0', boxShadow: look.shadow };
  const under: Keyframe = {
    translate: `${look.offsetUnder} 0`,
    filter: `brightness(${look.dimUnder})`,
  };

  return move === 'push'
    ? { front: [offside, onTop], back: [AT_REST, under] }
    : { front: [onTop, offside], back: [under, AT_REST] };
}

const lookOf = (document: Document): SlideLook => ({
  offsetUnder: readToken(document, '--offset-under') || '-30%',
  dimUnder: readToken(document, '--dim-under') || '1',
  shadow: readToken(document, '--shadow-navigation') || 'none',
  reduced: prefersReducedMotion(document.defaultView),
});

// Plays a move on its two layers and settles once both have; without the tokens' timing (the
// tests) it settles at once. Each layer holds the move's last frame until the stack settles and
// cancels it, since one that went back to rest first stood a popped screen over the window again
// for a frame.
export function playMove(
  move: Exclude<Move, 'none'>,
  layers: { front: HTMLElement; back: HTMLElement },
): { finished: Promise<void>; cancel: () => void } {
  const document = layers.front.ownerDocument;
  const timing = readTiming(document, {
    duration: '--duration-navigation',
    easing: '--easing-navigation',
  });

  if (timing.duration <= 0 || !layers.front.animate) {
    return { finished: Promise.resolve(), cancel: () => {} };
  }

  const frames = slideFrames(move, lookOf(document));
  const held = { ...timing, fill: 'forwards' as const };
  const animations = [
    layers.front.animate(frames.front, held),
    layers.back.animate(frames.back, held),
  ];
  const finished = Promise.all(animations.map((animation) => animation.finished)).then(
    () => {},
    () => {},
  );

  return { finished, cancel: () => animations.forEach((animation) => animation.cancel()) };
}
