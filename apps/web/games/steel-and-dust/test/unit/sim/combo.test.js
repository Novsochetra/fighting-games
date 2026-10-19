import { describe, expect, it, vi } from 'vitest';
import { comboRank, commitScore, endCombo } from '../../../src/sim/combat/combo.js';

function gameWith(combo, records = { bestCombo: 0, bestScore: 0 }) {
  return { combo, records, score: 0, io: { sfx: vi.fn(), saveRecords: vi.fn() } };
}

describe('combos', () => {
  it('ranks by hit count', () => {
    expect([comboRank(3), comboRank(5), comboRank(10), comboRank(20), comboRank(35)]).toEqual([
      '',
      'NICE',
      'GREAT',
      'BRUTAL',
      'LEGENDARY',
    ]);
  });

  it('shows a result for five hits or more and saves a new best', () => {
    const game = gameWith({ count: 12, timer: 40, damage: 80, bump: 0 });
    endCombo(game);
    expect(game.comboResult).toMatchObject({ count: 12, damage: 80, rank: 'GREAT', best: true });
    expect(game.records.bestCombo).toBe(12);
    expect(game.io.saveRecords).toHaveBeenCalledOnce();
    expect(game.combo).toMatchObject({ count: 0, timer: 0, damage: 0 });
  });

  it('shows nothing for a short combo', () => {
    const game = gameWith(
      { count: 3, timer: 40, damage: 15, bump: 0 },
      { bestCombo: 9, bestScore: 0 },
    );
    endCombo(game);
    expect(game.comboResult).toBeUndefined();
    expect(game.io.saveRecords).not.toHaveBeenCalled();
  });

  it('marks and saves a new best score', () => {
    const game = gameWith({ count: 0 });
    game.score = 1500;
    commitScore(game);
    expect(game.newBestScore).toBe(true);
    expect(game.records.bestScore).toBe(1500);
  });
});
