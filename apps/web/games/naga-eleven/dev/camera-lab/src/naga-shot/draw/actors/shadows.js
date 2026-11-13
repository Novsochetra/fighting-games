import { isShown } from '../../layers.js';
import { GROUND } from '../../world.js';
import { ditherAt } from '../stadium/layers.js';
import { TURF_TONES } from '../stadium/palette.js';

// a shadow darkens the grass's own tones, so the mown stripes and the lines show through it, as a
// palette's shadow does; the stand's floodlights throw two fainter ones out to either side
const FLOODLIT = [
  { dx: 0, width: 1, depth: 2 },
  { dx: -9, width: 0.8, depth: 1 },
  { dx: 9, width: 0.8, depth: 1 },
];

const DEEPEST = TURF_TONES.dark - 3;

const BALL_FOOT = 6;

const shrinkOf = (lift) => Math.max(0.45, 1 - Math.max(0, lift) / 36);

function footprintOf(pose) {
  const lying = pose.animation === 'dive' && pose.frame >= 3;
  const shrink = shrinkOf(GROUND - pose.y);

  return {
    x: pose.x - (lying ? 12 : 0) - (pose.direction === 'west' ? 1 : 0),
    radius: (lying ? 20 : 10) * shrink,
    rows: 2.2 * shrink,
  };
}

function shadeOne(tones, { view, footprint, cast }) {
  const radius = footprint.radius * cast.width;
  const middle = footprint.x + cast.dx * (footprint.radius / 10);
  const top = Math.max(view.top, Math.floor(GROUND - footprint.rows));
  const bottom = Math.min(view.top + view.height, Math.ceil(GROUND + footprint.rows));

  for (let y = top; y < bottom; y += 1) {
    const down = (y + 0.5 - GROUND) / footprint.rows;
    const half = radius * Math.sqrt(Math.max(0, 1 - down * down));
    const from = Math.max(view.from, Math.round(middle - half));
    const to = Math.min(view.from + view.width, Math.round(middle + half));

    for (let x = from; x < to; x += 1) {
      const at = (y - view.top) * view.stride + (x - view.from);
      const edge = Math.abs(x + 0.5 - middle) > half - 2 && ditherAt(x, y) < 0.5;
      const shaded =
        tones[at] >= TURF_TONES.lineShade ? TURF_TONES.lineShade - 3 : tones[at] - cast.depth;

      tones[at] = Math.max(DEEPEST, shaded + edge);
    }
  }
}

// the ball's own, so it can be told on the ground from in the air
function ballFootprint({ ball }) {
  const shrink = shrinkOf(GROUND - BALL_FOOT - ball.y);

  return { x: ball.x, radius: 5 * shrink, rows: 1.4 * shrink };
}

const SHADOWED = [
  ['player', (moment) => footprintOf(moment.player)],
  ['keeper', (moment) => footprintOf(moment.keeper)],
  ['ball', ballFootprint],
];

export function shadeShadows(tones, { view, moment }) {
  SHADOWED.filter(([layer]) => isShown(moment.settings, layer)).forEach(([, footprintAt]) => {
    const footprint = footprintAt(moment);

    FLOODLIT.forEach((cast) => shadeOne(tones, { view, footprint, cast }));
  });
}
