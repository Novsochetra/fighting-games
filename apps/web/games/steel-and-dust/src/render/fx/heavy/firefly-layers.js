import { FIREFLY_HEAVY_ART as ART } from '../../../art/heavy-fx/firefly.js';
import {
  swarmBugAt,
  swarmKnotOf,
  swarmOrbit,
  windupShare,
} from '../../../sim/fx/heavy/firefly-orbit.js';
import { flicker } from '../fine-pixels.js';
import { drawBug } from './firefly-bug.js';

// matches the shared glow, which turns hot two ticks before the strike
const HOT_LEAD = 2;
const TAIL = [0.3, 0.6, 0.9, 1.2];
const TAIL_COLORS = [ART.lanternDim, ART.lantern, ART.lanternHot];
const KNOT_BANDS = [
  { color: ART.wing, alpha: 0.5, size: 3 },
  { color: ART.lantern, alpha: 0.8, size: 2 },
  { color: ART.lanternHot, alpha: 1, size: 1 },
];

// the swarm blinks out of step as it gathers, more of it lit each tick, then flashes as one
function swarmLevel({ move, time, tickCount }, i) {
  if (time >= move.startup - HOT_LEAD) {
    return 2;
  }
  const share = windupShare(move, time);
  return flicker(i + 31, tickCount >> 1) < 0.3 + 0.7 * share ? 1 : 0;
}

// where each firefly was a moment ago, fading: the streaks that show the swarm turning
function drawTail(painter, { layer, bug, level, front }) {
  const { fighter, move, time } = layer;
  painter.use(TAIL_COLORS[level]);
  TAIL.forEach((back, step) => {
    const past = swarmBugAt(fighter, { move, time: time - back, i: bug.i });
    if (past.front === front) {
      painter.alpha((0.55 - step * 0.12) * Math.min(1, time / 2)).rect(past.x, past.y, 1, 1);
    }
  });
  painter.alpha(1);
}

// the half of the circling swarm behind the hero or the half in front of it
function drawSwarm(painter, layer, front) {
  const { fighter, move, time, tickCount } = layer;
  if (time > move.startup) {
    return;
  }
  for (const bug of swarmOrbit(fighter, move, time)) {
    const level = swarmLevel(layer, bug.i);
    drawTail(painter, { layer, bug, level, front });
    if (bug.front === front) {
      const flap = (tickCount + bug.i) % 2;
      drawBug(painter, { ...bug, level, flap, fade: (time + 1) / 2 });
    }
  }
}

// the swarm drawn in tight, its lanterns run together into one light that swells to the strike,
// rimmed in its wings' cyan so it stands out from the golden smear of the swing
function drawKnot(painter, { fighter, move, time }) {
  const hot = time - (move.startup - HOT_LEAD);
  if (hot < 0 || time > move.startup) {
    return;
  }
  const { x, y } = swarmKnotOf(fighter, move);
  const swell = Math.min(hot, 1);
  for (const { color, alpha, size } of KNOT_BANDS) {
    painter
      .alpha(alpha)
      .use(color)
      .diamond(x, y, size + swell);
  }
  painter.use(ART.heart).diamond(x, y, hot > 1 ? 1 : 0);
}

export function drawSwarmBehind(painter, layer) {
  drawSwarm(painter, layer, false);
}

export function drawSwarmInFront(painter, layer) {
  drawSwarm(painter, layer, true);
  drawKnot(painter, layer);
}
