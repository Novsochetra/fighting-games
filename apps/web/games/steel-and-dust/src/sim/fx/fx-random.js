// a heavy's dressing draws from a seeded stream of its own on the game, so dressing a move never
// changes which way a fight goes: Math.random also steers the raiders and the recorded runs
export function fxRandom(game) {
  game.fxSeed = (Math.imul(game.fxSeed, 1664525) + 1013904223) >>> 0;
  return game.fxSeed / 4294967296;
}

export function fxBetween(game, low, high) {
  return low + fxRandom(game) * (high - low);
}
