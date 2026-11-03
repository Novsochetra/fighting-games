import { drawParts } from '../parts.js';
import { hash } from '../hash.js';
import { GROUND } from '../paths.js';
import { band, disc } from '../shapes.js';
import { scatter, withFade } from './fade.js';
import { headAt } from './naga.js';
import { limbParts, oval, placer, poly } from './place.js';

// a kouprey's horn: out from the brow, back, then up and forward at its frayed tip
const HORN = [
  [0, 0],
  [-9, -3],
  [-19, -9],
  [-27, -19],
  [-29, -30],
  [-25, -38],
];

const HORN_WIDTHS = [8, 7, 6, 4.5, 3];

// the dust a horn raises, puffing off it as it goes
function hornDust(pen, { points, art, tick }) {
  points.forEach((at, i) => {
    const age = (tick + i * 7) % 18;
    const color = art.body[1 + (i % 2)];

    disc(pen, { x: at.x - age * 0.6, y: at.y - age * 0.2, radius: 2 + age / 4, color });
  });
}

const shifted = (at, dx, dy) => ({ x: at.x + dx, y: at.y + dy });

// one horn of ivory wrapped in the dust it raises, thick at its root and lit along its top
function horn(pen, { root, lift, art, tick, reach }) {
  const steps = Math.max(2, Math.round(HORN.length * reach));
  const points = HORN.slice(0, steps).map(([across, down]) => shifted(root, across, down * lift));
  const pairs = points.slice(1).map((to, i) => ({ from: points[i], to, width: HORN_WIDTHS[i] }));

  hornDust(pen, { points, art, tick });
  drawParts(
    pen,
    pairs.map((pair) => ({ kind: 'band', ...pair, color: art.accent[1] })),
  );
  pairs.forEach(({ from, to, width }) => {
    band(pen, {
      from: shifted(from, -1, -1),
      to: shifted(to, -1, -1),
      width: width * 0.55,
      color: art.accent[2],
    });
    band(pen, {
      from: shifted(from, -1, -2),
      to: shifted(to, -1, -2),
      width: 1,
      color: art.accent[3],
    });
  });

  if (hash(Math.floor(tick / 4), 131) < 0.6) {
    pen.rect([points.at(-1).x - 1, points.at(-1).y - 2, 2, 2], art.body[4]);
  }
}

// dust thrown up from the grass under the ball's path, settling as it goes
function groundDust(pen, scene) {
  for (let i = 0; i < 10; i += 1) {
    const at = scene.trailPoint(0.04 + i * 0.05);
    const age = (scene.tick + i * 5) % 30;

    disc(pen, {
      x: at.x - age * 0.4,
      y: GROUND - 3 - age * 0.25,
      radius: 2 + age / 8,
      color: scene.art.body[1 + (i % 3)],
    });
  }
}

// the Kouprey Kick: the forest bull's horns of dust spread behind the ball as it charges in
function back(pen, scene) {
  const at = headAt(scene);
  const reach = Math.min(1, scene.approach * 2.4);

  withFade(pen, scene, () => {
    groundDust(pen, scene);
    horn(pen, {
      root: { x: at.x - 2, y: at.y - 2 },
      lift: 0.8,
      art: { ...scene.art, accent: scene.art.body.slice(1) },
      tick: scene.tick,
      reach,
    });
    horn(pen, {
      root: { x: at.x - 6, y: at.y + 1 },
      lift: 1,
      art: scene.art,
      tick: scene.tick,
      reach,
    });
  });
  scatter(pen, {
    scene,
    points: HORN.map(([across, down]) => ({ x: at.x + across, y: at.y + down })),
    colors: [scene.art.body[3], scene.art.accent[3]],
  });
}

// the bull's head from in front, carved into the band
export function koupreyHead({ x, y, size, art }) {
  const point = placer({ x, y, size });
  const [deep, dark, mid, light] = art.body;
  const horns = [
    ['-5,-8 -16,-10 -24,-18 -22,-28', art.accent[2]],
    ['5,-8 16,-10 24,-18 22,-28', art.accent[1]],
  ];

  return [
    ...horns.flatMap(([through, color]) => limbParts(point, { through, widths: [6, 5, 3], color })),
    oval(point, { at: [-11, -5], radius: [5, 2.5], turn: 0.4, color: dark }),
    oval(point, { at: [11, -5], radius: [5, 2.5], turn: -0.4, color: deep }),
    poly(point, '-8,-10 8,-10 6,8 3,14 -3,14 -6,8', mid),
    poly(point, '-7,-9 0,-9 -1,12 -3,13 -5,8', light, false),
    poly(point, '-3,9 3,9 3,13 -3,13', dark, false),
  ];
}

function bandFigure(pen, cut) {
  const x = cut.offset + (cut.side === 'defend' ? 90 : 180);

  drawParts(pen, koupreyHead({ x, y: cut.top + 46, size: 2.2, art: cut.relief }));
}

export const KOUPREY = { back, band: bandFigure };
