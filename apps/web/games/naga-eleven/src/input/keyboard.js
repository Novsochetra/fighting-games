import { pressAction, releaseAction } from '../../../../packages/input/src/actions.js';
import { releaseAll } from '../sim/input-state.js';

const KEY_ACTIONS = {
  ArrowUp: 'up',
  KeyW: 'up',
  ArrowDown: 'down',
  KeyS: 'down',
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  KeyJ: 'pass',
  KeyZ: 'pass',
  Enter: 'pass',
  NumpadEnter: 'pass',
  Space: 'pass',
  KeyK: 'shoot',
  KeyX: 'shoot',
  KeyL: 'sprint',
  ShiftLeft: 'sprint',
  ShiftRight: 'sprint',
};

const PAUSE_KEYS = new Set(['Escape', 'KeyP']);

export const actionOfKey = (code) => KEY_ACTIONS[code] ?? null;

export const isPauseKey = (code) => PAUSE_KEYS.has(code);

// `isCapturing()` says whether the canvas has the keys; while a DOM menu has them, Enter and Space
// must still press its buttons, so the game leaves the key's own action alone
export function installKeyboard(window, { source, onPause, isCapturing = () => true }) {
  window.addEventListener('keydown', (event) => {
    const action = actionOfKey(event.code);

    if (isPauseKey(event.code)) {
      onPause();
    } else if (action && isCapturing()) {
      event.preventDefault();
      pressAction(source, action, event.repeat);
    }
  });

  window.addEventListener('keyup', (event) => {
    const action = actionOfKey(event.code);

    if (action) {
      releaseAction(source, action);
    }
  });

  // a key let go while the tab was away never sends its keyup
  window.addEventListener('blur', () => releaseAll(source));
}
