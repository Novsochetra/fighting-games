export const KEY_ACTIONS = {
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  ArrowUp: 'up',
  KeyW: 'up',
  ArrowDown: 'down',
  KeyS: 'down',
  KeyJ: 'light',
  KeyZ: 'light',
  KeyK: 'heavy',
  KeyX: 'heavy',
  KeyL: 'ult',
  KeyU: 'ult',
  Space: 'jump',
  KeyC: 'jump',
  ShiftLeft: 'dash',
  ShiftRight: 'dash',
  KeyP: 'pause',
  Escape: 'pause',
  KeyH: 'debug',
  KeyM: 'mute',
  Digit1: 'weapon1',
  Digit2: 'weapon2',
  Digit3: 'weapon3',
  Digit4: 'weapon4',
  Digit0: 'fillUlt',
};

export function actionForKey(code) {
  return KEY_ACTIONS[code] ?? null;
}

export function pressAction(input, action, repeat) {
  if (!repeat) {
    input.pressed[action] = true;
  }
  input.held[action] = true;
}

export function releaseAction(input, action) {
  input.held[action] = false;
}
