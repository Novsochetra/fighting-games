import { isHoldingThrow } from './throw-in.js';

// a fall or a slide plays from the tick it was first seen, and a throw-in's release from the last
// tick the ball was held, which the match does not keep
export function createMemory() {
  return { match: null, starts: [] };
}

export function startsOf(memory, match, player) {
  if (memory.match !== match) {
    memory.match = match;
    memory.starts = [];
  }

  memory.starts[player.index] ??= {};

  const starts = memory.starts[player.index];

  starts.fall = startOf(starts.fall, player.stun > 0, match.tick);
  starts.slide = startOf(starts.slide, player.tackle > 0, match.tick);
  starts.throwHeld = isHoldingThrow(match, player) ? match.tick : starts.throwHeld;

  return starts;
}

// the tick an action was first seen on, kept while it lasts; a match played back starts afresh
function startOf(start, isOn, tick) {
  if (!isOn) {
    return undefined;
  }

  return start === undefined || start > tick ? tick : start;
}
