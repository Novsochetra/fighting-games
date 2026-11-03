import { pointsOf } from './points.js';

// the clash's figures, facing right, in art pixels from the ground under their hips (up is
// negative): head, neck, hip, then the front elbow and hand, the back elbow and hand, the front
// knee and foot and the back knee and foot
const POSE_TEXT = {
  stand: '0,-31 0,-27 0,-16 2,-21 2,-16 -2,-21 -2,-16 1,-8 2,0 -1,-8 -2,0',
  run: '5,-31 3,-27 0,-16 -1,-21 -4,-18 6,-22 9,-19 6,-10 4,-2 -3,-8 -8,-3',
  run2: '5,-32 3,-28 0,-17 6,-22 9,-19 -1,-21 -4,-18 -3,-8 -8,-3 6,-10 4,-2',
  windup: '2,-31 1,-27 0,-16 -4,-23 -7,-26 5,-23 8,-20 2,-8 3,0 -4,-9 -9,-12',
  kick: '-1,-31 -1,-27 0,-16 -5,-24 -9,-22 4,-24 7,-27 6,-15 12,-18 -1,-8 -2,0',
  leap: '4,-31 3,-27 0,-17 5,-31 9,-34 -2,-30 -5,-34 7,-19 3,-12 3,-14 -4,-10',
  ready: '1,-28 0,-24 -1,-14 5,-22 9,-25 4,-19 9,-17 4,-8 6,0 -5,-8 -6,0',
  catch: '0,-28 0,-24 -1,-14 5,-21 8,-20 5,-19 8,-18 4,-8 5,0 -4,-8 -5,0',
  punch: '2,-29 1,-25 -1,-14 7,-27 12,-29 6,-24 11,-26 4,-8 6,0 -4,-8 -6,0',
  dive: '11,-24 7,-21 0,-15 12,-27 17,-30 11,-25 17,-27 -5,-13 -10,-11 -5,-10 -10,-7',
  slide: '-6,-18 -4,-14 0,-6 -7,-10 -9,-5 -2,-12 2,-14 6,-5 12,-2 3,-2 -2,-1',
  block: '0,-31 0,-27 0,-16 2,-21 3,-24 -2,-21 -1,-24 5,-8 8,0 -4,-8 -6,0',
  lunge: '-3,-27 -2,-23 0,-13 -6,-18 -8,-13 1,-20 4,-22 6,-9 13,-2 -4,-6 -8,0',
  front: '0,-30 0,-26 0,-15 -7,-23 -11,-28 7,-23 11,-28 -4,-8 -6,0 4,-8 6,0',
  frontDive: '16,-23 12,-20 5,-14 17,-27 22,-31 15,-25 21,-26 0,-12 -6,-10 1,-9 -5,-6',
  fallen: '-13,-5 -9,-4 0,-3 -8,-7 -5,-10 -11,-2 -15,-1 5,-6 10,-2 6,-3 11,-1',
};

function toPose(text) {
  const [head, neck, hip, elbowF, handF, elbowB, handB, kneeF, footF, kneeB, footB] =
    pointsOf(text);

  return {
    head,
    neck,
    hip,
    arms: { front: [elbowF, handF], back: [elbowB, handB] },
    legs: { front: [kneeF, footF], back: [kneeB, footB] },
  };
}

export const POSES = Object.fromEntries(
  Object.entries(POSE_TEXT).map(([name, text]) => [name, toPose(text)]),
);

export const FIGURE_SCALE = 1.9;
