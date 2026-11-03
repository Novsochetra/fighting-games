import { DUEL_INK } from '../../../art/duel/palette.js';
import { hash } from '../hash.js';
import { band, polygon } from '../shapes.js';

// a river of light: deep at its banks, bright in its middle, with streaks of light running down
// it and the sun glinting off it, the way the water flows
export function drawRiver(pen, { points, width, art, tick }) {
  const [deep, dark, mid, light, core] = art.body;

  points.slice(1).forEach((to, i) => {
    const from = points[i];
    const grow = Math.min(1, (i + 1) / 4);

    band(pen, { from, to, width: width * grow + 2, color: deep });
    band(pen, { from, to, width: width * grow, color: dark });
    band(pen, { from, to, width: width * grow * 0.6, color: mid });

    if ((i + Math.floor(tick / 3)) % 4 === 0) {
      band(pen, { from, to, width: Math.max(1, width * grow * 0.25), color: light });
    }

    if (hash(i, Math.floor(tick / 4), 151) < 0.2) {
      pen.rect([to.x - 1, to.y - 1, 3, 1], art.accent[3]);
      pen.rect([to.x, to.y - 2, 1, 3], core);
    }
  });
}

// a wave rising behind a point and curling over toward it: its face in the ramp's bands, lit
// higher up, foam breaking along its lip
export function drawWave(pen, { x, ground, height, length, art, tick }) {
  const [deep, dark, mid, light, core] = art.body;
  const crest = { x, y: ground - height };
  const lip = [
    [x - length, ground],
    [x - length * 0.55, ground - height * 0.35],
    [x - length * 0.25, ground - height * 0.85],
    [crest.x - 2, crest.y],
    [crest.x + height * 0.22, crest.y + height * 0.12],
    [crest.x + height * 0.18, crest.y + height * 0.3],
    [crest.x + 2, crest.y + height * 0.22],
    [x - length * 0.05, ground],
  ];

  polygon(
    pen,
    lip.map(([px, py]) => [px - 1, py + 1]),
    DUEL_INK,
  );
  polygon(pen, lip, dark);

  [mid, light].forEach((color, i) => {
    const share = 0.55 - i * 0.2;

    polygon(
      pen,
      lip.map(([px, py]) => [x + (px - x) * share, ground + (py - ground) * share]),
      color,
    );
  });

  foam(pen, { crest, height, color: core, deep, tick });
}

function foam(pen, { crest, height, color, deep, tick }) {
  for (let i = 0; i < 9; i += 1) {
    const angle = -2.4 + i * 0.32;
    const wobble = hash(i, Math.floor(tick / 3), 152) * 2;
    const reach = height * 0.18 + wobble;
    const at = { x: crest.x + Math.cos(angle) * reach, y: crest.y + 4 + Math.sin(angle) * reach };

    pen.rect([at.x - 1, at.y - 1, 3, 2], deep);
    pen.rect([at.x - 1, at.y - 1, 2, 1], color);
  }
}

// lines of the tide running in over the flat, light along their tops
export function drawTide(pen, { left, right, ground, art, tick, rows = 3 }) {
  for (let row = 0; row < rows; row += 1) {
    const y = ground - 2 - row * 3;

    for (let x = left - ((tick * (2 + row)) % 24); x < right; x += 24) {
      pen.rect([x, y, 14 - row * 2, 1], art.body[3 - (row % 2)]);
      pen.rect([x + 2, y - 1, 6 - row, 1], art.body[4]);
    }
  }
}
