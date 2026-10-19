import {
  createPadState,
  firstStandardPad,
  isDown,
  menuStep,
  newPresses,
  PLAY_BUTTONS,
  readDirections,
  rememberButtons,
} from './gamepad-state.js';

function releaseDirections(state, held) {
  for (const key of Object.keys(state.directions)) {
    if (state.directions[key]) {
      state.directions[key] = false;
      held[key] = false;
    }
  }
}

function driveMenus(state, { game, menus, directions, presses }) {
  const step = menuStep(state, directions, game.tickCount);
  if (step) {
    menus.navigate(...step);
  }
  if (presses[0]) {
    menus.navigate('ok');
  }
  if (presses[1] || presses[8]) {
    menus.navigate('back');
  }
  if (presses[9]) {
    menus.navigate('start');
  }
  releaseDirections(state, game.input.held);
}

// up is a jump on the keyboard, so on the pad only the A button jumps
function driveFighter(state, { game, pad, directions, presses }) {
  const { held, pressed } = game.input;
  for (const [key, down] of Object.entries(directions)) {
    if (down !== state.directions[key]) {
      state.directions[key] = down;
      held[key] = down;
      if (down && key !== 'up') {
        pressed[key] = true;
      }
    }
  }
  for (const [index, action] of Object.entries(PLAY_BUTTONS)) {
    if (presses[index]) {
      pressed[action] = true;
    }
    if (isDown(pad, Number(index))) {
      held[action] = true;
    } else if (state.previous[index]) {
      held[action] = false;
    }
  }
  if (presses[9]) {
    pressed.pause = true;
  }
}

function lostPad(state, game) {
  if (state.connected) {
    state.connected = false;
    releaseDirections(state, game.input.held);
  }
}

// standard mapping: stick or d-pad moves, A jump, X light, Y heavy, B dash, RB/RT ultimate, Start pause
export function createGamepadReader({ navigator, game, menus, ui }) {
  const state = createPadState();
  return {
    state,
    poll() {
      const pads = navigator.getGamepads ? navigator.getGamepads() : null;
      const pad = pads && firstStandardPad(pads);
      if (!pad) {
        lostPad(state, game);
        return;
      }
      state.connected = true;
      const directions = readDirections(pad);
      const presses = newPresses(pad, state.previous);
      if (Object.values(presses).some(Boolean) || Object.values(directions).some(Boolean)) {
        ui.noteInput('pad');
      }
      const context = { game, menus, pad, directions, presses };
      if (menus.isOpen()) {
        driveMenus(state, context);
      } else {
        driveFighter(state, context);
      }
      rememberButtons(pad, state);
    },
  };
}
