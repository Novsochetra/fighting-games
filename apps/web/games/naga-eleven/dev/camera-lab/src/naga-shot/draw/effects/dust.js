import { hash } from '../../../../../../src/render/duel/hash.js';
import { ellipse } from '../../../../../../src/render/duel/shapes.js';
import { SHOT_ART } from '../../colors.js';
import { easeOut } from '../../tracks/ease.js';
import { playerAt, RUN_SHARE } from '../../tracks/player.js';
import { GROUND } from '../../world.js';
import { ditherEllipse, stepped } from './kit.js';

const TONES = [
  { light: SHOT_ART.line, body: SHOT_ART.mesh, shade: SHOT_ART.post[0], fill: 1 },
  { light: SHOT_ART.mesh, body: SHOT_ART.post[0], shade: SHOT_ART.grass[3], fill: 0.75 },
  { body: SHOT_ART.grass[3], shade: SHOT_ART.grass[2], fill: 0.5 },
  { body: SHOT_ART.grass[2], shade: SHOT_ART.grass[1], fill: 0.25 },
];

const STRIDE = 8;

const PUFF_LIFE = 18;

const SKID_LIFE = 30;

function blob(pen, { x, y, radius, color, fill }) {
  if (radius < 0.6) {
    return;
  }

  const shape = { x, y, radiusX: radius, radiusY: radius * 0.85, color };

  if (fill >= 1) {
    ellipse(pen, shape);
  } else {
    ditherEllipse(pen, { ...shape, share: fill });
  }
}

// the shade only half lit, so the edge of a puff breaks up as dust does and never reads as stone
function lump(pen, { x, y, radius, tone }) {
  blob(pen, { x: x + 0.5, y: y + 0.5, radius, color: tone.shade, fill: tone.fill * 0.5 });
  blob(pen, { x: x - 0.5, y: y - 0.7, radius: radius - 1.2, color: tone.body, fill: tone.fill });

  if (tone.light && radius >= 2.5) {
    pen.rect([Math.round(x - radius * 0.5), Math.round(y - radius * 0.6), 2, 1], tone.light);
  }
}

export function drawPuff(pen, { x, y, age, life, spread = 1, salt = 0 }) {
  const share = age / life;

  if (share < 0 || share >= 1) {
    return;
  }

  const tone = stepped(TONES, share);
  const swell = (1.6 + easeOut(share) * 3) * spread;

  for (let part = 0; part < 3; part += 1) {
    const radius = swell * (part === 1 ? 1.2 : 0.85) * (0.9 + hash(salt, part, 4) * 0.2);
    const apart = (part - 1) * (1.8 + share * 2.6) * spread;

    lump(pen, {
      x: x + apart + (hash(salt, part, 3) - 0.5) * 3 * share,
      y: y - radius * 0.75 - share * (2 + part) * spread - (part === 1 ? 1 : 0),
      radius,
      tone,
    });
  }
}

function footfalls(clock) {
  const lastStep = Math.floor((RUN_SHARE * clock.length) / STRIDE);

  return Array.from({ length: lastStep + 1 }, (_, step) => step * STRIDE + 3);
}

function footAt(clock, ending, tick) {
  const past = { ...clock, ticks: tick, share: tick / clock.length };

  return playerAt(past, ending).x - 6;
}

export function drawRunDust(pen, { clock, ending }) {
  footfalls(clock).forEach((tick, step) => {
    const age = clock.ticks - tick;

    if (age >= 0) {
      const x = footAt(clock, ending, tick) + (step % 2) * 4;

      drawPuff(pen, { x, y: GROUND, age, life: PUFF_LIFE, spread: 1, salt: step });
    }
  });

  const planted = Math.ceil(RUN_SHARE * clock.length);
  const age = clock.ticks - planted;

  [-1, 1].forEach((side, i) => {
    const x = footAt(clock, ending, planted) + 6 + side * (2 + age * 0.25);

    drawPuff(pen, { x, y: GROUND + 1, age, life: SKID_LIFE, spread: 1.5, salt: 40 + i });
  });
}

export function drawBlownDust(pen, { from, reach, tick, count }) {
  for (let i = 0; i < count; i += 1) {
    const life = 26 + Math.round(hash(i, 81) * 14);
    const age = (tick + Math.round(hash(i, 82) * life)) % life;
    const x = from + hash(i, 83) * reach + age * (1.4 + hash(i, 84));

    drawPuff(pen, { x, y: GROUND + 2 - hash(i, 85) * 4, age: age + life, life: life * 2, salt: i });
  }
}
