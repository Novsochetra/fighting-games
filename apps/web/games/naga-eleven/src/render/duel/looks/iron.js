import { DUEL_INK } from '../../../art/duel/palette.js';
import { INNER } from '../layout.js';
import { GROUND } from '../paths.js';
import { polygon } from '../shapes.js';
import { debris, holds, riseOf } from './barrier.js';

const BARS = 4;
const SPAN = 26;

// one iron bar, lit down its left, sharpened to a spike at its foot
function bar(pen, { x, bottom, ramp }) {
  pen.rect([x - 1, INNER.top, 5, bottom - INNER.top], DUEL_INK);
  pen.rect([x, INNER.top, 3, bottom - INNER.top], ramp[2]);
  pen.rect([x, INNER.top, 1, bottom - INNER.top], ramp[3]);
  polygon(
    pen,
    [
      [x - 1, bottom],
      [x + 1.5, bottom + 5],
      [x + 4, bottom],
    ],
    DUEL_INK,
  );
  polygon(
    pen,
    [
      [x, bottom],
      [x + 1.5, bottom + 4],
      [x + 3, bottom],
    ],
    ramp[3],
  );
}

function beam(pen, { left, y, ramp }) {
  pen.rect([left - 2, y - 1, SPAN + 4, 6], DUEL_INK);
  pen.rect([left - 1, y, SPAN + 2, 4], ramp[1]);
  pen.rect([left - 1, y, SPAN + 2, 1], ramp[3]);

  for (let x = left + 2; x < left + SPAN; x += 8) {
    pen.rect([x, y + 1, 2, 2], ramp[4]);
  }
}

// Iron Gate: a portcullis slams down between the dribbler and the goal
function guard(pen, scene) {
  const ramp = scene.guardArt.body;
  const left = scene.impact.x - 6;
  const bottom = INNER.top + Math.round((GROUND - 4 - INNER.top) * riseOf(scene));

  if (!holds(scene)) {
    debris(pen, {
      scene,
      box: { x: left, y: bottom - 40, width: SPAN, height: 40 },
      colors: ramp.slice(1),
    });

    return;
  }

  for (let i = 0; i < BARS; i += 1) {
    bar(pen, { x: left + 2 + i * 7, bottom, ramp });
  }

  beam(pen, { left, y: bottom - 30, ramp });
  beam(pen, { left, y: bottom - 12, ramp });

  if (scene.hit && scene.sinceHit < 12) {
    pen.rect([left - 4, scene.impact.y - 4, 8, 8], scene.guardArt.accent[3]);
  }
}

export const IRON = { guard };
