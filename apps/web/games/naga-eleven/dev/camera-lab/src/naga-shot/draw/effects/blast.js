import { disc, polygon } from '../../../../../../src/render/duel/shapes.js';
import { SHOT_ART } from '../../colors.js';
import { easeOut, phaseOf } from '../../tracks/ease.js';
import { dithered } from './kit.js';

const PETALS = 10;

// a kbach flame: it swells from its root, and its tip hooks over to one side and back
const FLAME = [
  [0, -0.45],
  [0.25, -0.85],
  [0.5, -0.95],
  [0.72, -0.7],
  [0.86, -0.25],
  [0.96, 0.2],
  [1, 0.65],
  [0.88, 0.95],
  [0.84, 0.55],
  [0.74, 0.42],
  [0.6, 0.75],
  [0.4, 0.85],
  [0.2, 0.7],
  [0, 0.45],
];

const LAYERS = [
  { length: 1, width: 1, color: SHOT_ART.gold[1] },
  { length: 0.94, width: 0.8, color: SHOT_ART.emerald[2] },
  { length: 0.8, width: 0.6, color: SHOT_ART.emerald[3] },
  { length: 0.62, width: 0.4, color: SHOT_ART.emerald[4] },
  { length: 0.4, width: 0.22, color: SHOT_ART.gold[3] },
];

function flamePoints({ at, angle, root, length, width }) {
  const [cos, sin] = [Math.cos(angle), Math.sin(angle)];

  return FLAME.map(([along, across]) => {
    const reach = root + along * length;
    const side = across * width;

    return [at.x + cos * reach - sin * side, at.y + sin * reach + cos * side];
  });
}

const fadingPen = (pen, fade) => ({
  ...pen,
  rect: (box, color) => {
    for (let x = box[0]; x < box[0] + box[2]; x += 1) {
      if (dithered(x, box[1], fade)) {
        pen.rect([x, box[1], 1, box[3]], color);
      }
    }
  },
});

export function drawFlamePetals(basePen, { at, since, size = 1 }) {
  const grown = easeOut(phaseOf(since, 0, 7));
  const fade = 1 - phaseOf(since, 13, 11);

  if (since < 0 || fade <= 0) {
    return;
  }

  const pen = fade < 1 ? fadingPen(basePen, fade) : basePen;

  LAYERS.forEach((layer) => {
    for (let i = 0; i < PETALS; i += 1) {
      const angle = (i / PETALS) * Math.PI * 2 + 0.15 + since * 0.012;
      const length =
        (12 + 26 * grown) * (i % 2 === 0 ? 1 : 0.7) * size * layer.length * (0.6 + 0.4 * fade);
      const width = (5 + 3 * grown) * size * layer.width;

      polygon(pen, flamePoints({ at, angle, root: 4 + grown * 6, length, width }), layer.color);
    }
  });
}

const CORE = [
  { radius: 16, color: SHOT_ART.white },
  { radius: 13, color: SHOT_ART.white },
  { radius: 10, color: SHOT_ART.flash },
  { radius: 8, color: SHOT_ART.gold[3] },
  { radius: 6, color: SHOT_ART.gold[3] },
  { radius: 4, color: SHOT_ART.emerald[4] },
];

export function drawCoreFlash(pen, { at, since, size = 1, from = 0 }) {
  const core = CORE[since];

  if (since < from || !core) {
    return;
  }

  disc(pen, { x: at.x, y: at.y, radius: core.radius * size + 2, color: SHOT_ART.gold[2] });
  disc(pen, { x: at.x, y: at.y, radius: core.radius * size, color: core.color });
}
