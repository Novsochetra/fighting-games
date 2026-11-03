import { describe, expect, it } from 'vitest';
import { statsAtLevel } from '../../../src/campaign/levels.js';
import { newSave } from '../../../src/campaign/save.js';
import {
  beforeScenes,
  finishMatch,
  finishScene,
  finishTraining,
  nextScenes,
  settleStage,
} from '../../../src/campaign/settle.js';
import { trainingXp } from '../../../src/campaign/xp.js';
import {
  FIXTURE_CHAPTERS,
  matchResult,
  stageAt,
  trainingResult,
} from '../../support/campaign-fixtures.js';

const saveAt = (chapter, stage, extra = {}) => ({ ...newSave(), chapter, stage, ...extra });

describe('finishing a scene stage', () => {
  it('moves on and shows nothing more', () => {
    const stage = stageAt(FIXTURE_CHAPTERS, 0, 0);

    expect(finishScene(saveAt(0, 0), stage)).toMatchObject({ chapter: 0, stage: 1 });
    expect(nextScenes(saveAt(0, 0), stage)).toEqual([]);
  });

  it('needs the stage stageOf gave, with where it stands', () => {
    expect(() => finishScene(newSave(), FIXTURE_CHAPTERS[0].stages[0])).toThrow(/stageOf/);
  });
});

describe('finishing a training stage', () => {
  const stage = stageAt(FIXTURE_CHAPTERS, 0, 1);
  const result = trainingResult('cone-dribble', 'S', 2000);

  it('pays its XP, trains its stats and moves on', () => {
    const save = finishTraining(saveAt(0, 1), stage, result);

    expect(save).toMatchObject({ chapter: 0, stage: 2 });
    expect(save.hero.xp).toBe(trainingXp(result, 1));
    expect(save.hero.stats.dribble).toBe(statsAtLevel(save.hero.level).dribble + 3);
  });

  it("shows the training's after scene", () => {
    expect(nextScenes(saveAt(0, 1), stage, result)).toEqual(['c1-2-after']);
  });

  it("takes the stage's drill when the result names none", () => {
    const save = finishTraining(saveAt(0, 1), stage, { grade: 'A', score: 0 });

    expect(save.hero.stats.speed).toBe(statsAtLevel(save.hero.level).speed + 2);
  });
});

describe('finishing a match stage', () => {
  const final = stageAt(FIXTURE_CHAPTERS, 0, 4);

  it("gives the stage's rewards once, on the win", () => {
    const lost = settleStage(saveAt(0, 4), final, matchResult(0, 1));
    const won = settleStage(lost.save, final, matchResult(1, 0));
    const again = settleStage(saveAt(0, 4, { flags: won.save.flags }), final, matchResult(1, 0));

    expect(lost.save.hero.moves).not.toContain('naga-shot');
    expect(won.save.hero.moves).toContain('naga-shot');
    expect(won.save.hero.xp - lost.save.hero.xp).toBeGreaterThan(again.save.hero.xp);
    expect(won.save.flags['reward:chapter-1/4']).toBe(true);
  });

  it('keeps the moves that woke in a match it lost', () => {
    const save = finishMatch(saveAt(0, 4), final, matchResult(1, 2, { unlocked: ['naga-shot'] }));

    expect(save.hero.moves).toContain('naga-shot');
    expect(save).toMatchObject({ stage: 4, attempts: 1 });
  });

  it('pays XP for a loss as well, less than for a win', () => {
    const lost = finishMatch(saveAt(0, 4), final, matchResult(0, 1));
    const won = finishMatch(
      saveAt(0, 4, { flags: { 'reward:chapter-1/4': true } }),
      final,
      matchResult(1, 0),
    );

    expect(lost.hero.xp).toBeGreaterThan(0);
    expect(won.hero.xp).toBeGreaterThan(lost.hero.xp);
  });

  it('remembers both teams as met, win or lose', () => {
    const save = finishMatch(saveAt(0, 4), final, matchResult(0, 1));

    expect(save.flags).toMatchObject({ 'met:village-school': true, 'met:city-stars': true });
  });

  it('tells the result as well as the save', () => {
    expect(settleStage(saveAt(0, 4), final, matchResult(0, 1))).toMatchObject({
      passed: false,
      outcome: 'lose',
      scenes: ['c1-5-lose'],
    });
  });
});

describe('the scenes before a stage', () => {
  it("are a scene stage's own scene", () => {
    expect(beforeScenes(newSave(), stageAt(FIXTURE_CHAPTERS, 0, 0))).toEqual(['c1-1-scene']);
  });

  it("are a match's before scene the first time only", () => {
    const final = stageAt(FIXTURE_CHAPTERS, 0, 4);

    expect(beforeScenes(saveAt(0, 4), final)).toEqual(['c1-5-before']);
    expect(beforeScenes(saveAt(0, 4, { attempts: 1 }), final)).toEqual([]);
  });
});
