import { FIGURE_SCALE } from './scale.js';
import { BODY, posedBody } from './skeleton.js';

// the camera looks down a little, so a foot nearer it shows lower on the screen
const TILT = 0.45;

export function projectorOf(yaw) {
  const turn = (yaw * Math.PI) / 180;
  const forward = [Math.cos(turn), Math.sin(turn)];
  const right = [-Math.sin(turn), Math.cos(turn)];

  return ([ahead, side, up]) => {
    const depth = ahead * forward[1] + side * right[1];

    return {
      x: (ahead * forward[0] + side * right[0]) * FIGURE_SCALE,
      y: (-up + depth * TILT) * FIGURE_SCALE,
      depth,
    };
  };
}

const boxCorners = ({ bottom, top, waist, shoulders, depth }) =>
  [
    [bottom, waist],
    [top, shoulders],
  ].flatMap(([up, half]) =>
    [-1, 1].flatMap((side) => [-1, 1].map((face) => [face * depth, side * half, up])),
  );

const capsule = (from, to, { radius, material, bias = 0 }) => ({
  shape: 'capsule',
  from,
  to,
  radius: radius * FIGURE_SCALE,
  material,
  depth: (from.depth + to.depth) / 2 + bias,
});

const thighMaterial = (along) => (along < 0.42 ? 'shorts' : 'skin');
const shinMaterial = (along) => (along < 0.2 ? 'trim' : 'socks');
const sleeveMaterial = (along) => (along < 0.5 ? 'shirt' : 'skin');

function legParts(leg, project) {
  const [hip, knee, ankle] = [leg.hip, leg.knee, leg.ankle].map(project);
  const [heel, toe] = [leg.heel, leg.toe].map(project);

  return [
    capsule(hip, knee, { radius: 1.75, material: thighMaterial }),
    capsule(knee, ankle, { radius: 1.45, material: shinMaterial }),
    capsule(heel, toe, { radius: 1.05, material: () => 'boots', bias: 0.05 }),
  ];
}

function armParts(arm, project) {
  const [shoulder, elbow, hand] = [arm.shoulder, arm.elbow, arm.hand].map(project);

  return [
    capsule(shoulder, elbow, { radius: 1.3, material: sleeveMaterial, bias: 0.8 }),
    capsule(elbow, hand, { radius: 1.05, material: () => 'skin', bias: 0.8 }),
    capsule(hand, hand, { radius: 1.25, material: () => 'skin', bias: 0.85 }),
  ];
}

function bodyParts({ placeOf, joints }, project) {
  const hull = (corners, upper, material, bias) => {
    const points = corners.map((corner) => project(placeOf(corner, upper)));
    const depth = points.reduce((sum, point) => sum + point.depth, 0) / points.length;

    return { shape: 'hull', points, material: () => material, depth: depth + bias };
  };
  const shirt = { bottom: BODY.pelvis - 0.5, top: BODY.shoulder + 1.4, waist: 4.3, shoulders: 5.4 };
  const shorts = { bottom: BODY.hip - 3, top: BODY.pelvis + 1, waist: 4.5, shoulders: 4.4 };
  const collar = [-1.4, 1.4].map((side) => project(placeOf([0.6, side, BODY.shoulder + 1], true)));
  const neck = project(joints.neck);

  return [
    hull(boxCorners({ ...shorts, depth: 3.2 }), false, 'shorts', 0.3),
    hull(boxCorners({ ...shirt, depth: 3.3 }), true, 'shirt', 0.6),
    capsule(neck, project(placeOf([0, 0, BODY.neck + 1.5], true)), {
      radius: 1.3,
      material: () => 'skin',
      bias: 0.65,
    }),
    capsule(collar[0], collar[1], { radius: 0.75, material: () => 'trim', bias: 0.7 }),
  ];
}

// every part of a posed body seen from one side, ready to be painted far ones first
export function partsOf(pose, yaw) {
  const project = projectorOf(yaw);
  const body = posedBody(pose);
  const { legs, arms } = body.joints;
  const head = project(body.joints.head);
  const parts = [
    ...legParts(legs.left, project),
    ...legParts(legs.right, project),
    ...armParts(arms.left, project),
    ...armParts(arms.right, project),
    ...bodyParts(body, project),
    { shape: 'head', centre: head, yaw, depth: head.depth + 10 },
  ];
  const middle = project(body.joints.pelvis).depth;

  return parts
    .map((part) => ({ ...part, far: part.shape === 'capsule' && part.depth < middle - 1.6 }))
    .sort((first, second) => first.depth - second.depth);
}
