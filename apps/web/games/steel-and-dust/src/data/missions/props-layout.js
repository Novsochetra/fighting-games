import { RENDER_SCALE } from '../../config.js';
import { PROP_SPRITES } from '../prop-sprites.js';
import { groundAt } from './terrain.js';

// the way in from the last mission (its gate broken open) stands behind the hero's start
const ENTRY_X = 10;
// the closing wall stands this far in from the road's end, so all of it shows on the last screen
const END_GAP = 2;

function entry(spec, { terrain }) {
  return spec.entry ? [{ kind: spec.entry, x: ENTRY_X, y: groundAt(terrain, ENTRY_X) }] : [];
}

function endWall(spec, { length, terrain }) {
  const { width, feetX } = PROP_SPRITES[spec.endWall];
  const x = length - (width - feetX) / RENDER_SCALE - END_GAP;

  return { kind: spec.endWall, x, y: groundAt(terrain, x) };
}

// the painted layers dress the road, so the only pieces set on it are the way in from the last
// mission and the wall that closes this one
export function layoutProps(spec, road) {
  return [...entry(spec, road), endWall(spec, road)];
}

const leftOf = ({ kind, x }) => x - PROP_SPRITES[kind].feetX / RENDER_SCALE;
const topOf = ({ kind, y }) => y - PROP_SPRITES[kind].feetY / RENDER_SCALE;

// a broken wall's doorway on the road: the opening the hero goes through, and whether it is a
// door's black hole
export function doorwayOf(wall) {
  const { opening, dark = false } = PROP_SPRITES[wall.kind].doorway;
  const [left, top, right, bottom] = opening.map((pixels) => pixels / RENDER_SCALE);
  const x = leftOf(wall) + left;
  const shown = { x, y: topOf(wall) + top, width: right - left, height: bottom - top };

  return { wall, dark, left: x, right: x + shown.width, opening: shown };
}

// a wall and its broken sprite are one picture, whole and smashed, each set on the road by its own
// feet, so the broken one goes over the same columns the whole one stood on
function brokenOpen({ kind, x, y }) {
  const broken = `${kind}Broken`;
  const shift = (PROP_SPRITES[kind].feetX - PROP_SPRITES[broken].feetX) / RENDER_SCALE;

  return { kind: broken, x: x - shift, y };
}

// the hero leaves a cleared road by smashing its closing wall open and going in at its doorway
export function layoutWayOut(wall) {
  const broken = brokenOpen(wall);

  return { face: leftOf(wall), broken, doorway: doorwayOf(broken) };
}

// and comes onto the next road out of the doorway of that wall, standing at its start
export function layoutWayIn(spec, props) {
  return spec.entry ? doorwayOf(props[0]) : null;
}

// the closing wall is always the last piece set on the road
export function propsShown(mission, wallSmashed) {
  return wallSmashed ? [...mission.props.slice(0, -1), mission.wayOut.broken] : mission.props;
}
