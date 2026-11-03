import { describe, expect, it } from 'vitest';
import { actionOfKey, installKeyboard, isPauseKey } from '../../../src/input/keyboard.js';
import { createInput } from '../../../src/sim/input-state.js';

function fakeWindow() {
  const listeners = {};

  return {
    addEventListener: (type, listener) => {
      listeners[type] = listener;
    },
    send: (type, fields) => listeners[type]({ preventDefault: () => {}, repeat: false, ...fields }),
  };
}

describe('the keyboard', () => {
  it('maps WASD and the arrows to the stick, and J K L to pass, shoot and run', () => {
    expect(['KeyW', 'ArrowUp'].map(actionOfKey)).toEqual(['up', 'up']);
    expect(['KeyJ', 'KeyK', 'KeyL'].map(actionOfKey)).toEqual(['pass', 'shoot', 'sprint']);
    expect(actionOfKey('KeyQ')).toBe(null);
    expect(isPauseKey('Escape')).toBe(true);
  });

  it('holds an action while its key is down and presses it once', () => {
    const window = fakeWindow();
    const input = createInput();
    const source = input.sources.keys;

    installKeyboard(window, { source, onPause: () => {} });
    window.send('keydown', { code: 'KeyK' });

    expect(source.held.shoot).toBe(true);
    expect(input.pressed.shoot).toBe(true);

    window.send('keyup', { code: 'KeyK' });

    expect(source.held.shoot).toBe(false);
  });

  it('confirms with Enter and Space too, but leaves them to a DOM menu that has the keys', () => {
    const window = fakeWindow();
    const input = createInput();
    let capturing = true;

    installKeyboard(window, {
      source: input.sources.keys,
      onPause: () => {},
      isCapturing: () => capturing,
    });
    window.send('keydown', { code: 'Enter' });

    expect(input.pressed.pass).toBe(true);

    delete input.pressed.pass;
    capturing = false;
    window.send('keydown', { code: 'Space' });

    expect(input.pressed.pass).toBeUndefined();
  });

  it('pauses on Escape, and lets every key go when the window loses focus', () => {
    const window = fakeWindow();
    const source = createInput().sources.keys;
    let pauses = 0;

    installKeyboard(window, { source, onPause: () => (pauses += 1) });
    window.send('keydown', { code: 'Escape' });
    window.send('keydown', { code: 'KeyD' });
    window.send('blur', {});

    expect(pauses).toBe(1);
    expect(source.held.right).toBe(false);
  });
});
