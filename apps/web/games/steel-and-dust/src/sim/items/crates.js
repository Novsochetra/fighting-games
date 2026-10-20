import { COLORS } from '../../art/colors.js';
import { randomBetween } from '../../lib/math.js';
import { crateBox, overlaps } from '../combat/boxes.js';
import { shake } from '../fx/camera-fx.js';

export function createCrates(crates) {
  return crates.map((crate) => ({
    x: crate.x,
    y: crate.y,
    item: crate.item,
    broken: false,
    hit: 0,
  }));
}

export function breakCrate(game, crate) {
  crate.broken = true;
  game.score += 50;
  game.io.sfx('break');
  shake(game, 1, 4);
  for (let i = 0; i < 14; i++) {
    game.particles.push({
      kind: 'chunk',
      x: crate.x + randomBetween(-6, 6),
      y: crate.y - 8 + randomBetween(-5, 5),
      vx: randomBetween(-2.2, 2.2),
      vy: randomBetween(-3.6, -1),
      life: 60,
      maxLife: 60,
      color: i % 3 ? COLORS.crateWood : COLORS.crateDark,
    });
  }
  game.pickups.push({
    x: crate.x,
    y: crate.y - 12,
    vy: -2.6,
    item: crate.item,
    time: 0,
    landed: false,
  });
}

export function breakCratesIn(game, area) {
  for (const crate of game.crates) {
    if (!crate.broken && overlaps(area, crateBox(crate))) {
      breakCrate(game, crate);
    }
  }
}
