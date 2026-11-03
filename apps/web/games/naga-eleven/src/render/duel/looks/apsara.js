import { drawParts } from '../parts.js';
import { hash } from '../hash.js';
import { band, ellipse } from '../shapes.js';
import { scatter, withFade } from './fade.js';
import { headAt } from './naga.js';
import { pointsOf } from '../points.js';
import { limbParts, oval, placer } from './place.js';

// an apsara's hand: the palm up, the fingers bent back from it as the dancers of Angkor hold them,
// the thumb curled in; in its own units from the wrist, up negative
const FINGERS = [
  '1,-6 4,-13 3,-19 -1,-22',
  '3,-6 7,-12 7,-18 4,-22',
  '5,-5 10,-10 11,-15 9,-19',
  '6,-3 12,-6 14,-10 13,-14',
].map(pointsOf);

export function handParts({ x, y, size, art, reach = 1 }) {
  const point = placer({ x, y, size });
  const [, dark, mid, light] = art.body;
  const fingers = FINGERS.flatMap((finger, i) => {
    const joints = [[i * 1.2, -2], ...finger].slice(0, Math.max(2, Math.round(5 * reach)));

    return limbParts(point, {
      through: joints,
      widths: [3.2, 2.8, 2.2, 1.6],
      color: i % 2 ? mid : light,
      size,
    });
  });

  return [
    oval(point, { at: [3, -2], radius: [6, 4], turn: -0.3, color: mid }),
    ...limbParts(point, { through: '-4,6 -1,1', widths: [5], color: dark, size }),
    ...fingers,
    ...limbParts(point, {
      through: '-1,-1 -6,-6 -7,-11 -4,-12',
      widths: [3, 2.4, 1.8],
      color: light,
      size,
    }),
    oval(point, { at: [2, -3], radius: [3, 1.6], turn: -0.3, color: art.accent[2], ink: false }),
  ];
}

// lotus petals let fall along the curl, drifting down
function petals(pen, scene) {
  for (let i = 0; i < 12; i += 1) {
    const at = scene.trailPoint(0.05 + hash(i, 141) * 0.4);
    const fall = (scene.tick + i * 9) % 36;

    ellipse(pen, {
      x: at.x + Math.sin(scene.tick / 6 + i) * 3,
      y: at.y - 8 + fall * 0.5,
      radiusX: 2,
      radiusY: 1,
      color: scene.art.accent[2 + (i % 2)],
    });
  }
}

// the Apsara Curl: a ribbon of gold leaf bends after the ball and rises at its end into a
// dancer's hand
function back(pen, scene) {
  const wrist = scene.trailPoint(0.42);
  const reach = Math.min(1, scene.approach * 1.8);

  withFade(pen, scene, () => {
    for (let i = 10; i >= 1; i -= 1) {
      const from = scene.trailPoint(i * 0.042);
      const to = scene.trailPoint((i - 1) * 0.042);

      band(pen, { from, to, width: 2 + i * 0.5, color: scene.art.body[2] });
      band(pen, { from, to, width: 1 + i * 0.25, color: scene.art.body[4] });
    }

    petals(pen, scene);
    drawParts(pen, handParts({ ...wrist, size: 1.5, art: scene.art, reach }));
  });
  scatter(pen, {
    scene,
    points: [wrist, headAt(scene)],
    colors: [scene.art.body[4], scene.art.accent[3]],
  });
}

function bandFigure(pen, cut) {
  const x = cut.offset + (cut.side === 'defend' ? 96 : 176);

  drawParts(pen, handParts({ x, y: cut.top + cut.height - 6, size: 3, art: cut.relief }));
}

export const APSARA = { back, band: bandFigure };
