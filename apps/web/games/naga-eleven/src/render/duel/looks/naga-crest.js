import { poly, rimmed } from './naga-shape.js';

// the hood flares round the back of the skull as a cobra's does, ringed in flames of the kbach
// swept back as the Naga flies, from the one off the nape to the one over the brow (each at a turn
// in degrees from the snout, up is -90), so the ones over the head lie on top
const TONGUES = [
  { turn: -232, length: 3.6, width: 3 },
  { turn: -208, length: 4.4, width: 3.4 },
  { turn: -184, length: 5, width: 3.6 },
  { turn: -160, length: 5.4, width: 3.8 },
  { turn: -136, length: 5.6, width: 3.8 },
  { turn: -112, length: 5.4, width: 3.8 },
  { turn: -88, length: 4.8, width: 3.4 },
  { turn: -64, length: 3.8, width: 3 },
];

const HUB = [-3.2, -3.2];

const HOOD = 7.4;

const TALL = 1.12;

const at = (turn, reach) => {
  const angle = (turn * Math.PI) / 180;

  return [HUB[0] + Math.cos(angle) * reach, HUB[1] + Math.sin(angle) * reach * TALL];
};

const hood = (grow) =>
  Array.from({ length: 24 }, (_, i) => at(-250 + (i / 23) * 230, HOOD * grow)).concat([
    at(0, HOOD * grow * 0.4),
  ]);

const WIDTHS = [0.8, 1, 0.85, 0.5, 0];

// a flame: a leaf swelling off the hood's rim, its tip hooking back the way the Naga came
function tongue({ turn, length, width }, { reach = 1, thin = 1 } = {}) {
  const angle = ((turn - 14) * Math.PI) / 180;
  const along = [Math.cos(angle), Math.sin(angle)];
  const side = [-along[1], along[0]];
  const [rootX, rootY] = at(turn, HOOD * 0.9);
  const edges = WIDTHS.map((share, i) => {
    const step = i / (WIDTHS.length - 1);
    const hook = 0.55 * length * step * step;
    const x = rootX + along[0] * length * step * reach - side[0] * hook;
    const y = rootY + along[1] * length * step * reach - side[1] * hook;
    const half = (share * width * thin) / 2;

    return [
      [x + side[0] * half, y + side[1] * half],
      [x - side[0] * half, y - side[1] * half],
    ];
  });

  return [...edges.map(([left]) => left), ...edges.map(([, right]) => right).reverse()];
}

// rows of scales across the hood, each a diamond of the body's light on its shadow
const SCALES = Array.from({ length: 9 }, (_, row) =>
  Array.from({ length: 8 }, (__, column) => [-10 + column * 2 + (row % 2), -11 + row * 1.6]),
)
  .flat()
  .filter(([across, down]) => Math.hypot(across - HUB[0], (down - HUB[1]) / TALL) < HOOD * 0.7);

const scale = (point, [across, down], color) =>
  poly(
    point,
    [
      [across, down - 0.8],
      [across + 1, down],
      [across, down + 0.8],
      [across - 1, down],
    ],
    color,
  );

// each flame gold at its edge, lit along the side the light falls on, the hood's colour at its
// heart; the hood within rimmed in gold like the great Naga's on the title, its scales in shadow.
// A look may give the hood a ramp of its own (`hood`), else it is the body's. A heart is ringed
// in ink too, which the gold paints over, as a hooked tip can leave a pixel of it bare
function flames(point, art) {
  const inner = art.hood ?? art.body;

  return TONGUES.flatMap((flame) => [
    ...rimmed([poly(point, tongue(flame), art.accent[3], true)], art.accent[2]),
    poly(point, tongue(flame, { reach: 0.72, thin: 0.42 }), inner[2], true),
  ]);
}

// a head far back in a fan, darker and behind the others, keeps its flames' gold and drops the
// light on them, their hearts and the hood's scales, which it is too far off to show and which
// cost the seven heads together too much to draw
const flatFlames = (point, art) =>
  TONGUES.map((flame) => poly(point, tongue(flame), art.accent[2], true));

export function crest(point, art, { far = false } = {}) {
  const inner = art.hood ?? art.body;

  return [
    ...(far ? flatFlames(point, art) : flames(point, art)),
    ...rimmed([poly(point, hood(1), art.accent[3], true)], art.accent[2]),
    poly(point, hood(0.9), art.accent[1]),
    poly(point, hood(0.84), inner[1]),
    ...(far ? [] : SCALES.map((spot) => scale(point, spot, inner[2]))),
  ];
}
