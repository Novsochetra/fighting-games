// loot draws from a seeded stream of its own on the game, as heavy dressing does (fx/fx-random.js):
// Math.random steers the raiders and the recorded runs, so a coin's bounce must never take a draw
export function lootRandom(game) {
  game.lootSeed = (Math.imul(game.lootSeed, 1664525) + 1013904223) >>> 0;
  return game.lootSeed / 4294967296;
}

export function lootBetween(game, low, high) {
  return low + lootRandom(game) * (high - low);
}

export function lootChance(game, chance) {
  return lootRandom(game) < chance;
}

export function lootCount(game, [low, high]) {
  return low + Math.floor(lootRandom(game) * (high - low + 1));
}
