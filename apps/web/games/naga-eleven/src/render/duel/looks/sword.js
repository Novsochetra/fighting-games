import { DUEL_UI } from '../../../art/duel/palette.js';
import { drawParts } from '../parts.js';
import { pointsOf } from '../points.js';
import { trailPoint } from '../scene.js';
import { band } from '../shapes.js';
import { withFade } from './fade.js';
import { headAt } from './naga.js';

// the sacred sword, Preah Khan, laid along the shot: a long blade, a golden guard and hilt;
// its corners from the blade's tip, in art pixels
const BLADE = '-70,-3 -4,-3 6,0 -4,3 -70,3';
const EDGE = '-70,-3 -4,-3 6,0 -70,0';
const GUARD = '-74,-8 -70,-9 -68,0 -70,9 -74,8 -72,0';

function blade({ x, y }, art) {
  const [, dark, mid, light, core] = art.body;
  const [, gold, bright] = art.accent;
  const at = (corners) => pointsOf(corners).map(([dx, dy]) => [x + dx, y + dy]);

  return [
    { kind: 'poly', points: at(BLADE), color: mid },
    { kind: 'poly', points: at(EDGE), color: light, ink: false },
    {
      kind: 'band',
      from: { x: x - 68, y: y - 1 },
      to: { x: x - 2, y: y - 1 },
      width: 1,
      color: core,
      ink: false,
    },
    { kind: 'poly', points: at(GUARD), color: gold },
    { kind: 'band', from: { x: x - 90, y }, to: { x: x - 73, y }, width: 4, color: dark },
    { kind: 'disc', x: x - 92, y, radius: 3, color: bright },
  ];
}

// the cuts the sword leaves in the air behind it, white crescents fading to steel
function slashes(pen, scene) {
  for (let i = 1; i <= 4; i += 1) {
    const at = trailPoint(scene, i * 0.12);
    const color = i < 3 ? DUEL_UI.white : scene.art.body[3];

    band(pen, {
      from: { x: at.x - 6, y: at.y - 14 + i },
      to: { x: at.x + 4, y: at.y },
      width: 2,
      color,
    });
    band(pen, {
      from: { x: at.x + 4, y: at.y },
      to: { x: at.x - 6, y: at.y + 14 - i },
      width: 2,
      color,
    });
  }
}

function back(pen, scene) {
  const at = headAt(scene);

  withFade(pen, scene, () => {
    slashes(pen, scene);
    drawParts(pen, blade({ x: at.x, y: at.y - 12 }, scene.art));
  });
}

export const SWORD = { back };
