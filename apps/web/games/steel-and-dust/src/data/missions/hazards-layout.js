import { groundAt } from './terrain.js';

// a zone's `kegs`, `trees` and the like are offsets from its left wall, like its platforms', each
// standing on the road
export function layoutOnRoad(zoneSpecs, zones, { terrain, key }) {
  return zoneSpecs.flatMap((spec, index) =>
    (spec[key] ?? []).map((offset) => {
      const x = zones[index].left + offset;

      return { x, y: groundAt(terrain, x) };
    }),
  );
}
