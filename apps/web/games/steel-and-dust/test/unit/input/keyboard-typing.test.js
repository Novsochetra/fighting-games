import { describe, expect, it, vi } from 'vitest';
import { handleKeyDown } from '../../../src/input/keyboard.js';

function setup() {
  const menus = { isOpen: () => true, handleKey: vi.fn() };
  const game = { input: { pressed: {} } };
  const ui = { noteInput: vi.fn() };
  const field = { matches: (selector) => selector.includes('input'), blur: vi.fn() };
  return { menus, game, ui, field };
}

const keyDown = (code, target) => ({ code, target, repeat: false, preventDefault: vi.fn() });

describe('typing a name', () => {
  it('leaves the keys to the field: the menus never take a letter, Backspace or M', () => {
    const { menus, game, ui, field } = setup();
    for (const code of ['KeyS', 'KeyK', 'Backspace', 'KeyM', 'Space', 'Enter', 'ArrowDown']) {
      const event = keyDown(code, field);
      handleKeyDown(event, { game, menus, ui });
      expect(event.preventDefault).not.toHaveBeenCalled();
    }
    expect(menus.handleKey).not.toHaveBeenCalled();
    expect(game.input.pressed.mute).toBeUndefined();
  });

  it('still backs out of the panel with Escape', () => {
    const { menus, game, ui, field } = setup();
    const event = keyDown('Escape', field);
    handleKeyDown(event, { game, menus, ui });
    expect(field.blur).toHaveBeenCalled();
    expect(menus.handleKey).toHaveBeenCalledWith(event);
  });

  it('hands every other key to the menus as before', () => {
    const { menus, game, ui } = setup();
    const event = keyDown('KeyK', { matches: () => false });
    handleKeyDown(event, { game, menus, ui });
    expect(menus.handleKey).toHaveBeenCalledWith(event);
  });
});
