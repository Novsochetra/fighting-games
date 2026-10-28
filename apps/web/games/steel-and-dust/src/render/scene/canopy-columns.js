import { smoothstep } from '../../lib/math.js';
import { layerOrigin } from './layer-spans.js';

// the trees over a drop sway out to this far either side of it, easing in to all of their give
// within the nearer reach, so a bough or a stalk there moves as one
const REACH = 44;
const FULL_REACH = 12;
// a trunk among them stands still, its edges easing into the boughs round it over this far; past
// the stalks round a drop, the air between them eases still over this far
const TRUNK_EDGE = 5;
const STALK_EDGE = 16;

// where column x of the screen lies in the canopy's own layer, laid end to end
function alongLayer({ layer, cameraX }, x) {
  const width = layer.image.width;

  return (((x - layerOrigin(layer, cameraX)) % width) + width) % width;
}

// how much of a trunk stands at column x of the screen: 1 in the thick of one, easing to 0 just
// past its edges
export function trunkAt(road, x) {
  const width = road.layer.image.width;
  const along = alongLayer(road, x);
  let still = 0;

  for (const [from, to] of road.canopy.trunks ?? []) {
    for (const at of [along - width, along, along + width]) {
      const inside = Math.min(at - from, to - at);

      still = Math.max(still, smoothstep((inside + TRUNK_EDGE) / (2 * TRUNK_EDGE)));
    }
  }

  return still;
}

// where on the screen the stalk column x belongs to stands: the stalk it is in, or the nearer one
// across a gap, so each gap is shared out between the stalks either side of it and a stalk leans
// as one, never squeezed
export function stalkAt(road, x) {
  const width = road.layer.image.width;
  const along = alongLayer(road, x);
  let nearest = { distance: Infinity, from: x, to: x };

  for (const [from, to] of road.canopy.stalks) {
    for (const shift of [-width, 0, width]) {
      const distance = Math.max(from + shift - along, along - to - shift, 0);

      if (distance < nearest.distance) {
        const left = x - along + shift;

        nearest = { distance, from: left + from, to: left + to };
      }
    }
  }

  return nearest;
}

// how much the trees round a drop at `spotX` give, column by column, and how far either side of
// it any of them do: all of them over the spot, easing to still at the sides, its trunks still;
// stalks each as one, by how near the spot they stand, the gaps past them still at the sides
export function canopyAcross(road, spotX) {
  const reach = (x) => smoothstep((REACH - Math.abs(x - spotX)) / (REACH - FULL_REACH));
  const { stalks } = road.canopy;

  if (stalks) {
    const widest = Math.max(...stalks.map(([from, to]) => to - from));
    const half = REACH + Math.ceil(widest / 2) + STALK_EDGE;
    const inside = (x) => smoothstep((half - Math.abs(x - spotX)) / STALK_EDGE);

    const nearSpot = ({ from, to }) => Math.min(Math.max(spotX, from), to);

    return { across: (x) => reach(nearSpot(stalkAt(road, x))) * inside(x), half };
  }

  return { across: (x) => reach(x) * (1 - trunkAt(road, x)), half: REACH };
}
