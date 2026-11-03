import { describe, expect, it } from 'vitest';
import { heroAtLevel, xpForLevel } from '../../../src/campaign/levels.js';
import { progressSummary } from '../../../src/campaign/progress-summary.js';
import { newSave } from '../../../src/campaign/save.js';
import { MAX_LEVEL } from '../../../src/data/progression.js';
import { FIXTURE_CHAPTERS } from '../../support/campaign-fixtures.js';

describe('the progress summary', () => {
  it('lists the chapters, the done ones and the current one', () => {
    const summary = progressSummary({ ...newSave(), chapter: 1, stage: 3 }, FIXTURE_CHAPTERS);

    expect(summary.chapters).toEqual([
      { id: 'chapter-1', number: 1, title: FIXTURE_CHAPTERS[0].title, done: true, current: false },
      { id: 'chapter-2', number: 2, title: FIXTURE_CHAPTERS[1].title, done: false, current: true },
      { id: 'chapter-3', number: 3, title: FIXTURE_CHAPTERS[2].title, done: false, current: false },
    ]);
    expect(summary).toMatchObject({ stage: 3, finished: false });
  });

  it('tells the level, the XP and what is left to the next level', () => {
    const hero = { ...heroAtLevel(4), xp: xpForLevel(4) + 10 };
    const summary = progressSummary({ ...newSave(), hero }, FIXTURE_CHAPTERS);

    expect(summary).toMatchObject({ level: 4, xp: hero.xp, xpToNext: xpForLevel(5) - hero.xp });
    expect(summary.levelShare).toBeCloseTo(10 / (xpForLevel(5) - xpForLevel(4)));
  });

  it('shows the campaign finished, every chapter done', () => {
    const summary = progressSummary({ ...newSave(), chapter: 3 }, FIXTURE_CHAPTERS);

    expect(summary.finished).toBe(true);
    expect(summary.stage).toBeNull();
    expect(summary.chapters.every((chapter) => chapter.done && !chapter.current)).toBe(true);
  });

  it('has nothing left to the next level at the top level', () => {
    const summary = progressSummary(
      { ...newSave(), hero: heroAtLevel(MAX_LEVEL) },
      FIXTURE_CHAPTERS,
    );

    expect(summary).toMatchObject({ level: MAX_LEVEL, xpToNext: 0, levelShare: 1 });
  });
});
