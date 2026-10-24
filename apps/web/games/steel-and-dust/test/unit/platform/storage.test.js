import { describe, expect, it } from 'vitest';
import { loadSaved, persistencePorts } from '../../../src/platform/persistence.js';
import { readJson, writeJson } from '../../../src/platform/storage.js';
import { memoryStorage } from '../../support/memory-storage.js';

const brokenStorage = {
  getItem() {
    throw new Error('blocked');
  },
  setItem() {
    throw new Error('blocked');
  },
};

describe('storage', () => {
  it('falls back when storage is blocked or holds bad data', () => {
    expect(readJson(brokenStorage, 'key', { safe: true })).toEqual({ safe: true });
    expect(readJson(memoryStorage({ key: '{oops' }), 'key', 1)).toBe(1);
    expect(writeJson(brokenStorage, 'key', 1)).toBe(false);
  });

  it('loads old saved settings and records', () => {
    const storage = memoryStorage({
      sd_settings: '{"btn":2,"music":20}',
      sd_best: '17',
      sd_best_score: 'x',
    });
    const saved = loadSaved(storage, false);
    expect(saved.settings).toMatchObject({ buttonSize: 2, music: 20, sfx: 80 });
    expect(saved.records).toEqual({ bestCombo: 17, bestScore: 0 });
    expect(saved.hintsSeen).toEqual({});
    expect(saved.checkpoint).toBeNull();
    expect(saved.leaderboard).toEqual([]);
  });

  it('loads a broken saved run as none, and a broken board as empty', () => {
    const storage = memoryStorage({ sd_run: '{"mission":40}', sd_leaderboard: '{oops' });
    expect(loadSaved(storage, false)).toMatchObject({ checkpoint: null, leaderboard: [] });
    expect(loadSaved(brokenStorage, false)).toMatchObject({ checkpoint: null, leaderboard: [] });
  });

  it('loads a broken button layout as the original one', () => {
    const storage = memoryStorage({
      sd_settings: '{"buttonLayout":{"landscape":{"light":{"x":0.5}}},"music":20}',
    });
    expect(loadSaved(storage, true).settings).toMatchObject({ buttonLayout: null, music: 20 });
    expect(loadSaved(memoryStorage(), true).settings.buttonLayout).toBeNull();
  });

  it('saves through the ports', () => {
    const storage = memoryStorage();
    const ports = persistencePorts(storage);
    ports.saveRecords({ bestCombo: 3, bestScore: 900 });
    ports.saveHints({ move: 1 });
    expect(storage.data.get('sd_best_score')).toBe('900');
    expect(loadSaved(storage, false).records).toEqual({ bestCombo: 3, bestScore: 900 });
    expect(storage.data.get('sd_hints')).toBe('{"move":1}');
  });

  it('saves the run and the leaderboard through the ports, and lets an ended run go', () => {
    const storage = memoryStorage();
    const ports = persistencePorts(storage);
    const run = { mission: 4, score: 6200, playTime: 14400, continues: 1, lives: 3, ultMeter: 0 };
    const board = [
      { score: 6200, mission: 5, hero: 'blue', difficulty: 2, time: 14400, cleared: false, at: 1 },
    ];
    ports.saveRun(run);
    ports.saveLeaderboard(board);
    expect(loadSaved(storage, false)).toMatchObject({ checkpoint: run, leaderboard: board });
    ports.saveRun(null);
    expect(loadSaved(storage, false).checkpoint).toBeNull();
  });
});
