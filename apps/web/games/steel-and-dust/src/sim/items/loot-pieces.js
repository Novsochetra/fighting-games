import { CHEST_SCATTER, LOOT_VALUES, MAX_LOOT } from '../../data/loot.js';
import { lootBetween, lootRandom } from './loot-random.js';

// the summary at the clear counts what the road gave (data/mission-summary.js)
export function addToPurse(game, kind) {
  const value = LOOT_VALUES[kind];
  game.coins += value.coins;
  game.score += value.score;
  game.missionLoot[kind]++;
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
    rolling: false,
    taken: false,
    phase: Math.floor(lootRandom(game) * 60),
  };
}

// an apple past the limit is simply not dropped: it is worth nothing to bank and no one bit it
export function spawnPiece(game, piece) {
  if (game.loot.length >= MAX_LOOT) {
    if (LOOT_VALUES[piece.kind].coins) {
      addToPurse(game, piece.kind);
    }
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

// each piece flung to the other side from the last, at its own speed, so a burst lands far and wide
export function scatterPieces(game, { kinds, x, y }) {
  kinds.forEach((kind, i) => {
    const side = i % 2 ? 1 : -1;
    spawnPiece(game, {
      kind,
      x,
      y,
      vx: side * lootBetween(game, ...CHEST_SCATTER.speed),
      vy: lootBetween(game, ...CHEST_SCATTER.lift),
    });
  });
}

export function repeatKind(kind, count) {
  return Array.from({ length: count }, () => kind);
}
