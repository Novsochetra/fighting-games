import { releaseAll } from '../sim/input/create-input.js';
import { actionForKey, pressAction, releaseAction } from './key-actions.js';

function hasModifier(event) {
  return event.metaKey || event.ctrlKey || event.altKey;
}

// a player typing their name types it: the keys go to the field, not the game or its menus, but
// Escape still backs out of the panel
function handleTyping(event, menus) {
  if (event.code === 'Escape') {
    event.target.blur();
    menus.handleKey(event);
  }
}

const isTyping = (event) => !!event.target?.matches?.('input, textarea');

export function handleKeyDown(event, { game, menus, ui }) {
  ui.noteInput('key');
  if (isTyping(event)) {
    handleTyping(event, menus);
    return;
  }
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
