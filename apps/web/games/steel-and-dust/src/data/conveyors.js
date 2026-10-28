import { groundAt } from './missions/terrain.js';

// a conveyor belt set flush in the foundry floor, carrying everything on it into the furnace at
// its end: a raider lying on it when it gets there is fed to the fire, and the hero thrown back out
export const CONVEYOR = {
  // world px a tick, a heavy's walking pace: a raider knocked down near the mouth reaches it before
  // it is back up, and one walking up it keeps its own pace (sim/hazards/conveyors.js)
  speed: 0.5,
  // one segment of belt, and the drive end and the far end together, as they are drawn
  segment: 36,
  ends: 60,
  // a body that slides off the end of the belt this far into the mouth is still taken in
  mouth: 12,
  // the purse of a raider fed to the fire spills on the belt this far short of the mouth
  lip: 16,
  smeltBonus: 200,
};

// a lick of fire out of the mouth; it never knocks the hero out on its own (furnace-mouth.js)
export const FURNACE_SCORCH = {
  damage: 10,
  knockback: [2.2, -3.4],
  knockdown: true,
  knockAway: true,
  hitstop: 6,
  hitstun: 20,
};

export function beltLength(segments) {
  return CONVEYOR.segment * segments + CONVEYOR.ends;
}

// the end of the belt the furnace stands at, and how far a spot is past it the way the belt runs
export const mouthOf = (belt) => (belt.direction > 0 ? belt.to : belt.from);

export const pastMouth = (belt, x) => (x - mouthOf(belt)) * belt.direction;

// a zone's `conveyors` are { at, segments, direction }: the furnace's mouth `at` its offset from
// the zone's left wall, and the belt running `segments` long into it the way `direction` points
export function layoutConveyors(zoneSpecs, zones, terrain) {
  return zoneSpecs.flatMap((spec, index) =>
    (spec.conveyors ?? []).map(({ at, segments, direction }) => {
      const mouth = zones[index].left + at;
      const start = mouth - direction * beltLength(segments);

      return {
        from: Math.min(mouth, start),
        to: Math.max(mouth, start),
        y: groundAt(terrain, mouth),
        direction,
        segments,
      };
    }),
  );
}
