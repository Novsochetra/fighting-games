// A footballer's body in its own frame, in art pixels: a point is [ahead, side, up], ahead the
// way it faces, side to its right and up from the grass. A pose bends it; `posedBody` returns where
// each joint ends up, and `placeOf` places any other point of the body (a shirt corner) alike
export const BODY = {
  hip: 13.5,
  hipGap: 2.3,
  thigh: 5.5,
  shin: 6,
  shoulder: 24,
  shoulderGap: 5,
  upperArm: 5,
  forearm: 4.5,
  pelvis: 15,
  neck: 26,
  head: 30.5,
};

// how far below each joint the body reaches, to find what touches the grass
const REACH = { boot: 1, knee: 1.6, hand: 1, elbow: 1.2, pelvis: 3.5, chest: 3.5, head: 4.5 };

const radians = (degrees) => (degrees * Math.PI) / 180;

// turns a point about the body's side axis (its feet swing forward) or its forward axis (its feet
// swing to its right)
function aboutSide([ahead, side, up], degrees) {
  const [sin, cos] = [Math.sin(radians(degrees)), Math.cos(radians(degrees))];

  return [ahead * cos - up * sin, side, ahead * sin + up * cos];
}

function aboutForward([ahead, side, up], degrees) {
  const [sin, cos] = [Math.sin(radians(degrees)), Math.cos(radians(degrees))];

  return [ahead, side * cos - up * sin, side * sin + up * cos];
}

const add = (first, second) => first.map((value, i) => value + second[i]);
const less = (first, second) => first.map((value, i) => value - second[i]);

const segment = (length, swing, spread) => aboutSide(aboutForward([0, 0, -length], spread), swing);

function limb(root, { lengths, swing = 0, lower = swing, spread = 0 }) {
  const middle = add(root, segment(lengths[0], swing, spread));

  return [middle, add(middle, segment(lengths[1], lower, spread))];
}

function legOf(side, { thigh = 0, knee = 0, spread = 0 } = {}) {
  const hip = [0, side * BODY.hipGap, BODY.hip];
  const [kneeAt, ankle] = limb(hip, {
    lengths: [BODY.thigh, BODY.shin],
    swing: thigh,
    lower: thigh - knee,
    spread: side * spread,
  });

  return { hip, knee: kneeAt, ankle, heel: add(ankle, [-1, 0, -1]), toe: add(ankle, [2.4, 0, -1]) };
}

function armOf(side, { swing = 0, elbow = 0, raise = 0 } = {}) {
  const shoulder = [0, side * BODY.shoulderGap, BODY.shoulder];
  const [elbowAt, hand] = limb(shoulder, {
    lengths: [BODY.upperArm, BODY.forearm],
    swing,
    lower: swing + elbow,
    spread: side * raise,
  });

  return { shoulder, elbow: elbowAt, hand };
}

// the whole body turns about its pelvis, the upper body first leaning on its own: `lean` and
// `pitch` tip it forward, `roll` tips it over to its right
function transformOf(pose) {
  const pelvis = [0, 0, BODY.pelvis];
  const turn = (point) =>
    add(
      pelvis,
      aboutForward(aboutSide(less(point, pelvis), -(pose.pitch ?? 0)), -(pose.roll ?? 0)),
    );
  const lean = (point) => add(pelvis, aboutSide(less(point, pelvis), -(pose.lean ?? 0)));

  return (point, upper) => turn(upper ? lean(point) : point);
}

function lowestReach(joints) {
  const reaches = [
    ...['left', 'right'].flatMap((side) => [
      joints.legs[side].heel[2] - REACH.boot,
      joints.legs[side].toe[2] - REACH.boot,
      joints.legs[side].knee[2] - REACH.knee,
      joints.arms[side].hand[2] - REACH.hand,
      joints.arms[side].elbow[2] - REACH.elbow,
    ]),
    joints.pelvis[2] - REACH.pelvis,
    joints.chest[2] - REACH.chest,
    joints.head[2] - REACH.head,
  ];

  return Math.min(...reaches);
}

function rawJoints(pose, place) {
  const mapLimb = (parts, upper) =>
    Object.fromEntries(Object.entries(parts).map(([name, at]) => [name, place(at, upper)]));

  return {
    legs: {
      left: mapLimb(legOf(-1, pose.legs?.left)),
      right: mapLimb(legOf(1, pose.legs?.right)),
    },
    arms: {
      left: mapLimb(armOf(-1, pose.arms?.left), true),
      right: mapLimb(armOf(1, pose.arms?.right), true),
    },
    pelvis: place([0, 0, BODY.pelvis]),
    chest: place([0, 0, BODY.shoulder - 3], true),
    neck: place([0, 0, BODY.neck], true),
    head: place([0, 0, BODY.head], true),
  };
}

// the lowest part of the body rests on the grass, and a jump or a dive lifts it off
export function posedBody(pose) {
  const transform = transformOf(pose);
  const raw = rawJoints(pose, transform);
  const shift = [pose.slide ?? 0, 0, (pose.lift ?? 0) - lowestReach(raw)];
  const placeOf = (point, upper) => add(transform(point, upper), shift);

  return { joints: rawJoints(pose, placeOf), placeOf };
}
