import { hash } from '../../../../../../src/render/duel/hash.js';
import { VIEW } from '../../world.js';
import { SHOT_ART } from '../../colors.js';
import { STAND } from './stand-plan.js';

const { white, flash, lights } = SHOT_ART;

function spotOf(pen, { frame, i }) {
  const left = -pen.origin.x / pen.unit;
  const width = VIEW.width / pen.unit;

  return {
    x: Math.floor(left + hash(frame, i, 81) * width),
    y: STAND.upper + 2 + Math.floor(hash(frame, i, 82) * (STAND.wall - STAND.upper - 4)),
  };
}

function burst(pen, { x, y }) {
  pen.rect([x - 1, y, 4, 2], flash);
  pen.rect([x, y - 1, 2, 4], flash);
  pen.rect([x, y, 2, 2], white);
}

function spark(pen, { x, y }) {
  pen.rect([x, y, 2, 2], lights);
}

export function drawFlashes(pen, { frame, rate }) {
  const count = Math.floor(rate + hash(frame, 80));

  for (let i = 0; i < count; i += 1) {
    burst(pen, spotOf(pen, { frame, i }));

    if (hash(frame, i, 83) < 0.6) {
      spark(pen, spotOf(pen, { frame: frame - 1, i }));
    }
  }
}
