import { pointsOf } from '../points.js';

export const poly = (point, corners, color, ink = false) => ({
  kind: 'poly',
  points: (typeof corners === 'string' ? pointsOf(corners) : corners).map(([across, down]) =>
    point(across, down),
  ),
  color,
  ink,
});

const nudged = ({ x, y }) => ({ x: x + 1, y: y + 1 });

const moved = (part) => {
  if (part.points) {
    return { ...part, points: part.points.map(([x, y]) => [x + 1, y + 1]) };
  }

  return part.from
    ? { ...part, from: nudged(part.from), to: nudged(part.to) }
    : { ...part, ...nudged(part) };
};

// parts drawn again a pixel down and right of themselves in a darker colour over their lit selves,
// which leaves a rim of light along every edge that faces the light at the top left, at any size;
// the lit ones ring the darker copies in ink too (`drawInked`)
export const rimmed = (parts, color) => [
  ...parts.map((part) => ({ ...part, rim: true })),
  ...parts.map((part) => ({ ...moved(part), color, ink: false })),
];

export const strip = (point, { edge, depth: [dx, dy], color, ink = false }) => {
  const corners = pointsOf(edge);
  const inner = corners.map(([across, down]) => [across + dx, down + dy]).reverse();

  return poly(point, [...corners, ...inner], color, ink);
};

const SKULL = `-5,-3 -2,-5.6 2,-6.4 5.2,-5.8 8,-4.4 11.4,-3.6 13.4,-3.9 14.2,-5.2 15.4,-5.9 16.6,-5.4
  17,-4 16.2,-2.4 15.6,-0.8 13.6,-0.4 9,0.2 4.4,1.2 1.6,2 -1,3.8 -4.8,2.8`;

const BROW = '-2,-5.6 2,-6.4 5.2,-5.8 8,-4.4 11.4,-3.6 13.4,-3.9 14.2,-5.2 15.4,-5.9';

const JAW = '0.6,1.8 4.4,3.4 9,5 13.2,5.8 14.6,6.4 13.6,8 9,8.2 3.6,6.6 -1.2,4.8';

// the head's top and the snout's upturned curl catch the light; the cheek under the eye is in
// shadow
export const skull = (point, art) => [
  ...rimmed([poly(point, SKULL, art.body[4], true)], art.body[2]),
  poly(point, '-4.8,2.8 -1,3.8 1.6,2 4.4,1.2 9,0.2 6,-0.6 1.4,0 -2.6,0.4', art.body[1]),
  strip(point, { edge: BROW, depth: [0, 1.6], color: art.body[3], ink: true }),
];

// the lower jaw drawn shut and swung open about its hinge by the gape, so all on it opens with it
const HINGE = [0.6, 1.8];

const GAPE = 0.2;

export const hinged = (point) => (across, down) => {
  const [dx, dy] = [across - HINGE[0], down - HINGE[1]];

  return point(
    HINGE[0] + dx * Math.cos(GAPE) - dy * Math.sin(GAPE),
    HINGE[1] + dx * Math.sin(GAPE) + dy * Math.cos(GAPE),
  );
};

const PLATES = [
  [2, 6],
  [5, 7],
  [8, 7.9],
  [11, 8.1],
];

// the lower jaw, its gold belly plates running on to the chin
export const jaw = (point, art) => [
  poly(point, JAW, art.body[1], true),
  strip(point, {
    edge: '-1.2,4.8 3.6,6.6 9,8.2 13.6,8',
    depth: [0, -1.3],
    color: art.accent[2],
    ink: true,
  }),
  ...PLATES.map(([across, belly]) =>
    poly(
      point,
      [
        [across, belly - 1.3],
        [across + 0.5, belly - 1.3],
        [across + 0.5, belly],
        [across, belly],
      ],
      art.accent[1],
    ),
  ),
  strip(point, {
    edge: '0.6,1.8 4.4,3.4 9,5 13.2,5.8',
    depth: [0, 0.6],
    color: art.body[3],
    ink: true,
  }),
];
