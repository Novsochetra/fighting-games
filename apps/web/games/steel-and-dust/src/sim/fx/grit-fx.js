import { DROP } from '../../data/ambush.js';
import { fxBetween, fxRandom } from './fx-random.js';

const pick = (game, colors) => colors[Math.floor(fxRandom(game) * colors.length)];

// a grain knocked loose off a ledge: it drops, bounces once off what it hits and lies there
function grain(game, { x, y, vx, vy, colors }) {
  game.particles.push({
    kind: 'grit',
    x,
    y,
    vx,
    vy,
    bounced: false,
    resting: false,
    life: 70,
    maxLife: 70,
    color: pick(game, colors),
  });
}

// a grain off the ledge's edge as the raider climbs about on it
export function trickleGrit(game, { x, y, colors }) {
  const vx = fxBetween(game, -0.15, 0.15);

  grain(game, { x: x + fxBetween(game, -6, 6), y, vx, vy: 0, colors });
}

// the grit it kicks off the ledge as it leaps, in a puff of the road's dust
export function burstGrit(game, { x, y, colors, dust }) {
  for (let i = 0; i < DROP.grit; i++) {
    const vx = fxBetween(game, -1.2, 1.2);

    grain(game, { x: x + fxBetween(game, -5, 5), y, vx, vy: -fxBetween(game, 0, 1.2), colors });
  }

  for (let i = 0; i < 4; i++) {
    game.particles.push({
      kind: 'dust',
      x: x + fxBetween(game, -6, 6),
      y: y - 1,
      vx: fxBetween(game, -0.6, 0.6),
      vy: -fxBetween(game, 0.05, 0.3),
      life: 20,
      maxLife: 22,
      size: 2,
      color: dust,
    });
  }
}
