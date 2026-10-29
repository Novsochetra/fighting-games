// a fall costs a life and nothing gives one back: not a continue, a restart or a new mission
export function loseLife(game) {
  game.lives = Math.max(0, game.lives - 1);
}

export function hasLivesLeft(game) {
  return game.lives > 0;
}

// a heart is a try still to come, as a spare life is in an arcade, so the life being played has
// none and a hero with no hearts left plays on, on the last life
export function heartsLeft(lives) {
  return Math.max(0, lives - 1);
}
