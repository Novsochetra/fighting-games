import { describe, expect, it } from 'vitest';
import { heroAtLevel, statsAtLevel, xpForLevel } from '../../../src/campaign/levels.js';
import { newSave } from '../../../src/campaign/save.js';
import { DEFAULT_SEED, SAVE_VERSION } from '../../../src/campaign/save-format.js';
import { repairSave } from '../../../src/campaign/save-repair.js';

const groupRecord = {
  kind: 'group',
  teams: ['a', 'b'],
  results: [{ home: 'a', away: 'b', homeGoals: 1, awayGoals: 0 }],
  replays: 0,
};

describe('repairing a stored save', () => {
  it('leaves a sound save as it is', () => {
    const save = { ...newSave(), chapter: 1, stage: 4, cups: { cup: groupRecord } };

    expect(repairSave(save)).toEqual(save);
  });

  it('turns down what is not a save', () => {
    expect(repairSave(null)).toBeNull();
    expect(repairSave([])).toBeNull();
    expect(repairSave('save')).toBeNull();
  });

  it('migrates a save from before versions, keeping its progress', () => {
    const old = { chapter: 1, stage: 2, hero: { xp: xpForLevel(9) } };
    const save = repairSave(old);

    expect(save).toMatchObject({ version: SAVE_VERSION, chapter: 1, stage: 2 });
    expect(save.hero).toMatchObject({ level: 9, stats: statsAtLevel(9) });
  });

  it('keeps a newer save it cannot fully read, and the fields it does not know', () => {
    const newer = { ...newSave(), version: SAVE_VERSION + 1, chapter: 3, pets: ['buffalo'] };

    expect(repairSave(newer)).toEqual(newer);
  });

  it('fills what is missing or broken with the defaults', () => {
    const save = repairSave({ version: 1, chapter: -2, stage: 1.5, seed: 'x', attempts: -1 });

    expect(save).toEqual({ ...newSave(), version: 1, seed: DEFAULT_SEED });
  });

  it('takes the level from the XP and mends broken stats, gauge and moves', () => {
    const hero = {
      level: 44,
      xp: xpForLevel(6),
      stats: { ...statsAtLevel(6), shot: 'great', pass: 400 },
      moves: ['naga-shot', 3],
      spiritMax: -5,
    };
    const repaired = repairSave({ ...newSave(), hero }).hero;

    expect(repaired.level).toBe(6);
    expect(repaired.stats).toEqual({ ...statsAtLevel(6), pass: 99 });
    expect(repaired.moves).toEqual(['power-shot', 'naga-shot']);
    expect(repaired.spiritMax).toBe(heroAtLevel(6).spiritMax);
  });

  it('drops broken cup records and broken results', () => {
    const cups = {
      kept: { ...groupRecord, results: [...groupRecord.results, { home: 'a', homeGoals: -1 }] },
      dropped: { teams: 'a,b' },
      gone: 7,
    };

    expect(repairSave({ ...newSave(), cups }).cups).toEqual({ kept: groupRecord });
  });
});
