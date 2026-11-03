import { describe, expect, it } from 'vitest';
import { createPadState } from '../../../../../packages/input/src/gamepad.js';
import { readPad, START, steerFromPad } from '../../../src/input/gamepad.js';
import { createInput } from '../../../src/sim/input-state.js';

function padWith(down, axes = [0, 0]) {
  const buttons = Array.from({ length: 17 }, (_, index) => ({
    pressed: down.includes(index),
    value: down.includes(index) ? 1 : 0,
  }));

  return { connected: true, mapping: 'standard', buttons, axes };
}

const navigatorWith = (pad) => ({ getGamepads: () => [pad] });

describe('the gamepad', () => {
  it('steers with the left stick and passes with A once per press', () => {
    const state = createPadState();
    const input = createInput();
    const source = input.sources.pad;

    steerFromPad(source, readPad(navigatorWith(padWith([0], [0.9, 0])), state));

    expect(source.held.right).toBe(true);
    expect(input.pressed.pass).toBe(true);

    delete input.pressed.pass;
    steerFromPad(source, readPad(navigatorWith(padWith([0], [0.9, 0])), state));

    expect(input.pressed.pass).toBeUndefined();
    expect(source.held.pass).toBe(true);
  });

  it('shoots with X or B and runs with a right shoulder', () => {
    const source = createInput().sources.pad;

    steerFromPad(source, readPad(navigatorWith(padWith([1, 7])), createPadState()));

    expect(source.held).toMatchObject({ shoot: true, sprint: true, pass: false });
  });

  it('tells a press of Start, and lets go of everything when the pad is gone', () => {
    const state = createPadState();
    const source = createInput().sources.pad;
    const reading = readPad(navigatorWith(padWith([START, 2])), state);

    expect(reading.presses[START]).toBe(true);

    steerFromPad(source, reading);
    steerFromPad(source, readPad({ getGamepads: () => [] }, state));

    expect(source.held.shoot).toBe(false);
    expect(state.connected).toBe(false);
  });
});
