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

// `buttons` are the indices of the standard mapping the game listens to
export function newPresses(pad, previous, buttons) {
  const presses = {};

  for (const index of buttons) {
    presses[index] = isDown(pad, index) && !previous[index];
  }

  return presses;
}

export function rememberButtons(pad, state, buttons) {
  for (const index of buttons) {
    state.previous[index] = isDown(pad, index);
  }
}
