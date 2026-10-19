const WATCHED_BUTTONS = [0, 1, 2, 3, 5, 7, 9, 8];
export const PLAY_BUTTONS = { 0: 'jump', 2: 'light', 3: 'heavy', 1: 'dash', 5: 'ult', 7: 'ult' };

export function createPadState() {
  return {
    previous: {},
    directions: { left: false, right: false, up: false, down: false },
    navDirection: 0,
    navRepeatAt: 0,
    connected: false,
  };
}

export function firstStandardPad(pads) {
  for (const pad of pads) {
    if (pad && pad.connected && pad.mapping === 'standard') {
      return pad;
    }
  }
  return null;
}

export function isDown(pad, index) {
  const button = pad.buttons[index];
  return !!(button && (button.pressed || button.value > 0.5));
}

// the d-pad or the left stick past a dead zone
export function readDirections(pad) {
  const x = pad.axes[0] || 0;
  const y = pad.axes[1] || 0;
  return {
    left: isDown(pad, 14) || x < -0.45,
    right: isDown(pad, 15) || x > 0.45,
    up: isDown(pad, 12) || y < -0.6,
    down: isDown(pad, 13) || y > 0.6,
  };
}

export function newPresses(pad, previous) {
  const presses = {};
  for (const index of WATCHED_BUTTONS) {
    presses[index] = isDown(pad, index) && !previous[index];
  }
  return presses;
}

export function rememberButtons(pad, state) {
  for (const index of WATCHED_BUTTONS) {
    state.previous[index] = isDown(pad, index);
  }
}

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
