import { groundAt } from './terrain.js';

// the way in from the last mission (its gate broken open) stands behind the hero's start
const ENTRY_X = 10;

function entry(spec, { terrain }) {
  return spec.entry ? [{ kind: spec.entry, x: ENTRY_X, y: groundAt(terrain, ENTRY_X) }] : [];
}

function endWall(spec, { length, terrain }) {
  const x = length - 12;
  return { kind: spec.endWall, x, y: groundAt(terrain, x) };
}

// the painted layers dress the road, so the only pieces set on it are the way in from the last
// mission and the wall that closes this one
export function layoutProps(spec, road) {
  return [...entry(spec, road), endWall(spec, road)];
}
