import { VIEW_WIDTH } from '../../config.js';
import { DROP } from '../../data/ambush.js';
import { PAINTED_BACKDROPS } from '../../data/backdrops/index.js';
import { HAMMER } from '../../data/hammers.js';
import { TOWER } from '../../data/towers.js';
import { missionOf } from '../stage/mission.js';

const MARGIN = 18;
// a raider stands far enough in from a ledge's ends that none of it hangs out over them
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

// the places on a spot raiders wait at, in its layer: a crown hides one, in the thick of it; a
// ledge stands as many as have room, spread from one end of it to the other
export function placesOn(spot) {
  if (spot.kind === 'crown') {
    return [spot.x];
  }

  const from = spot.from + LEDGE_INSET;
  const to = spot.to - LEDGE_INSET;
  const count = Math.floor(Math.max(0, to - from) / DROP.room) + 1;

  if (count === 1) {
    return [Math.round((from + to) / 2)];
  }

  return Array.from(
    { length: count },
    (_, i) => from + Math.round(((to - from) * i) / (count - 1)),
  );
}

// every place on every copy of every spot the layer shows now, where it is in the layer laid end
// to end and on the screen
function placesInSight(perches, offset) {
  const { tileWidth, spots } = perches;
  const first = Math.floor(offset / tileWidth) - 1;
  const found = [];

  for (let copy = first; copy <= first + 2 + Math.ceil(VIEW_WIDTH / tileWidth); copy++) {
    for (const spot of spots) {
      const shift = copy * tileWidth;
      const places = placesOn(spot).map((place) => ({ spot, shift, layerX: place + shift }));

      found.push(...places.filter(({ layerX }) => inSight(layerX - offset)));
    }
  }

  return found;
}

const inSight = (at) => at >= MARGIN && at <= VIEW_WIDTH - MARGIN;
const isTaken = (place, taken) =>
  taken.some((perch) => perch.spot === place.spot && perch.layerX === place.layerX);

// what stands tall on the road, in front of the painted perches: a raider waiting behind one
// would stand on nothing but it, and drop under it, so none waits within a raider's room of one
function standing(game) {
  const hammers = (game.hammers ?? []).map(({ x }) => ({ x, half: HAMMER.halfWidth }));
  const towers = (game.towers ?? [])
    .filter((tower) => tower.state !== 'gone')
    .map(({ x }) => ({ x, half: TOWER.halfWidth }));

  return [...hammers, ...towers];
}

const clearOf = (props, x) => props.every((prop) => Math.abs(prop.x - x) >= prop.half + DROP.room);

// the free place on a perch in sight nearest x where a raider can wait, not one of the `taken`
// perches raiders already wait on, or null with none; `layerX` is where it is in the layer, laid
// end to end, so it keeps to its tree as the road scrolls past
export function findPerch(game, x, taken = []) {
  const perches = perchesOf(game);
  const offset = game.camera.x * perches.parallax;
  const wanted = x - game.camera.x;
  const away = (place) => Math.abs(place.layerX - offset - wanted);
  const props = standing(game);
  const free = (place) =>
    !isTaken(place, taken) && clearOf(props, place.layerX - offset + game.camera.x);
  let best = null;

  for (const place of placesInSight(perches, offset)) {
    if (free(place) && (!best || away(place) < away(best))) {
      best = place;
    }
  }

  return best && perchOn(perches, best);
}

function perchOn(perches, { spot, shift, layerX }) {
  const { layer, parallax, leap } = perches;

  return { ...spot, spot, layer, parallax, leap, shift, layerX };
}

// where on the road a raider waiting on its perch is: its layer scrolls slower than the road
export function perchX(game, perch) {
  return perch.layerX + game.camera.x * (1 - perch.parallax);
}
