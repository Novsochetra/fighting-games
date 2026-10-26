import { depthOf, type ScreenId } from './screens';

export type Move = 'push' | 'pop' | 'none';

export interface StackModel {
  // every screen in the document, bottom first: the arcade always, as the stack's root
  layers: ScreenId[];
  top: ScreenId;
  // the screen a move is leaving, until the move settles
  leaving: ScreenId | null;
  move: Move;
  // counts moves, so a move that lands mid-move restarts the animation
  id: number;
}

export interface MoveCause {
  // react-router's navigation type: a browser back or forward is POP
  navigationType: 'PUSH' | 'POP' | 'REPLACE';
  // Back to the arcade on a screen opened on its own pushes the arcade, sliding as Back does
  asPop?: boolean;
}

// Deeper is a push and shallower a pop; between screens at one depth (the credits' link to the
// supporters), a browser back or forward pops and a link pushes.
export function moveBetween(from: ScreenId, to: ScreenId, cause: MoveCause): Move {
  if (from === to) {
    return 'none';
  }

  if (cause.asPop) {
    return 'pop';
  }

  const step = depthOf(to) - depthOf(from);

  if (step !== 0) {
    return step > 0 ? 'push' : 'pop';
  }

  return cause.navigationType === 'POP' ? 'pop' : 'push';
}

const stacked = (top: ScreenId, leaving: ScreenId | null): ScreenId[] => [
  ...new Set<ScreenId>(['home', ...(leaving ? [leaving] : []), top]),
];

export function createStack(top: ScreenId): StackModel {
  return { layers: stacked(top, null), top, leaving: null, move: 'none', id: 0 };
}

export function advanceStack(stack: StackModel, to: ScreenId, cause: MoveCause): StackModel {
  const move = moveBetween(stack.top, to, cause);

  if (move === 'none') {
    return stack;
  }

  return { layers: stacked(to, stack.top), top: to, leaving: stack.top, move, id: stack.id + 1 };
}

// Once a move ends, the screen it left goes, as an iOS screen popped or covered does; the arcade
// stays at the bottom, so it comes back as it was left.
export function settleStack(stack: StackModel): StackModel {
  return { ...stack, layers: stacked(stack.top, null), leaving: null, move: 'none' };
}

// Which screen of a move slides over the other: the one arriving on a push, the one leaving on a pop.
export function frontAndBack(stack: StackModel): { front: ScreenId; back: ScreenId } | null {
  if (!stack.leaving) {
    return null;
  }

  return stack.move === 'push'
    ? { front: stack.top, back: stack.leaving }
    : { front: stack.leaving, back: stack.top };
}
