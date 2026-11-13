// in head sizes from the head's middle, from under the ground to the nape: a cobra rears with its
// chest thrust forward and its neck drawn back under the hood
const SPINE = [
  [-15, 50],
  [-14, 40],
  [-12.5, 30],
  [-8.6, 21],
  [-7.6, 13.5],
  [-9.4, 7],
  [-7.2, 2.4],
  [-4, 0.6],
];

// a loop of its body further back breaks the ground behind it and dives again, so it reads as
// a serpent far longer than what stands
const HUMP = [
  [-33, 34],
  [-32, 26],
  [-29.5, 20],
  [-25, 17.6],
  [-20.5, 19.6],
  [-18.6, 25],
  [-18.4, 34],
];

const GIRTH = { base: 3.6, neck: 2.5, hump: 2.7 };

const SPACING = 0.62;

const STEPS = 24;

function catmullRom([before, from, to, after], share) {
  const squared = share * share;
  const cubed = squared * share;
  const along = (axis) =>
    0.5 *
    (2 * from[axis] +
      (to[axis] - before[axis]) * share +
      (2 * before[axis] - 5 * from[axis] + 4 * to[axis] - after[axis]) * squared +
      (3 * from[axis] - before[axis] - 3 * to[axis] + after[axis]) * cubed);

  return [along(0), along(1)];
}

function traced(points) {
  const line = [];

  for (let i = 0; i + 1 < points.length; i += 1) {
    const four = [
      points[Math.max(0, i - 1)],
      points[i],
      points[i + 1],
      points[Math.min(points.length - 1, i + 2)],
    ];

    for (let step = 0; step < STEPS; step += 1) {
      line.push(catmullRom(four, step / STEPS));
    }
  }

  return [...line, points.at(-1)];
}

function evenly(line, spacing) {
  const kept = [line[0]];
  let walked = 0;

  for (let i = 1; i < line.length; i += 1) {
    walked += Math.hypot(line[i][0] - line[i - 1][0], line[i][1] - line[i - 1][1]);

    if (walked >= spacing) {
      kept.push(line[i]);
      walked = 0;
    }
  }

  return [...kept, line.at(-1)];
}

const SPINE_LINE = evenly(traced(SPINE), SPACING);

const HUMP_LINE = evenly(traced(HUMP), SPACING);

export function spineOf(size) {
  const last = SPINE_LINE.length - 1;

  return SPINE_LINE.map(([across, down], i) => ({
    x: across * size,
    y: down * size,
    radius: (GIRTH.base + (GIRTH.neck - GIRTH.base) * (i / last)) * size,
  }));
}

export const humpOf = (size) =>
  HUMP_LINE.map(([across, down]) => ({
    x: across * size,
    y: down * size,
    radius: GIRTH.hump * size,
  }));
