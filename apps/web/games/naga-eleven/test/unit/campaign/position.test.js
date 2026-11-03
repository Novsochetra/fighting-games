import { describe, expect, it } from 'vitest';
import { heroAtLevel } from '../../../src/campaign/levels.js';
import { goBackTo, moveOn, resolvePosition, stayOn } from '../../../src/campaign/position.js';
import { newSave } from '../../../src/campaign/save.js';
import { CHAPTER_MIN_LEVEL } from '../../../src/data/progression.js';
import { FIXTURE_CHAPTERS, stageAt } from '../../support/campaign-fixtures.js';

describe('where the save stands', () => {
  it('is its chapter and stage', () => {
    expect(resolvePosition({ chapter: 1, stage: 2 }, FIXTURE_CHAPTERS)).toEqual({
      chapter: 1,
      stage: 2,
    });
  });

  it('goes on to the next chapter when the stage is past the end of its own', () => {
    expect(resolvePosition({ chapter: 0, stage: 40 }, FIXTURE_CHAPTERS)).toEqual({
      chapter: 1,
      stage: 0,
    });
  });

  it('is nowhere once the last chapter is done', () => {
    expect(resolvePosition({ chapter: 3, stage: 0 }, FIXTURE_CHAPTERS)).toBeNull();
    expect(resolvePosition({ chapter: 2, stage: 8 }, FIXTURE_CHAPTERS)).toBeNull();
  });
});

describe('moving through the stages', () => {
  it('moves on to the next stage and clears the attempts', () => {
    const save = { ...newSave(), attempts: 2 };

    expect(moveOn(save, stageAt(FIXTURE_CHAPTERS, 0, 3).at)).toMatchObject({
      chapter: 0,
      stage: 4,
      attempts: 0,
    });
  });

  it('starts the next chapter after the last stage, lifting the hero to its floor', () => {
    const save = newSave();
    const next = moveOn(save, stageAt(FIXTURE_CHAPTERS, 0, 5).at);

    expect(next).toMatchObject({ chapter: 1, stage: 0 });
    expect(next.hero.level).toBe(CHAPTER_MIN_LEVEL[2]);
  });

  it('keeps a hero above the floor as he is', () => {
    const save = { ...newSave(), hero: heroAtLevel(15) };

    expect(moveOn(save, stageAt(FIXTURE_CHAPTERS, 0, 5).at).hero).toBe(save.hero);
  });

  it('stays on the stage, counting the attempt', () => {
    expect(stayOn({ ...newSave(), attempts: 1 }, stageAt(FIXTURE_CHAPTERS, 0, 4).at)).toMatchObject(
      {
        chapter: 0,
        stage: 4,
        attempts: 2,
      },
    );
  });

  it('goes back to an earlier stage as one played before', () => {
    expect(goBackTo(newSave(), stageAt(FIXTURE_CHAPTERS, 2, 4).at, 1)).toMatchObject({
      chapter: 2,
      stage: 1,
      attempts: 1,
    });
  });
});
