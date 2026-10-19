import { describe, expect, it } from 'vitest';
import { actionForKey, pressAction } from '../../../src/input/key-actions.js';

describe('keyboard actions', () => {
  it('maps both key layouts to the same actions', () => {
    expect([actionForKey('KeyJ'), actionForKey('KeyZ')]).toEqual(['light', 'light']);
    expect([actionForKey('ArrowUp'), actionForKey('KeyW')]).toEqual(['up', 'up']);
    expect(actionForKey('KeyQ')).toBeNull();
  });

  it('counts a held key as one press', () => {
    const input = { pressed: {}, held: {} };
    pressAction(input, 'light', true);
    expect(input).toEqual({ pressed: {}, held: { light: true } });
    pressAction(input, 'light', false);
    expect(input.pressed.light).toBe(true);
  });
});
