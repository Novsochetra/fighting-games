import { releaseAll } from '../sim/input/create-input.js';
import { pressAction, releaseAction } from '../../../../packages/input/src/actions.js';
import { actionForKey } from './key-actions.js';

function hasModifier(event) {
  return event.metaKey || event.ctrlKey || event.altKey;
}

export function handleKeyDown(event, { game, menus, ui }) {
  ui.noteInput('key');
  if (event.code === 'KeyM' && !event.repeat) {
    game.input.pressed.mute = true;
    return;
  }
  if (menus.isOpen()) {
    menus.handleKey(event);
    return;
  }
  const action = actionForKey(event.code);
  if (!action) {
    return;
  }
  if (!hasModifier(event)) {
    event.preventDefault();
  }
  pressAction(game.input, action, event.repeat);
}

export function installKeyboard(target, { game, audio, menus, ui }) {
  target.addEventListener('keydown', (event) => {
    audio.unlock();
    handleKeyDown(event, { game, menus, ui });
  });
  target.addEventListener('keyup', (event) => {
    const action = actionForKey(event.code);
    if (action) {
      releaseAction(game.input, action);
    }
  });
  target.addEventListener('blur', () => releaseAll(game.input));
}
