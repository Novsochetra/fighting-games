import { describe, expect, it, vi } from 'vitest';
import {
  STICK_THRESHOLD,
  newlyPressed,
  readAllGamepads,
  readGamepadActions,
} from '../../../src/home/gamepad.js';
import { createGamepadPoller } from '../../../src/home/gamepad-poller.js';
import { actionForKey, isFormControl } from '../../../src/home/input-actions.js';

const pad = ({ pressed = [], axes = [0, 0] } = {}) => ({
  buttons: Array.from({ length: 17 }, (_, i) => ({
    pressed: pressed.includes(i),
    value: pressed.includes(i) ? 1 : 0,
  })),
  axes,
});

describe('actionForKey', () => {
  it.each([
    ['ArrowUp', 'up'],
    ['w', 'up'],
    ['W', 'up'],
    ['ArrowDown', 'down'],
    ['s', 'down'],
    ['ArrowLeft', 'left'],
    ['a', 'left'],
    ['ArrowRight', 'right'],
    ['D', 'right'],
    ['Enter', 'start'],
    [' ', 'start'],
  ])('maps %j to %s', (key, action) => {
    expect(actionForKey({ key })).toBe(action);
  });

  it('ignores other keys and browser shortcuts', () => {
    expect(actionForKey({ key: 'Tab' })).toBeNull();
    expect(actionForKey({ key: 'constructor' })).toBeNull();
    expect(actionForKey({ key: 'ArrowLeft', altKey: true })).toBeNull();
    expect(actionForKey({ key: 'd', ctrlKey: true })).toBeNull();
    expect(actionForKey({ key: 'Enter', metaKey: true })).toBeNull();
  });
});

describe('isFormControl', () => {
  it('spots buttons and fields, which handle Enter and Space themselves', () => {
    expect(isFormControl({ tagName: 'BUTTON' })).toBe(true);
    expect(isFormControl({ tagName: 'INPUT' })).toBe(true);
    expect(isFormControl({ tagName: 'A' })).toBe(false);
    expect(isFormControl(null)).toBe(false);
  });
});

describe('readGamepadActions', () => {
  it('reads the d-pad, A and Start buttons', () => {
    expect(readGamepadActions(pad({ pressed: [12] }))).toEqual(new Set(['up']));
    expect(readGamepadActions(pad({ pressed: [13, 0] }))).toEqual(new Set(['down', 'start']));
    expect(readGamepadActions(pad({ pressed: [14, 15, 9] }))).toEqual(
      new Set(['left', 'right', 'start']),
    );
  });

  it('reads the left stick past the threshold only', () => {
    const past = STICK_THRESHOLD + 0.1;
    expect(readGamepadActions(pad({ axes: [-past, 0] }))).toEqual(new Set(['left']));
    expect(readGamepadActions(pad({ axes: [past, past] }))).toEqual(new Set(['right', 'down']));
    expect(readGamepadActions(pad({ axes: [0, -past] }))).toEqual(new Set(['up']));
    expect(readGamepadActions(pad({ axes: [STICK_THRESHOLD - 0.1, 0] }))).toEqual(new Set());
  });

  it('copes with missing pads, buttons and axes', () => {
    expect(readGamepadActions(null)).toEqual(new Set());
    expect(readGamepadActions({})).toEqual(new Set());
  });
});

describe('readAllGamepads and newlyPressed', () => {
  it('merges every connected pad', () => {
    expect(readAllGamepads([pad({ pressed: [12] }), null, pad({ pressed: [0] })])).toEqual(
      new Set(['up', 'start']),
    );
  });

  it('reports a button once, on the frame it goes down', () => {
    expect(newlyPressed(new Set(), new Set(['up']))).toEqual(['up']);
    expect(newlyPressed(new Set(['up']), new Set(['up']))).toEqual([]);
    expect(newlyPressed(new Set(['up']), new Set(['up', 'start']))).toEqual(['start']);
  });
});

describe('createGamepadPoller', () => {
  const setup = (framesOfPads) => {
    const frames = [];
    const onAction = vi.fn();
    let frame = 0;
    const poller = createGamepadPoller({
      getGamepads: () => framesOfPads[Math.min(frame, framesOfPads.length - 1)],
      requestFrame: (callback) => frames.push(callback),
      onAction,
    });
    const runFrame = () => {
      frames.shift()?.();
      frame += 1;
    };
    return { poller, onAction, runFrame, frames };
  };

  it('fires each press once while the button is held', () => {
    const held = [pad({ pressed: [15] })];
    const { poller, onAction, runFrame } = setup([held, held, [pad()], held]);
    poller.start();
    runFrame();
    runFrame();
    runFrame();
    runFrame();
    expect(onAction.mock.calls).toEqual([['right'], ['right']]);
  });

  it('stops polling when no pad is connected and starts again on request', () => {
    const { poller, runFrame, frames } = setup([[null]]);
    poller.start();
    expect(poller.isRunning()).toBe(true);
    runFrame();
    expect(poller.isRunning()).toBe(false);
    expect(frames).toHaveLength(0);
    poller.start();
    poller.start();
    expect(frames).toHaveLength(1);
  });
});
