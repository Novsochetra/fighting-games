import { DUEL_UI } from '../../../art/duel/palette.js';
import { drawParts } from '../parts.js';
import { band } from '../shapes.js';
import { scatter, withFade } from './fade.js';
import { headAt } from './naga.js';
import { limbParts, placer, poly } from './place.js';
import { slither } from './serpent.js';

// a khleng kite: a diamond of saffron paper on crossed bamboo, the bow strung over its head that
// hums in the wind, lit from the top left
export function kiteParts({ x, y, size = 1, angle = 0, art }) {
  const point = placer({ x, y, size, angle });
  const [deep, dark, mid, light, core] = art.body;

  return [
    poly(point, '0,-10 7,-1 0,12 -7,-1', dark),
    poly(point, '0,-9 0,11 -6,-1', mid, false),
    poly(point, '0,-9 -6,-1 -3,-1 0,-6', light, false),
    poly(point, '0,-3 3,0 0,4 -3,0', art.accent[2], false),
    poly(point, '0,-1 1,0 0,2 -1,0', core, false),
    ...limbParts(point, { through: '0,-10 0,12', widths: [1], color: deep, ink: false }),
    ...limbParts(point, { through: '-7,-1 7,-1', widths: [1], color: deep, ink: false }),
    ...limbParts(point, {
      through: '-10,-6 -6,-11 0,-13 6,-11 10,-6',
      widths: [1.4, 1.4, 1.4, 1.4],
      color: art.accent[3],
    }),
  ];
}

// the tail: a ribbon down the wind with a bow every few lengths, swinging as it goes
export function drawKiteTail(pen, { points, art, size = 1 }) {
  points.slice(1).forEach((at, i) => {
    const from = points[i];

    band(pen, { from, to: at, width: 2 * size + 1, color: art.accent[0] });
    band(pen, { from, to: at, width: 2 * size, color: art.accent[2 - (i % 2)] });

    if (i % 4 === 3) {
      pen.rect([at.x - 2 * size, at.y - size, 4 * size + 1, 2 * size + 1], art.accent[3]);
    }
  });
}

const kiteAt = (scene) => {
  const ball = headAt(scene);

  return { x: ball.x - 10, y: ball.y - 26 };
};

// the kite rides the ball on its string, its tail streaming back along the way it came
function back(pen, scene) {
  const kite = kiteAt(scene);
  const tail = slither(scene, { count: 16, spacing: 0.03, sway: 6 }).map((at) => ({
    x: at.x - 10,
    y: at.y - 18,
  }));

  withFade(pen, scene, () => {
    drawKiteTail(pen, { points: [...tail, { x: kite.x, y: kite.y + 10 }], art: scene.art });
    band(pen, {
      from: { x: kite.x, y: kite.y + 4 },
      to: headAt(scene),
      width: 1,
      color: DUEL_UI.white,
    });
    drawParts(
      pen,
      kiteParts({ ...kite, angle: Math.sin(scene.tick / 6) * 0.15 - 0.2, art: scene.art }),
    );
  });
  scatter(pen, { scene, points: tail, colors: [scene.art.accent[3], scene.art.body[4]] });
}

// a kite in the sky of the band, its tail across it
function bandFigure(pen, cut) {
  const x = cut.offset + (cut.side === 'defend' ? 110 : 200);
  const y = cut.top + 30 + Math.round(Math.sin(cut.tick / 8) * 3);
  const tail = Array.from({ length: 14 }, (_, i) => ({
    x: x - 4 - i * 9,
    y: y + 26 + Math.round(Math.sin(i * 0.7 + cut.tick / 5) * 6) + i,
  }));

  drawKiteTail(pen, { points: [{ x, y: y + 22 }, ...tail], art: cut.relief, size: 2 });
  drawParts(pen, kiteParts({ x, y, size: 2.4, angle: -0.25, art: cut.relief }));
}

export const KITE = { back, band: bandFigure };
