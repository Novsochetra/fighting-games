function axis(negative, positive) {
  if (negative) {
    return -1;
  }

  return positive ? 1 : 0;
}

// menus repeat a held direction: first after 18 ticks, then every 7
export function menuStep(state, directions, tickCount) {
  const move = axis(directions.up, directions.down);
  const adjust = axis(directions.left, directions.right);
  const code = move || adjust * 10;
  let step = null;

  if (code && (code !== state.navDirection || tickCount >= state.navRepeatAt)) {
    step = move ? ['move', move] : ['adjust', adjust];
    state.navRepeatAt = tickCount + (code === state.navDirection ? 7 : 18);
  }

  state.navDirection = code;

  return step;
}
