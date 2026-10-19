import { COLORS } from '../../art/colors.js';
import { randomBetween } from '../../lib/math.js';

export function addSparks(game, { x, y, count, color, speed }) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const velocity = randomBetween(speed * 0.4, speed);
    game.particles.push({
      kind: 'spark',
      x,
      y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      life: randomBetween(8, 14) | 0,
      maxLife: 14,
      color: i % 3 ? color : COLORS.white,
    });
  }
}

export function addDust(game, { x, y, count, color }) {
  for (let i = 0; i < count; i++) {
    game.particles.push({
      kind: 'dust',
      x: x + randomBetween(-5, 5),
      y: y - 1,
      vx: randomBetween(-1, 1),
      vy: randomBetween(-0.6, -0.1),
      life: randomBetween(14, 24) | 0,
      maxLife: 24,
      size: 2,
      color: color || COLORS.dustTan,
    });
  }
}
