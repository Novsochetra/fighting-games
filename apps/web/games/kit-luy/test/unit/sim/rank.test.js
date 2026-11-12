import { describe, expect, it } from 'vitest';
import { RANKS } from '../../../src/data/ranks.js';
import { rankOf, rankProgress } from '../../../src/sim/rank.js';

describe('ranks', () => {
  it('start from nothing and each asks for more than the last', () => {
    expect(RANKS[0].from).toBe(0);

    RANKS.slice(1).forEach((rank, i) => expect(rank.from).toBeGreaterThan(RANKS[i].from));
  });

  it('gives the highest rank the savings have reached', () => {
    expect(rankOf(0).id).toBe('student');
    expect(rankOf(9900).id).toBe('student');
    expect(rankOf(10000).id).toBe('snackSeller');
    expect(rankOf(99999999).id).toBe('tycoon');
  });

  it('measures the way from a rank to the next', () => {
    expect(rankProgress(0)).toMatchObject({ share: 0, next: { id: 'snackSeller' } });
    expect(rankProgress(30000)).toMatchObject({ rank: { id: 'snackSeller' }, share: 0.5 });
  });

  it('is full at the top rank, with none after it', () => {
    expect(rankProgress(7000000)).toMatchObject({ rank: { id: 'tycoon' }, next: null, share: 1 });
  });
});
