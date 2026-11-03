import {
  firstStandardPad,
  isDown,
  newPresses,
  readDirections,
  rememberButtons,
} from '../../../../packages/input/src/gamepad.js';
import { releaseAll } from '../sim/input-state.js';

// A passes, X or B shoots, either right shoulder sprints, as on most football games
const BUTTON_ACTIONS = [
  [0, 'pass'],
  [2, 'shoot'],
  [1, 'shoot'],
  [5, 'sprint'],
  [7, 'sprint'],
];

export const START = 9;
export const CONFIRM = 0;

const BUTTONS = [...new Set([...BUTTON_ACTIONS.map(([index]) => index), START])];
const ACTIONS = [...new Set(BUTTON_ACTIONS.map(([, action]) => action))];

// what the pad gives this frame, or null with no pad in hand
export function readPad(navigator, state) {
  const pad = firstStandardPad(navigator.getGamepads?.() ?? []);

  state.connected = Boolean(pad);

  if (!pad) {
    return null;
  }

  const presses = newPresses(pad, state.previous, BUTTONS);

  rememberButtons(pad, state, BUTTONS);

  return { pad, presses, directions: readDirections(pad) };
}

const isActionDown = (pad, action) =>
  BUTTON_ACTIONS.some(([index, name]) => name === action && isDown(pad, index));

export function steerFromPad(source, reading) {
  if (!reading) {
    releaseAll(source);

    return;
  }

  Object.assign(source.held, reading.directions);

  for (const [index, action] of BUTTON_ACTIONS) {
    if (reading.presses[index]) {
      source.pressed[action] = true;
    }
  }

  for (const action of ACTIONS) {
    source.held[action] = isActionDown(reading.pad, action);
  }
}
