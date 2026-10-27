import { layoutConveyors } from '../conveyors.js';
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

// every road hazard a mission's zones place, by the key the zones list them under
export function layoutRoadProps(zoneSpecs, zones, terrain) {
  const onRoad = (key) => layoutOnRoad(zoneSpecs, zones, { terrain, key });

  return {
    kegs: onRoad('kegs'),
    trees: onRoad('trees'),
    campfires: onRoad('campfires'),
    hammers: onRoad('hammers'),
    conveyors: layoutConveyors(zoneSpecs, zones, terrain),
    spikeTraps: onRoad('spikeTraps'),
    boulders: onRoad('boulders'),
    quicksand: onRoad('quicksand'),
    vents: onRoad('vents'),
    slabs: onRoad('slabs'),
    towers: onRoad('towers'),
  };
}
