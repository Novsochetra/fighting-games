import { describe, expect, it } from 'vitest';
import { createPadState } from '../../src/gamepad.js';
import { menuStep } from '../../src/menu-repeat.js';

describe('menu repeat', () => {
  it('repeats a held menu direction after a delay', () => {
    const state = createPadState();
    const down = { up: false, down: true, left: false, right: false };
    expect(menuStep(state, down, 0)).toEqual(['move', 1]);
    expect(menuStep(state, down, 10)).toBeNull();
    expect(menuStep(state, down, 18)).toEqual(['move', 1]);
    expect(menuStep(state, down, 24)).toBeNull();
    expect(menuStep(state, down, 25)).toEqual(['move', 1]);
  });

  it('adjusts with left and right', () => {
    expect(
      menuStep(createPadState(), { up: false, down: false, left: false, right: true }, 0),
    ).toEqual(['adjust', 1]);
  });

  it('steps again at once when the direction changes', () => {
    const state = createPadState();
    menuStep(state, { up: false, down: true, left: false, right: false }, 0);
    expect(menuStep(state, { up: true, down: false, left: false, right: false }, 1)).toEqual([
      'move',
      -1,
    ]);
  });
});
