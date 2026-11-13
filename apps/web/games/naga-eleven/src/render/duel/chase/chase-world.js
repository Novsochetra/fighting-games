import { DUEL_INK } from '../../../art/duel/palette.js';
import { hash } from '../hash.js';
import { ART, INNER } from '../layout.js';

const STAND = { top: 30, height: 30 };
const GRASS_TOP = 100;
const SPEED = { stand: 2, grass: 6, streaks: 13 };

const wrapped = (value, span) => ((value % span) + span) % span;

function stand(pen, { art, ticks }) {
  const [high, low] = art.sky;
  const [deep, , mid, light] = art.body;

  pen.rect([0, INNER.top, ART.width, GRASS_TOP - INNER.top], high);
  pen.rect([0, STAND.top, ART.width, STAND.height], low);

  for (let i = 0; i < 64; i += 1) {
    const x = wrapped(i * 9 + hash(i, 31) * 6 - ticks * SPEED.stand, ART.width + 16) - 8;
    const y = STAND.top + 3 + Math.floor(hash(i, 32) * (STAND.height - 6));
    const face = hash(i, 34) < 0.5 ? deep : mid;
    const lit = hash(i, Math.floor(ticks / 4), 33) < 0.05;

    pen.rect([x, y, 2, 2], lit ? light : face);
  }

  pen.rect([0, STAND.top + STAND.height, ART.width, 2], deep);
}

function grass(pen, { art, ticks }) {
  const [deep, dark] = art.body;

  pen.rect([0, GRASS_TOP, ART.width, INNER.bottom - GRASS_TOP], DUEL_INK);

  for (let i = 0; i < 8; i += 1) {
    const x = wrapped(i * 48 - ticks * SPEED.grass, ART.width + 48) - 48;

    pen.rect([x, GRASS_TOP, 24, INNER.bottom - GRASS_TOP], i % 2 ? deep : dark);
  }

  pen.rect([0, GRASS_TOP, ART.width, 1], art.body[3]);
}

function streaks(pen, { art, ticks }) {
  const light = art.body[4] ?? art.body[3];

  for (let i = 0; i < 22; i += 1) {
    const y = INNER.top + 2 + Math.floor(hash(i, 41) * (INNER.bottom - INNER.top - 4));
    const length = 16 + Math.floor(hash(i, 42) * 40);
    const x = wrapped(hash(i, 43) * 500 - ticks * SPEED.streaks * (0.7 + hash(i, 44)), 500) - 60;

    pen.rect([x, y, length, 1], hash(i, 45) < 0.3 ? light : art.body[2]);
  }
}

// each layer rushes back at its own pace, the nearer the faster, so the near ones read nearer
export function drawChaseWorld(pen, { art, ticks }) {
  stand(pen, { art, ticks });
  grass(pen, { art, ticks });
  streaks(pen, { art, ticks });
}
