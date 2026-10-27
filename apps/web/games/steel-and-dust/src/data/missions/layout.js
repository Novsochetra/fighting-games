import { VIEW_WIDTH } from '../../config.js';
import { layoutOnRoad } from './hazards-layout.js';
import { layoutProps } from './props-layout.js';
import { groundAt, layoutTerrain } from './terrain.js';

// weapon crates are off for now so every hero fights with the weapon they start with; the rations
// stay where they are
const WEAPON_CRATES = false;

const FIRST_ZONE = 300;
const ROAD = 300;
// a zone starts once the hero is this far past its left wall
const LEAD_IN = 110;
// the camera keeps the hero this far from the right edge, so the last wave of a zone waits
// until the zone's final screen is in view
const FOLLOW_LEAD = Math.round(VIEW_WIDTH * 0.58);

function spreadWaves(waves, from, to) {
  return waves.map((kinds, i) => ({
    kinds,
    at: waves.length > 1 ? Math.round(from + ((to - from) * i) / (waves.length - 1)) : from,
    lock: i === waves.length - 1,
  }));
}

function layoutZone(spec, { left, label }) {
  const screens = spec.boss ? 1 : spec.screens;
  const right = left + screens * VIEW_WIDTH;
  const at = left + LEAD_IN;
  const waves = spec.boss ? [[spec.boss]] : spec.waves;
  const lastAt = screens > 1 ? right - FOLLOW_LEAD : at;
  return {
    at,
    left,
    right,
    screens,
    label: spec.label ?? label,
    boss: spec.boss ?? null,
    waves: spreadWaves(waves, at, lastAt),
  };
}

function layoutZones(spec, number) {
  let left = FIRST_ZONE;
  let fights = 0;
  return spec.zones.map((zoneSpec) => {
    fights += zoneSpec.boss ? 0 : 1;
    const zone = layoutZone(zoneSpec, { left, label: `Zone ${number}-${fights}` });
    left = zone.right + ROAD;
    return zone;
  });
}

// a crate on the road before every zone and one more inside the wide ones
function layoutCrates(zones, items, terrain) {
  const spots = zones.flatMap((zone) =>
    zone.screens > 1 ? [zone.left - 120, zone.left + VIEW_WIDTH + 60] : [zone.left - 120],
  );
  return spots
    .map((x, i) => ({ x, y: groundAt(terrain, x), item: items[i % items.length] }))
    .filter((crate) => WEAPON_CRATES || crate.item === 'ration');
}

// turns a mission's list of zones into places on the road
export function layoutMission(spec, index) {
  const zones = layoutZones(spec, index + 1);
  const length = zones.at(-1).right;
  const terrain = layoutTerrain(spec.zones, zones, length);
  return {
    ...spec,
    index,
    number: index + 1,
    length,
    zones,
    terrain,
    crates: layoutCrates(zones, spec.crates, terrain),
    kegs: layoutOnRoad(spec.zones, zones, { terrain, key: 'kegs' }),
    trees: layoutOnRoad(spec.zones, zones, { terrain, key: 'trees' }),
    props: layoutProps(spec, { length, terrain }),
  };
}
