import { DUEL_INK } from '../../../art/duel/palette.js';
import { GROUND } from '../paths.js';
import { polygon } from '../shapes.js';
import { debris, dust, holds, riseOf } from './barrier.js';

// a peak's faces as shares of its half width (across) and of its height (up from the ground)
const FACES = [
  {
    color: 1,
    corners: [
      [-1, 0],
      [0, 1],
      [1, 0],
    ],
  },
  {
    color: 2,
    corners: [
      [-1, 0],
      [0, 1],
      [-0.1, 0],
    ],
  },
  {
    color: 3,
    corners: [
      [-0.55, 0.45],
      [0, 1],
      [-0.2, 0.5],
    ],
  },
  {
    color: 4,
    corners: [
      [-0.22, 0.8],
      [0, 1],
      [0.22, 0.8],
      [0, 0.86],
    ],
  },
];

// a peak in a few faces: the lit one to the left, the shaded one right, snow on its crown
function peak(pen, { x, top, half, ramp }) {
  const height = GROUND - top;
  const at = ([across, up]) => [x + across * half, GROUND - up * height];

  polygon(
    pen,
    [
      [x - half - 1, GROUND + 1],
      [x, top - 1],
      [x + half + 1, GROUND + 1],
    ],
    DUEL_INK,
  );
  FACES.forEach((face) => polygon(pen, face.corners.map(at), ramp[face.color]));
}

// Mountain Guard: the keeper's mountain heaves up out of the pitch, rock on rock
function guard(pen, scene) {
  const ramp = scene.guardArt.body;
  const rise = riseOf(scene);
  const x = scene.impact.x + 4;
  const top = GROUND - Math.round(78 * rise);

  if (!holds(scene)) {
    debris(pen, {
      scene,
      box: { x: x - 30, y: top, width: 60, height: GROUND - top },
      colors: ramp.slice(1),
    });

    return;
  }

  if (rise > 0.05) {
    peak(pen, { x: x + 18, top: top + 22, half: 24, ramp });
    peak(pen, { x, top, half: 32, ramp });
  }

  dust(pen, { scene, x: x - 30, width: 60, color: ramp[3] });
}

export const MOUNTAIN = { guard };
