import { hash } from '../../../../../../src/render/duel/hash.js';
import { SHOT_ART } from '../../colors.js';
import { GROUND } from '../../world.js';
import { dotLine, spark, stepped } from './kit.js';

const SCATTER_RAMP = [
  SHOT_ART.white,
  SHOT_ART.gold[3],
  SHOT_ART.emerald[4],
  SHOT_ART.gold[2],
  SHOT_ART.emerald[3],
  SHOT_ART.emerald[2],
];

const ACCENT_RAMP = [SHOT_ART.white, SHOT_ART.ember[3], SHOT_ART.ember[2], SHOT_ART.ember[1]];

function flungAt(i, { at, moved, salt, gravity }) {
  const angle = -Math.PI / 2 + (hash(i, 141, salt) - 0.5) * Math.PI * 1.9;
  const speed = 1.6 + hash(i, 142, salt) * 3.4;
  const drag = moved * (1 - Math.min(0.5, moved / 90));

  return {
    x: at.x + Math.cos(angle) * speed * drag,
    y: Math.min(GROUND, at.y + Math.sin(angle) * speed * drag + gravity * moved * moved),
    share: moved / (22 + hash(i, 143, salt) * 20),
  };
}

export function drawScatter(pen, { at, moved, count = 34, salt = 0, gravity = 0.07 }) {
  if (moved <= 0) {
    return;
  }

  for (let i = 0; i < count; i += 1) {
    const bit = flungAt(i, { at, moved, salt, gravity });

    if (bit.share < 1) {
      const color = stepped(i % 9 === 4 ? ACCENT_RAMP : SCATTER_RAMP, bit.share);
      const size = bit.share < 0.4 && i % 2 === 0 ? 2 : 1;

      pen.rect([Math.round(bit.x), Math.round(bit.y), size, size], color);
    }
  }
}

const SPARK_RAMP = [SHOT_ART.white, SHOT_ART.gold[3], SHOT_ART.ember[3], SHOT_ART.ember[2]];

function barSpark(pen, { at, moved, i }) {
  const angle = -Math.PI / 2 + (hash(i, 151) - 0.5) * 2.6;
  const speed = 2.5 + hash(i, 152) * 3;
  const life = 14 + hash(i, 153) * 12;
  const place = (ticks) => ({
    x: at.x + Math.cos(angle) * speed * ticks,
    y: at.y + Math.sin(angle) * speed * ticks + 0.22 * ticks * ticks,
  });

  if (moved >= life) {
    return;
  }

  const head = place(moved);
  const share = moved / life;

  dotLine(pen, {
    from: place(Math.max(0, moved - 2.5)),
    to: head,
    color: stepped(SPARK_RAMP, share),
  });

  if (share < 0.4) {
    pen.rect([Math.round(head.x), Math.round(head.y), 2, 2], SHOT_ART.white);
  }
}

export function drawBarSparks(pen, { at, since, moved }) {
  if (since < 0) {
    return;
  }

  if (since < 6) {
    spark(pen, { ...at, reach: 6 - since, core: SHOT_ART.white, arm: SHOT_ART.gold[3] });
  }

  for (let i = 0; i < 24; i += 1) {
    barSpark(pen, { at, moved: moved + 1, i });
  }
}
