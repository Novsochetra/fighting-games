import { describe, expect, it } from 'vitest';
import { actionForKey, focusZone } from '@/screens/home/inputs/keyboard.js';

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

describe('focusZone', () => {
  const inside = (selector) => ({ closest: (wanted) => (wanted === selector ? {} : null) });

  it('tells a carousel card from a library tile', () => {
    expect(focusZone(inside('.card'))).toBe('carousel');
    expect(focusZone(inside('.tile'))).toBe('library');
    expect(focusZone(inside('.other'))).toBeNull();
    expect(focusZone(null)).toBeNull();
  });
});
