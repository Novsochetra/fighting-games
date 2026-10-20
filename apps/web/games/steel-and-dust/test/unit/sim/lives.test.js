import { describe, expect, it } from 'vitest';
import { hasLivesLeft, loseLife } from '../../../src/sim/stage/lives.js';

describe('lives', () => {
  it('takes one life a fall and never goes below none', () => {
    const game = { lives: 2 };
    loseLife(game);
    expect(game.lives).toBe(1);
    expect(hasLivesLeft(game)).toBe(true);
    loseLife(game);
    loseLife(game);
    expect(game.lives).toBe(0);
    expect(hasLivesLeft(game)).toBe(false);
  });
});
