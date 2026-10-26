import { describe, expect, it } from 'vitest';
import {
  advanceStack,
  createStack,
  frontAndBack,
  moveBetween,
  settleStack,
} from '../../../src/arcade/stack-model';

const link = { navigationType: 'PUSH' } as const;
const browserBack = { navigationType: 'POP' } as const;

describe('moveBetween', () => {
  it('pushes a deeper screen and pops a shallower one, whatever took the tab there', () => {
    expect(moveBetween('home', 'credits', link)).toBe('push');
    expect(moveBetween('home', 'credits', browserBack)).toBe('push');
    expect(moveBetween('supporters', 'home', link)).toBe('pop');
  });

  it('between screens at one depth, pushes on a link and pops on the browser’s back', () => {
    expect(moveBetween('credits', 'supporters', link)).toBe('push');
    expect(moveBetween('supporters', 'credits', browserBack)).toBe('pop');
  });

  it('pops for Back to an arcade the screen was opened over, and stays put on the same screen', () => {
    expect(moveBetween('credits', 'home', { ...link, asPop: true })).toBe('pop');
    expect(moveBetween('home', 'home', link)).toBe('none');
  });
});

describe('the stack', () => {
  it('keeps the arcade at its root, under a screen opened on its own', () => {
    expect(createStack('supporters')).toMatchObject({
      layers: ['home', 'supporters'],
      top: 'supporters',
    });
    expect(createStack('home').layers).toEqual(['home']);
  });

  it('holds the screen it leaves until the move settles, then lets it go', () => {
    const pushed = advanceStack(createStack('home'), 'credits', link);

    expect(pushed).toMatchObject({
      layers: ['home', 'credits'],
      leaving: 'home',
      move: 'push',
      id: 1,
    });
    expect(frontAndBack(pushed)).toEqual({ front: 'credits', back: 'home' });

    const across = advanceStack(settleStack(pushed), 'supporters', link);

    expect(across.layers).toEqual(['home', 'credits', 'supporters']);
    expect(settleStack(across)).toMatchObject({
      layers: ['home', 'supporters'],
      leaving: null,
      move: 'none',
    });
  });

  it('slides the screen that leaves over the one it uncovers on a pop', () => {
    const popped = advanceStack(createStack('credits'), 'home', browserBack);

    expect(frontAndBack(popped)).toEqual({ front: 'credits', back: 'home' });
    expect(frontAndBack(settleStack(popped))).toBeNull();
  });

  it('stays as it is on a move to the screen it shows', () => {
    const stack = createStack('home');

    expect(advanceStack(stack, 'home', link)).toBe(stack);
  });
});
