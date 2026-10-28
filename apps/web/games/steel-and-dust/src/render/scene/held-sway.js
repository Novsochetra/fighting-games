import { boughSway } from './bough-sway.js';

// a part of the trees moves to the next pixel only once its motion is this far past halfway there,
// and having moved one way it holds there a few ticks before it may move back: so however little a
// part gives, a swing turning at the edge of a pixel never flicks it there and straight back
const DEAD_BAND = 0.15;
const HOLD_TICKS = 4;

// the trees move in proportion to how much they give, in this many steps from still to all of it
export const GIVE_STEPS = 16;

// each raider's motion in the trees, tick by tick from when the first of them came, scaled by how
// those trees give
export function swayLines(sources) {
  const span = Math.max(...sources.map((source) => source.time));

  return sources.map(({ time, give }) =>
    Array.from({ length: span + 1 }, (_, tick) => {
      const { sway, sag } = boughSway(time - span + tick);

      return { sway: sway * give.sway, sag: sag * give.sag };
    }),
  );
}

// one pixel at a time, so no part ever moves more than a pixel a tick
function hold(axis, target, tick) {
  const way = Math.sign(target - axis.offset);
  const free = way === axis.way || tick - axis.since >= HOLD_TICKS;

  if (Math.abs(target - axis.offset) >= 0.5 + DEAD_BAND && free) {
    axis.offset += way;
    axis.way = way;
    axis.since = tick;
  }
}

const stillAxis = () => ({ offset: 0, way: 0, since: -HOLD_TICKS });

// a part of the trees that gives `steps` to each raider, not moved yet
export function stillMix(steps) {
  return { shares: steps.map((step) => step / GIVE_STEPS), sway: stillAxis(), sag: stillAxis() };
}

// plays a part of the trees on through the ticks of `lines` from `from`: its share of every
// raider's motion added up, so two raiders shaking it never move it by more than one would in a
// tick; the whole pixels it comes to are its `sway.offset` and `sag.offset`
export function playMix(mix, lines, from) {
  for (let tick = from; tick < lines[0].length; tick++) {
    let swayTarget = 0;
    let sagTarget = 0;

    for (let source = 0; source < lines.length; source++) {
      swayTarget += lines[source][tick].sway * mix.shares[source];
      sagTarget += lines[source][tick].sag * mix.shares[source];
    }

    hold(mix.sway, swayTarget, tick);
    hold(mix.sag, sagTarget, tick);
  }

  return mix;
}

// the whole pixels a part of the trees is moved by now, played through from the first tick, so it
// is the same however many frames were drawn
export function heldOffset(lines, steps) {
  const { sway, sag } = playMix(stillMix(steps), lines, 0);

  return { dx: sway.offset, dy: sag.offset };
}
