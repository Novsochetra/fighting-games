import { COLORS } from '../../art/colors.js';
import { FX_COLORS } from '../../art/fx-colors.js';
import { GROUND_Y } from '../../config.js';
import { hashInt } from '../../lib/math.js';
import { point } from '../painter.js';

export function drawBolt(painter, bolt) {
  const back = point(bolt.x - bolt.direction * 7, bolt.y);
  const tip = point(bolt.x + bolt.direction * 5, bolt.y);
  painter.use(COLORS.outline).line(back, tip, 3);
  painter.use(FX_COLORS.boltShaft).line(back, tip, 1);
  painter.use(bolt.color).rect(tip.x - (bolt.direction > 0 ? 2 : 0), bolt.y - 1, 2, 2);
  painter.use(FX_COLORS.boltFletch).rect(back.x - 1, bolt.y - 2, 2, 1);
  painter.use(FX_COLORS.boltFletch).rect(back.x - 1, bolt.y + 1, 2, 1);
}

// a spinning knot of glowing sand that thins out at the end of its flight
export function drawSand(painter, sand) {
  painter.alpha(sand.time > 52 ? (64 - sand.time) / 12 : 0.9);
  for (let i = 0; i < 14; i++) {
    const angle = sand.time * 0.35 + i * 0.9;
    const radius = 4 + (i % 4) * 2.5;
    const x = sand.x + Math.cos(angle) * radius * 0.7;
    const y = sand.y + Math.sin(angle) * radius;
    painter.use(i % 3 ? FX_COLORS.mirage : FX_COLORS.mirageLight).rect(x - 1, y - 1, 2, 2);
  }
  painter.alpha(1);
}

export function drawBomb(painter, bomb) {
  const x = Math.round(bomb.x);
  const y = Math.round(bomb.y);
  painter.use(COLORS.outline).rect(x - 3, y - 3, 7, 7);
  painter.use(FX_COLORS.potClay).rect(x - 2, y - 2, 5, 5);
  painter.use(FX_COLORS.potDark).rect(x - 2, y + 1, 5, 1);
  painter.use(COLORS.cream).rect(x - 1, y - 2, 1, 1);
  painter.use((bomb.time >> 1) & 1 ? COLORS.gold : COLORS.white).rect(x, y - 5, 1, 2);
}

// a patch of fire that flickers and burns down
export function drawFire(painter, fire) {
  const strength = fire.time > 80 ? (110 - fire.time) / 30 : 1;
  for (let i = 0; i < 9; i++) {
    const hash = hashInt(i * 31 + (fire.time >> 2));
    const height = Math.round((5 + (hash % 9)) * strength);
    const x = Math.round(fire.x - 16 + i * 4);
    painter.use(FX_COLORS.flameDark).rect(x, GROUND_Y - height, 3, height);
    painter.use(COLORS.tangerine).rect(x, GROUND_Y - height + 2, 3, Math.max(0, height - 2));
    painter
      .use(COLORS.gold)
      .rect(x + 1, GROUND_Y - Math.round(height / 2), 1, Math.round(height / 2));
  }
  painter
    .alpha(0.35 * strength)
    .use(COLORS.orange)
    .rect(fire.x - 18, GROUND_Y - 2, 36, 3);
  painter.alpha(1);
}
