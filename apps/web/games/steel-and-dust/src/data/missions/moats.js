import { VIEW_HEIGHT } from '../../config.js';

// the water lies just under the lip of the lower bank, wherever the road it cuts through stands, so
// the breach reads as water from the road's own height and whatever goes over the edge falls into
// it there; any deeper and what stands behind the breach shows through at the road's height
export const LIP_TO_WATER = 3;
// the bed is out of sight, so nothing ever lands on it: whatever falls in reaches the water first
const MOAT_BED = VIEW_HEIGHT + 48;

// a zone's `moats` are [from, to] offsets from its left wall, cut through the road to the water
export function carveMoats(zoneSpecs, zones, heights) {
  return zoneSpecs.flatMap((spec, index) =>
    (spec.moats ?? []).map(([from, to]) => {
      const left = zones[index].left;
      const lip = Math.max(heights[left + from - 1], heights[left + to]);
      const span = { from: left + from, to: left + to, level: lip + LIP_TO_WATER };

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
