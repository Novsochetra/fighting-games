import { hash } from '../../../../../../src/render/duel/hash.js';
import { SHOT_ART } from '../../colors.js';
import { spark, stepped } from './kit.js';

const MOTE_COLOURS = [
  [SHOT_ART.emerald[4], SHOT_ART.emerald[3]],
  [SHOT_ART.gold[3], SHOT_ART.gold[2]],
];

export function drawBallMotes(pen, { ball, tick, count }) {
  for (let i = 0; i < count; i += 1) {
    const angle = hash(i, 51) * Math.PI * 2 + tick * (0.04 + hash(i, 52) * 0.04);
    const reach = 9 + hash(i, 53) * 9;
    const x = ball.x + Math.cos(angle) * reach;
    const y = ball.y - 2 + Math.sin(angle) * reach * 0.55 - Math.sin(tick * 0.08 + i) * 2;
    const twinkle = Math.floor(tick / 3 + i * 2) % 5;
    const [core, arm] = MOTE_COLOURS[i % 2];

    const lit = twinkle === 0;

    spark(pen, { x, y, reach: lit || i % 2 === 0 ? 1 : 0, core: lit ? SHOT_ART.white : core, arm });
  }
}

const EMBER_RAMP = [
  SHOT_ART.white,
  SHOT_ART.gold[3],
  SHOT_ART.emerald[4],
  SHOT_ART.gold[2],
  SHOT_ART.emerald[3],
  SHOT_ART.emerald[2],
];

const ACCENT_RAMP = [SHOT_ART.ember[4], SHOT_ART.ember[3], SHOT_ART.ember[2], SHOT_ART.ember[1]];

function emberAt(i, { area, age, life }) {
  const sway = Math.sin(age * 0.12 + i * 1.7) * (1.5 + hash(i, 64) * 2);

  return {
    x: area.x + (hash(i, 61) - 0.5) * area.width + sway,
    y: area.y - hash(i, 62) * area.height - age * (0.4 + hash(i, 63) * 0.8),
    share: age / life,
  };
}

function drawEmber(pen, { at, i }) {
  const ramp = i % 7 === 3 ? ACCENT_RAMP : EMBER_RAMP;
  const color = stepped(ramp, at.share);
  const big = at.share < 0.3 && i % 3 === 0;

  pen.rect([Math.round(at.x), Math.round(at.y), big ? 2 : 1, big ? 2 : 1], color);
}

export function drawEmbers(pen, { area, tick, count, life = 48, once = false }) {
  for (let i = 0; i < count; i += 1) {
    const ownLife = Math.round(life * (0.7 + hash(i, 65) * 0.6));
    const start = Math.round(hash(i, 66) * ownLife);
    const age = once ? tick - start * 0.6 : (tick + start) % ownLife;

    if (age >= 0 && age < ownLife) {
      drawEmber(pen, { at: emberAt(i, { area, age, life: ownLife }), i });
    }
  }
}
