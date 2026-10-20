// a fall costs a life and nothing gives one back: not a continue, a restart or a new mission
export function loseLife(game) {
  game.lives = Math.max(0, game.lives - 1);
}

export function hasLivesLeft(game) {
  return game.lives > 0;
}
