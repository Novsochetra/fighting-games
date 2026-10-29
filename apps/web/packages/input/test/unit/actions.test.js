import { describe, expect, it } from 'vitest';
import { pressAction, releaseAction } from '../../src/actions.js';

describe('actions', () => {
  it('counts a held key as one press', () => {
    const input = { pressed: {}, held: {} };
    pressAction(input, 'light', true);
    expect(input).toEqual({ pressed: {}, held: { light: true } });
    pressAction(input, 'light', false);
    expect(input.pressed.light).toBe(true);
  });

  it('lets go of a released action', () => {
    const input = { pressed: {}, held: { jump: true } };
    releaseAction(input, 'jump');
    expect(input.held.jump).toBe(false);
  });
});
