import { drawNagaBody } from '../../../../../../src/render/duel/looks/naga-body.js';
import { crest } from '../../../../../../src/render/duel/looks/naga-crest.js';
import { eye, ornament } from '../../../../../../src/render/duel/looks/naga-face.js';
import { headPoint } from '../../../../../../src/render/duel/looks/naga-head.js';
import { drawInked } from '../../../../../../src/render/duel/looks/naga-ink.js';
import { mouth } from '../../../../../../src/render/duel/looks/naga-mouth.js';
import { jaw, skull } from '../../../../../../src/render/duel/looks/naga-shape.js';
import { NAGA_ART, SHOT_ART } from '../../colors.js';
import { humpOf, spineOf } from './spine.js';

// the eye is baked out, dark, and lit over the bake as it catches fire
const UNLIT = { ...NAGA_ART, eye: [SHOT_ART.ink, SHOT_ART.purple[0], SHOT_ART.purple[1]] };

const HINGE = [0.6, 1.8];

export const GAPES = [0.16, 0.34];

// the game's head (looks/naga-head.js) drawn part by part, so its jaw can open wider than the
// game's one gape
const pointOf = (size) => (across, down) => {
  const at = headPoint({ size }, [across, down]);

  return [at.x, at.y];
};

function hingedBy(point, gape) {
  const [cos, sin] = [Math.cos(gape), Math.sin(gape)];

  return (across, down) => {
    const [dx, dy] = [across - HINGE[0], down - HINGE[1]];

    return point(HINGE[0] + dx * cos - dy * sin, HINGE[1] + dx * sin + dy * cos);
  };
}

export const eyeParts = ({ size, art }) => eye(pointOf(size), art, size).slice(0, -2);

export const eyeMiddle = (size) => headPoint({ size }, [5, -2.6]);

export function paintHead(pen, { size, gape, art = UNLIT }) {
  const point = pointOf(size);
  const jawPoint = hingedBy(point, gape);

  drawInked(pen, [
    ...crest(point, art),
    ...jaw(jawPoint, art),
    ...mouth(point, jawPoint),
    ...skull(point, art),
    ...ornament(point, art),
    ...eye(point, art, size),
  ]);
}

export const paintCrest = (pen, { size }) => drawInked(pen, crest(pointOf(size), NAGA_ART));

// `floor` (from the head's middle) drops what is under the ground when nothing can clip it
function paintBody(pen, { points, floor }) {
  const shown = points.filter((at) => at.y - at.radius < floor);

  if (shown.length > 1) {
    drawNagaBody(pen, { points: shown, art: NAGA_ART, facing: 1 });
  }
}

export function paintFigure(pen, { size, gape, floor = Infinity }) {
  paintBody(pen, { points: humpOf(size), floor });
  paintBody(pen, { points: spineOf(size), floor });
  paintHead(pen, { size, gape });
}
