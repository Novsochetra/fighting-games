import { RENDER_SCALE } from '../../config.js';
import { PROP_SPRITES } from '../prop-sprites.js';
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

// a wall and its broken sprite are one picture, whole and smashed, each set on the road by its own
// feet, so the broken one goes over the same columns the whole one stood on
function brokenOpen({ kind, x, y }) {
  const broken = `${kind}Broken`;
  const shift = (PROP_SPRITES[kind].feetX - PROP_SPRITES[broken].feetX) / RENDER_SCALE;

  return { kind: broken, x: x - shift, y };
}

// the hero leaves a cleared road by smashing its closing wall open: where the wall's face is, and
// the wall as it stands once smashed
export function layoutWayOut(wall) {
  return { face: wall.x - PROP_SPRITES[wall.kind].feetX / RENDER_SCALE, broken: brokenOpen(wall) };
}

// the closing wall is always the last piece set on the road
export function propsShown(mission, wallSmashed) {
  return wallSmashed ? [...mission.props.slice(0, -1), mission.wayOut.broken] : mission.props;
}
