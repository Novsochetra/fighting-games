// `input` holds what was pressed this tick and what is held, by the game's action names
export function pressAction(input, action, repeat) {
  if (!repeat) {
    input.pressed[action] = true;
  }

  input.held[action] = true;
}

export function releaseAction(input, action) {
  input.held[action] = false;
}
