import { emitterSpots } from './emitters.js';
import { fillClipped, wrapX } from './motion.js';

const GRAINS = 7;
const FALL_TICKS = 40;

// sand runs off a ledge in spells, so a stream thins out, stops and starts again
function flowOf(spot, tick) {
  const swell = Math.sin(tick * 0.006 + spot.index * 2.4) + Math.sin(tick * 0.017 + spot.index);
  return Math.max(0, Math.min(1, swell * 0.55 + 0.7));
}

// grains fall faster as they go, like real sand, and land in the same place every time
function grainAt(spot, { grain, tick, fall }) {
  const age = wrapX(tick + (grain * FALL_TICKS) / GRAINS + spot.index * 13, FALL_TICKS);
  const progress = age / FALL_TICKS;
  return {
    x: spot.x + (grain % 3 === 0 ? 1 : 0),
    y: spot.y + Math.round(progress * progress * fall),
    progress,
  };
}

function drawStream(painter, spot, { tick, fall, colors }) {
  const flow = flowOf(spot, tick);
  if (flow <= 0) {
    return;
  }
  const [light, dark] = colors;
  painter.use(light).alpha(0.3 * flow);
  fillClipped(painter, { x: spot.x, y: spot.y, width: 1, height: fall });
  for (let grain = 0; grain < Math.ceil(GRAINS * flow); grain++) {
    const { x, y, progress } = grainAt(spot, { grain, tick, fall });
    const landing = y + 1 >= spot.y + fall;
    painter.alpha(flow * (1 - progress * 0.4));
    fillClipped(painter, { x, y, width: 1, height: landing ? 1 : 2 });
  }
  painter.use(dark).alpha(0.35 * flow);
  fillClipped(painter, { x: spot.x - 1, y: spot.y + fall, width: 3, height: 1 });
}

export function drawTrickle(painter, { effect, tick, cameraX, colors }) {
  for (const spot of emitterSpots(effect, cameraX)) {
    const fall = effect.emitters[spot.index].fall;
    drawStream(painter, spot, { tick, fall, colors: colors.trickle });
  }
  painter.alpha(1);
}
