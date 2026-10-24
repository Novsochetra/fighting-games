import { LOOT_VALUES, MAX_LOOT } from '../../data/loot.js';
import { lootBetween, lootRandom } from './loot-random.js';

export function addToPurse(game, kind) {
  const value = LOOT_VALUES[kind];
  game.coins += value.coins;
  game.score += value.score;
}

// each piece gets its own spin phase, so a pile of coins never turns in step
function createPiece(game, { kind, x, y, vx, vy }) {
  return {
    kind,
    x,
    y,
    vx,
    vy,
    time: 0,
    landed: false,
    pulled: false,
    taken: false,
    phase: Math.floor(lootRandom(game) * 60),
  };
}

export function spawnPiece(game, piece) {
  if (game.loot.length >= MAX_LOOT) {
    addToPurse(game, piece.kind);
    return;
  }
  game.loot.push(createPiece(game, piece));
}

// pieces fountain up out of a point and fan out to both sides
export function spillPieces(game, { kinds, x, y, spread }) {
  for (const kind of kinds) {
    spawnPiece(game, {
      kind,
      x,
      y,
      vx: lootBetween(game, -spread, spread),
      vy: lootBetween(game, -spread * 1.9, -spread * 1.2),
    });
  }
}

export function repeatKind(kind, count) {
  return Array.from({ length: count }, () => kind);
}
