import { GROUND_Y, VIEW_HEIGHT } from '../../config.js';

// the water lies a little below the road, under the lip of the causeway it cuts through
export const MOAT_LEVEL = GROUND_Y + 6;
// the bed is out of sight, so nothing ever lands on it: whatever falls in reaches the water first
const MOAT_BED = VIEW_HEIGHT + 48;

// a zone's `moats` are [from, to] offsets from its left wall, cut through the road to the water
export function carveMoats(zoneSpecs, zones, heights) {
  return zoneSpecs.flatMap((spec, index) =>
    (spec.moats ?? []).map(([from, to]) => {
      const left = zones[index].left;
      const span = { from: left + from, to: left + to, level: MOAT_LEVEL };

      heights.fill(MOAT_BED, span.from, span.to);

      return span;
    }),
  );
}

// a terrain built by hand, as in a test, has no water at all
export function waterAt(terrain, x) {
  return terrain.water?.find((span) => x >= span.from && x < span.to) ?? null;
}

export function waterBetween(terrain, fromX, toX) {
  return terrain.water?.some((span) => span.from < toX && span.to > fromX) ?? false;
}
