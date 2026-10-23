import { FX_COLORS } from '../../art/fx-colors.js';
import { addSparks } from '../fx/particles.js';

// the top of the hand she raises in the Rainbow Naga's frames 1-3, [ahead, up] from her feet in her
// own units (body-point.js)
export const RAINBOW_HANDS = {
  1: [9, 40],
  2: [10, 44],
  3: [12, 43],
};
// the orb's middle floats this far over the top of her hand, in game pixels, so its swirl rests on
// her fingers
const OVER_HAND = 14;
export const ORB_GROW = 12;
export const ORB_BURST = 8;
const SPARK_EVERY = 3;

function overHand(boss, frame) {
  const [ahead, up] = RAINBOW_HANDS[frame];
  return [boss.x + boss.facing * ahead * boss.scale, boss.y - up * boss.scale - OVER_HAND];
}

// the orb gathers over her raised hand and follows it from frame to frame of her strip, then bursts
export function conjureOrb(game, boss, move) {
  const { orbAt, burstAt } = move.rainbow;
  const steps = [1, 2, 3].map((frame) => [move.frameAt[frame] - orbAt, ...overHand(boss, frame)]);
  const [, x, y] = steps[0];
  game.projectiles.push({
    kind: 'rainbowOrb',
    x,
    y,
    steps,
    burstAt: burstAt - orbAt,
    direction: boss.facing,
    speed: 0,
    side: boss.side,
    time: 0,
    damage: 0,
    hitTargets: new Set(),
  });
  game.io.sfx('rainbow', false, { x, dir: boss.facing });
}

export function spinOrb(game, orb) {
  const step = orb.steps.findLast(([at]) => at <= orb.time);
  [, orb.x, orb.y] = step;
  const colors = FX_COLORS.rainbow;
  if (orb.time < orb.burstAt && orb.time % SPARK_EVERY === 0) {
    const color = colors[Math.floor(orb.time / SPARK_EVERY) % colors.length];
    addSparks(game, { x: orb.x, y: orb.y, count: 1, color, speed: 1.4 });
  }
  if (orb.time === orb.burstAt) {
    colors.forEach((color) => addSparks(game, { x: orb.x, y: orb.y, count: 2, color, speed: 2.6 }));
  }
  orb.dead = orb.time >= orb.burstAt + ORB_BURST;
}
