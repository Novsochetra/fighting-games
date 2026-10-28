import { DROP } from '../../data/ambush.js';
import { fxBetween, fxRandom } from './fx-random.js';

const pick = (game, colors) => colors[Math.floor(fxRandom(game) * colors.length)];

// a leaf drifts down at its own pace, rocking from side to side, and lies where it lands
function leaf(game, { x, y, vx, vy, colors }) {
  game.particles.push({
    kind: 'leaf',
    x,
    y,
    vx,
    vy,
    fall: fxBetween(game, 0.9, 1.5),
    sway: fxBetween(game, 0.25, 0.5),
    phase: fxRandom(game) * Math.PI * 2,
    life: 170,
    maxLife: 170,
    color: pick(game, colors),
  });
}

// a leaf shaken loose from the trees over a raider about to drop
export function shedLeaf(game, { x, colors }) {
  const y = fxBetween(game, DROP.leafTop, DROP.leafBottom);

  leaf(game, { x: x + fxBetween(game, -16, 16), y, vx: 0, vy: 0.3, colors });
}

// the leaves the branch throws out to both sides as it gives way under the raider
export function burstLeaves(game, { x, colors }) {
  for (let i = 0; i < DROP.burst; i++) {
    const side = i % 2 ? 1 : -1;
    const y = fxBetween(game, DROP.leafTop, DROP.leafBottom / 2);

    leaf(game, {
      x,
      y,
      vx: side * fxBetween(game, 0.8, 2.6),
      vy: -fxBetween(game, 0, 1.4),
      colors,
    });
  }
}

// fireflies startled out of the branches at night, scattering up and out and blinking
export function startleFireflies(game, { x, colors }) {
  for (let i = 0; i < DROP.fireflies; i++) {
    const angle = Math.PI * fxBetween(game, 1.05, 1.95);
    const speed = fxBetween(game, 0.5, 1.2);

    game.particles.push({
      kind: 'firefly',
      x: x + fxBetween(game, -12, 12),
      y: fxBetween(game, DROP.leafTop + 10, DROP.leafBottom + 20),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      phase: fxRandom(game) * Math.PI * 2,
      life: 110,
      maxLife: 110,
      color: colors[0],
      halo: colors[1],
    });
  }
}

// where it lands the soil puffs up
export function puffSoil(game, { x, y, soil }) {
  for (let i = 0; i < 6; i++) {
    game.particles.push({
      kind: 'dust',
      x: x + fxBetween(game, -7, 7),
      y: y - 1,
      vx: fxBetween(game, -1.2, 1.2),
      vy: -fxBetween(game, 0.1, 0.6),
      life: 22,
      maxLife: 24,
      size: 2,
      color: soil,
    });
  }
}

// and the leaves lying there are thrown about
export function kickLeaves(game, { x, y, colors }) {
  for (let i = 0; i < 4; i++) {
    const side = i % 2 ? 1 : -1;
    const vx = side * fxBetween(game, 0.6, 1.6);

    leaf(game, { x, y: y - 2, vx, vy: -fxBetween(game, 1, 2), colors });
  }
}
