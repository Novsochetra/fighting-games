import { describe, expect, it } from 'vitest';
import {
  createPadState,
  firstStandardPad,
  menuStep,
  newPresses,
  readDirections,
} from '../../../src/input/gamepad-state.js';

function pad({ axes = [0, 0], down = [] } = {}) {
  const buttons = Array.from({ length: 17 }, (_, i) => ({ pressed: down.includes(i), value: 0 }));
  return { connected: true, mapping: 'standard', axes, buttons };
}

describe('gamepad state', () => {
  it('uses the first connected standard pad', () => {
    const odd = { ...pad(), mapping: '' };
    const good = pad();
    expect(firstStandardPad([null, odd, good])).toBe(good);
  });

  it('reads the d-pad and the stick past its dead zone', () => {
    expect(readDirections(pad({ axes: [-0.5, 0] })).left).toBe(true);
    expect(readDirections(pad({ axes: [-0.3, 0] })).left).toBe(false);
    expect(readDirections(pad({ down: [13] })).down).toBe(true);
  });

  it('reports only new presses', () => {
    expect(newPresses(pad({ down: [0] }), {})[0]).toBe(true);
    expect(newPresses(pad({ down: [0] }), { 0: true })[0]).toBe(false);
  });

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
});
