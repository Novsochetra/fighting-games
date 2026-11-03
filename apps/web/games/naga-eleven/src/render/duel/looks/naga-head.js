import { crest } from './naga-crest.js';
import { eye, ornament } from './naga-face.js';
import { drawInked } from './naga-ink.js';
import { mouth } from './naga-mouth.js';
import { hinged, jaw, skull } from './naga-shape.js';

// a point of the head, in head sizes from its middle, turned the way it faces and leans
function placer({ x, y, size, facing, angle }) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return (across, down) => {
    const ax = across * size * facing;
    const ay = down * size;

    return [x + ax * cos - ay * sin, y + ax * sin + ay * cos];
  };
}

// in head sizes: where the ball sits in the jaws, and where the neck meets the back of the head
const JAWS = [10.6, 3.6];

export const NAPE = [-4, 0.6];

export function headPoint({ x = 0, y = 0, size, facing = 1, angle = 0 }, [across, down]) {
  const [px, py] = placer({ x, y, size, facing, angle })(across, down);

  return { x: px, y: py };
}

export const jawsOffset = (place) => headPoint({ ...place, x: 0, y: 0 }, JAWS);

// the naga's head in profile: its hood of flames fanned behind, the jaws open on the ball, the
// eye burning under its brow
export function drawNagaHead(pen, { x, y, size = 1, facing = 1, angle = 0, art, far = false }) {
  const point = placer({ x, y, size, facing, angle });
  const jawPoint = hinged(point);

  drawInked(pen, [
    ...crest(point, art, { far }),
    ...jaw(jawPoint, art),
    ...mouth(point, jawPoint),
    ...skull(point, art),
    ...ornament(point, art),
    ...eye(point, art, size),
  ]);
}
