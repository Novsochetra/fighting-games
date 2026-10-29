import { describe, expect, it } from 'vitest';
import { actionForKey } from '../../../src/input/key-actions.js';

describe('keyboard actions', () => {
  it('maps both key layouts to the same actions', () => {
    expect([actionForKey('KeyJ'), actionForKey('KeyZ')]).toEqual(['light', 'light']);
    expect([actionForKey('ArrowUp'), actionForKey('KeyW')]).toEqual(['up', 'up']);
    expect(actionForKey('KeyQ')).toBeNull();
  });
});
