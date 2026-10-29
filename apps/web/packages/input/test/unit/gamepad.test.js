import { describe, expect, it } from 'vitest';
import {
  createPadState,
  firstStandardPad,
  newPresses,
  readDirections,
  rememberButtons,
} from '../../src/gamepad.js';

function pad({ axes = [0, 0], down = [] } = {}) {
  const buttons = Array.from({ length: 17 }, (_, i) => ({ pressed: down.includes(i), value: 0 }));
  return { connected: true, mapping: 'standard', axes, buttons };
}

describe('gamepad', () => {
  it('uses the first connected standard pad', () => {
    const odd = { ...pad(), mapping: '' };
    const good = pad();
    expect(firstStandardPad([null, odd, good])).toBe(good);
    expect(firstStandardPad([null, odd])).toBeNull();
  });

  it('reads the d-pad and the stick past its dead zone', () => {
    expect(readDirections(pad({ axes: [-0.5, 0] })).left).toBe(true);
    expect(readDirections(pad({ axes: [-0.3, 0] })).left).toBe(false);
    expect(readDirections(pad({ down: [13] })).down).toBe(true);
  });

  it('counts a trigger pulled past half way as down', () => {
    const triggers = pad();
    triggers.buttons[7] = { pressed: false, value: 0.6 };
    expect(newPresses(triggers, {}, [7])[7]).toBe(true);
  });

  it('reports only new presses of the buttons the game listens to', () => {
    expect(newPresses(pad({ down: [0] }), {}, [0])[0]).toBe(true);
    expect(newPresses(pad({ down: [0] }), { 0: true }, [0])[0]).toBe(false);
    expect(newPresses(pad({ down: [4] }), {}, [0])).toEqual({ 0: false });
  });

  it('remembers the buttons down this poll for the next', () => {
    const state = createPadState();
    rememberButtons(pad({ down: [2] }), state, [0, 2]);
    expect(state.previous).toEqual({ 0: false, 2: true });
  });
});
