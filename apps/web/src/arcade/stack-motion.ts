import { prefersReducedMotion, readTiming, readToken } from '../home/motion-tokens.js';
import type { Move } from './stack-model';

export interface Slide {
  front: Keyframe[];
  back: Keyframe[];
}

export interface SlideLook {
  motion: 'slide' | 'zoom';
  offsetUnder: string;
  dimUnder: string;
  shadow: string;
  scaleUnder: string;
  scaleAway: string;
  reduced: boolean;
}

const AT_REST: Keyframe = { translate: '0 0', filter: 'none', opacity: 1 };

const playedAs = (move: Exclude<Move, 'none'>, push: Slide): Slide =>
  move === 'push' ? push : { front: [...push.front].reverse(), back: [...push.back].reverse() };

// The two screens trade places early in a zoom, while it is still settling, since a fade as long as
// the zoom left a ghost of the screen gone over the one arrived.
const FADED_AT = 0.85;

// A push zooms in, as a desktop app goes into a folder: the screen arriving grows into place as it
// fades in over the one left, which grows a little past the viewer; a pop zooms back out. Only
// opacity and scale change, so the compositor plays the move alone, never waiting on the screen's
// own work.
function zoomFrames(move: Exclude<Move, 'none'>, look: SlideLook): Slide {
  const away: Keyframe = { opacity: 0, scale: look.scaleAway };
  const arrived: Keyframe = { opacity: 1, scale: '1' };
  const back = [{ scale: '1' }, { scale: look.scaleUnder }];

  return move === 'push'
    ? { front: [away, { opacity: 1, offset: FADED_AT }, arrived], back }
    : { front: [arrived, { opacity: 0, offset: FADED_AT }, away], back: back.reverse() };
}

// A push slides the screen arriving in from the right with a shadow on its edge, over the one left,
// which slides a little to the left and dims; a pop plays it backwards, as an iOS navigation stack
// does.
function iosSlideFrames(move: Exclude<Move, 'none'>, look: SlideLook): Slide {
  const offside: Keyframe = { translate: '100% 0', boxShadow: look.shadow };
  const onTop: Keyframe = { translate: '0 0', boxShadow: look.shadow };
  const under: Keyframe = {
    translate: `${look.offsetUnder} 0`,
    filter: `brightness(${look.dimUnder})`,
  };

  return playedAs(move, { front: [offside, onTop], back: [AT_REST, under] });
}

// A move takes its look from the tokens: a phone's slide, or a desktop's zoom. With reduced motion
// the screen arriving or leaving only fades, as iOS dissolves.
export function slideFrames(move: Exclude<Move, 'none'>, look: SlideLook): Slide {
  if (look.reduced) {
    return playedAs(move, { front: [{ opacity: 0 }, { opacity: 1 }], back: [AT_REST, AT_REST] });
  }

  return look.motion === 'zoom' ? zoomFrames(move, look) : iosSlideFrames(move, look);
}

const lookOf = (document: Document): SlideLook => ({
  motion: readToken(document, '--motion-navigation') === 'zoom' ? 'zoom' : 'slide',
  offsetUnder: readToken(document, '--offset-under') || '-30%',
  dimUnder: readToken(document, '--dim-under') || '1',
  shadow: readToken(document, '--shadow-navigation') || 'none',
  scaleUnder: readToken(document, '--scale-under') || '1',
  scaleAway: readToken(document, '--scale-away') || '1',
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
