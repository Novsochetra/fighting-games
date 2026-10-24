import { describe, expect, it, vi } from 'vitest';
import { saveCheckpoint, saveFall } from '../../../src/sim/stage/checkpoint.js';
import { endRun } from '../../../src/sim/stage/run-end.js';

function gameAt(more = {}) {
  return {
    missionIndex: 4,
    score: 6200,
    coins: 120,
    playTime: 14400,
    continues: 1,
    lives: 3,
    ultMeter: 40,
    settings: { hero: 'blue', difficulty: 2, training: false },
    checkpoint: null,
    leaderboard: [],
    lastRun: null,
    io: { saveRun: vi.fn(), saveLeaderboard: vi.fn(), now: () => 1792800000000 },
    ...more,
  };
}

describe('the saved run', () => {
  it('is saved with what the run carries into a mission', () => {
    const game = gameAt();
    saveCheckpoint(game);
    const saved = {
      mission: 4,
      score: 6200,
      coins: 120,
      playTime: 14400,
      continues: 1,
      lives: 3,
      ultMeter: 40,
    };
    expect(game.checkpoint).toEqual(saved);
    expect(game.io.saveRun).toHaveBeenLastCalledWith(saved);
  });

  it('loses the life of a fall, but keeps the score it was saved with', () => {
    const game = gameAt();
    saveCheckpoint(game);
    Object.assign(game, { lives: 2, score: 9100, coins: 300 });
    saveFall(game);
    expect(game.checkpoint).toMatchObject({ lives: 2, score: 6200, coins: 120 });
    expect(game.io.saveRun).toHaveBeenLastCalledWith(game.checkpoint);
    expect(game.io.saveLeaderboard).not.toHaveBeenCalled();
  });

  it('is let go with the last life, and the run goes on the leaderboard', () => {
    const game = gameAt();
    saveCheckpoint(game);
    game.lives = 0;
    saveFall(game);
    expect(game.checkpoint).toBeNull();
    expect(game.io.saveRun).toHaveBeenLastCalledWith(null);
    const run = {
      score: 6200,
      mission: 5,
      hero: 'blue',
      difficulty: 2,
      time: 14400,
      cleared: false,
      at: 1792800000000,
    };
    expect(game.leaderboard).toEqual([run]);
    expect(game.lastRun).toBe(game.leaderboard[0]);
    expect(game.io.saveLeaderboard).toHaveBeenCalledWith([run]);
  });
});

describe('a run that ends', () => {
  it('goes on the leaderboard marked clear when the last boss falls', () => {
    const game = gameAt({ missionIndex: 11, leaderboard: [{ score: 9000 }] });
    endRun(game, true);
    expect(game.leaderboard.map((run) => run.score)).toEqual([9000, 6200]);
    expect(game.lastRun).toMatchObject({ mission: 12, cleared: true });
  });

  it('records the difficulty the run was played on, Normal for one it does not know', () => {
    const game = gameAt({ settings: { hero: 'moss', difficulty: 7, training: false } });
    endRun(game, false);
    expect(game.lastRun.difficulty).toBe(1);
  });

  it('stays off the leaderboard with no score, or played with training tools', () => {
    for (const game of [gameAt({ score: 0 }), gameAt({ settings: { training: true } })]) {
      game.lastRun = { score: 1 };
      endRun(game, false);
      expect(game.leaderboard).toEqual([]);
      expect(game.lastRun).toBeNull();
      expect(game.io.saveLeaderboard).not.toHaveBeenCalled();
      expect(game.io.saveRun).toHaveBeenCalledWith(null);
    }
  });
});
