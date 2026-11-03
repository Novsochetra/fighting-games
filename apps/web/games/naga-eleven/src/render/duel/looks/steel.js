import { DUEL_INK } from '../../../art/duel/palette.js';
import { easeOut } from '../hash.js';
import { GROUND } from '../paths.js';
import { INNER } from '../layout.js';
import { debris, holds } from './barrier.js';

const PLATE = { width: 13, height: 46 };

// one plate of blue steel: rimmed, its face lit down the left, a boss in its middle and a rivet
// at each corner
export function drawPlate(pen, { x, y, ramp, rivet, width = PLATE.width, height = PLATE.height }) {
  pen.rect([x - 1, y - 1, width + 2, height + 2], DUEL_INK);
  pen.rect([x, y, width, height], ramp[3]);
  pen.rect([x + 1, y + 1, width - 2, height - 2], ramp[2]);
  pen.rect([x + 1, y + 1, 2, height - 2], ramp[3]);
  pen.rect([x + width - 2, y + 1, 1, height - 2], ramp[1]);
  pen.rect([x + width / 2 - 2, y + height / 2 - 3, 5, 6], ramp[1]);
  pen.rect([x + width / 2 - 2, y + height / 2 - 3, 4, 5], ramp[4]);

  for (const [dx, dy] of [
    [2, 2],
    [width - 4, 2],
    [2, height - 4],
    [width - 4, height - 4],
  ]) {
    pen.rect([x + dx, y + dy, 2, 2], rivet);
  }
}

// Steel Block: plates of steel slam down one after another into a wall before the defender; a
// shot through, they fly apart
function guard(pen, scene) {
  const art = scene.guardArt;
  const left = scene.impact.x - 8;

  if (!holds(scene)) {
    debris(pen, {
      scene,
      box: { x: left, y: GROUND - PLATE.height, width: PLATE.width * 3, height: PLATE.height },
      colors: art.body,
    });

    return;
  }

  for (let i = 0; i < 3; i += 1) {
    const drop = easeOut((scene.approach - 0.25 - i * 0.12) / 0.3);
    const y = INNER.top - PLATE.height + (GROUND - INNER.top) * drop;

    if (drop > 0) {
      drawPlate(pen, {
        x: left + i * (PLATE.width - 1),
        y: y - (i % 2) * 4,
        ramp: art.body,
        rivet: art.accent[3],
      });
    }
  }

  if (scene.hit && scene.sinceHit < 10) {
    pen.rect([scene.impact.x - 6, scene.impact.y - 6, 12, 12], art.accent[3]);
  }
}

function bandFigure(pen, cut) {
  const art = cut.relief;

  for (let i = 0; i < 7; i += 1) {
    drawPlate(pen, {
      x: cut.offset + (cut.side === 'defend' ? 8 : 92) + i * 22,
      y: cut.top + 6 + (i % 2) * 6,
      ramp: art.body,
      rivet: art.body[3],
      width: 20,
      height: cut.height - 12,
    });
  }
}

export const STEEL = { guard, band: bandFigure };
