import { groundAt } from './terrain.js';

// a zone's `kegs` are offsets from its left wall, like its platforms', each standing on the road
export function layoutKegs(zoneSpecs, zones, terrain) {
  return zoneSpecs.flatMap((spec, index) =>
    (spec.kegs ?? []).map((offset) => {
      const x = zones[index].left + offset;

      return { x, y: groundAt(terrain, x) };
    }),
  );
}
