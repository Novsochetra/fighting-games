import { describe, expect, it } from 'vitest';
import { bannerStates, firstTurn, nextTurn } from '@/screens/home/library/banner-turn.js';

const statesOf = (turn, count) => Object.fromEntries(bannerStates(turn, count));

describe('the wallpapers banner turning', () => {
  it('starts on the first banner, with the next one drawn unseen so it loads before its turn', () => {
    expect(statesOf(firstTurn(), 5)).toEqual({ 0: 'shown', 1: 'waiting' });
  });

  it('fades the next one in over the one before, which stays whole under it', () => {
    expect(statesOf(nextTurn(firstTurn(), 5), 5)).toEqual({
      0: 'leaving',
      1: 'shown',
      2: 'waiting',
    });
  });

  it('draws only three banners at a time, whichever turn it is', () => {
    let turn = firstTurn();

    for (let step = 0; step < 12; step += 1) {
      turn = nextTurn(turn, 5);
      expect(bannerStates(turn, 5).size).toBe(3);
    }
  });

  it('comes round to the first after the last', () => {
    const last = { current: 4, previous: 3 };

    expect(nextTurn(last, 5)).toEqual({ current: 0, previous: 4 });
    expect(statesOf(nextTurn(last, 5), 5)).toEqual({ 4: 'leaving', 0: 'shown', 1: 'waiting' });
  });

  it('keeps the one leaving whole when there are only two', () => {
    expect(statesOf(nextTurn(firstTurn(), 2), 2)).toEqual({ 0: 'leaving', 1: 'shown' });
  });
});
