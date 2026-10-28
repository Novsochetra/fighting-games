import { VIEW_HEIGHT } from '../../config.js';

// the water lies at the foot of the pit the breach cuts, just under the bottom of the screen and
// deeper than the hardest shake lifts the screen, so all that is ever seen of it is the splash a
// body throws up as it falls in
export const MOAT_LEVEL = VIEW_HEIGHT + 8;
// the bed lies deeper than any raider sinks before the water closes over its head, so nothing
// ever lands on it
const MOAT_BED = MOAT_LEVEL + 120;

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
