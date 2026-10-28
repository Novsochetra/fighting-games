import { VIEW_WIDTH } from '../../config.js';
import { PAINTED_BACKDROPS } from '../../data/backdrops/index.js';
import { clamp } from '../../lib/math.js';
import { missionOf } from '../stage/mission.js';

const MARGIN = 18;
// a raider hides about the thick of a crown, and stands far enough in from a ledge's ends that
// none of it hangs out over them
const CROWN_HIDE = 3;
const LEDGE_INSET = 10;

// the trees, towers and girders of a road's painted layer that raiders wait on to drop from, with
// how fast that layer scrolls; null on a road that drops raiders out of a canopy, or none at all
export function perchesOf(game) {
  const backdrop = PAINTED_BACKDROPS[missionOf(game).theme];

  if (!backdrop?.perches) {
    return null;
  }

  const { parallax } = backdrop.layers.find((layer) => layer.name === backdrop.perches.layer);

  return { ...backdrop.perches, parallax };
}

function anchorRange(spot) {
  if (spot.kind === 'crown') {
    return { from: spot.x - CROWN_HIDE, to: spot.x + CROWN_HIDE };
  }

  return { from: spot.from + LEDGE_INSET, to: spot.to - LEDGE_INSET };
}

// the stretch of the screen where a raider could wait on one copy of a spot, as the layer lies
// now, or null when that copy is out of sight
function inSight(range, { shift, offset }) {
  const from = Math.max(range.from + shift - offset, MARGIN);
  const to = Math.min(range.to + shift - offset, VIEW_WIDTH - MARGIN);

  return from <= to ? { from, to } : null;
}

// every copy of every spot the layer shows now, as stretches of the screen
function spotsInSight(perches, offset) {
  const { tileWidth, spots } = perches;
  const first = Math.floor(offset / tileWidth) - 1;
  const found = [];

  for (let copy = first; copy <= first + 2 + Math.ceil(VIEW_WIDTH / tileWidth); copy++) {
    for (const spot of spots) {
      const stretch = inSight(anchorRange(spot), { shift: copy * tileWidth, offset });

      if (stretch) {
        found.push({ spot, shift: copy * tileWidth, stretch });
      }
    }
  }

  return found;
}

// the place on a perch in sight nearest x where a raider can wait, or null with none in sight;
// `layerX` is where it is in the layer, laid end to end, so it keeps to its tree as the road
// scrolls past
export function findPerch(game, x) {
  const perches = perchesOf(game);
  const offset = game.camera.x * perches.parallax;
  const wanted = x - game.camera.x;
  let best = null;

  for (const { spot, shift, stretch } of spotsInSight(perches, offset)) {
    const at = clamp(wanted, stretch.from, stretch.to);

    if (!best || Math.abs(at - wanted) < Math.abs(best.at - wanted)) {
      best = { spot, shift, at };
    }
  }

  return best && perchOn(perches, { ...best, offset });
}

function perchOn(perches, { spot, shift, at, offset }) {
  const { layer, parallax, leap } = perches;

  return { ...spot, layer, parallax, leap, shift, layerX: at + offset };
}

// where on the road a raider waiting on its perch is: its layer scrolls slower than the road
export function perchX(game, perch) {
  return perch.layerX + game.camera.x * (1 - perch.parallax);
}
