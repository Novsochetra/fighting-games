import { LOOT_SPRITES } from '../../data/loot-sprites.js';
import { lootBetween } from './loot-random.js';

const SPARKLE_TICKS = LOOT_SPRITES.sparkle.frames * LOOT_SPRITES.sparkle.ticks;

function burstParticle(game, { x, y, color, kind }) {
  const angle = lootBetween(game, 0, Math.PI * 2);
  const speed = lootBetween(game, 0.8, kind === 'dust' ? 1.4 : 3);
  const life = Math.round(lootBetween(game, 10, kind === 'dust' ? 26 : 16));
  return {
    kind,
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: kind === 'dust' ? -Math.abs(Math.sin(angle)) * 0.5 : Math.sin(angle) * speed,
    life,
    maxLife: life,
    size: 2,
    color,
  };
}

// sparks and dust for the chest, from loot's own random stream (see loot-random.js)
export function lootBurst(game, { x, y, count, color, kind }) {
  for (let i = 0; i < count; i++) {
    game.particles.push(burstParticle(game, { x, y, color, kind }));
  }
}

export function addSparkle(game, { x, y }) {
  game.lootFx.push({ x, y, time: 0 });
}

export function updateLootFx(game) {
  for (const sparkle of game.lootFx) {
    sparkle.time++;
  }
  game.lootFx = game.lootFx.filter((sparkle) => sparkle.time < SPARKLE_TICKS);
}
