import { describe, expect, it } from 'vitest';
import { newSave } from '../../../src/campaign/save.js';
import { settleStage } from '../../../src/campaign/settle.js';
import { FIXTURE_CHAPTERS, matchResult, stageAt } from '../../support/campaign-fixtures.js';

const saveAt = (chapter, stage, extra = {}) => ({ ...newSave(), chapter, stage, ...extra });

describe('a friendly', () => {
  const friendly = stageAt(FIXTURE_CHAPTERS, 0, 2);
  const play = (result) => settleStage(saveAt(0, 2), friendly, result);

  it('goes on whatever the score, showing the scene of the result', () => {
    for (const [result, scene] of [
      [matchResult(3, 0), 'c1-3-win'],
      [matchResult(1, 1), 'c1-3-draw'],
      [matchResult(0, 4), 'c1-3-lose'],
    ]) {
      expect(play(result)).toMatchObject({ passed: true, scenes: [scene] });
      expect(play(result).save).toMatchObject({ chapter: 0, stage: 3, attempts: 0 });
    }
  });
});

describe('a knockout match', () => {
  const semi = stageAt(FIXTURE_CHAPTERS, 0, 3);
  const play = (result, extra) => settleStage(saveAt(0, 3, extra), semi, result);

  it('goes on after a win', () => {
    expect(play(matchResult(2, 1))).toMatchObject({ passed: true, scenes: ['c1-4-win'] });
    expect(play(matchResult(2, 1)).save.stage).toBe(4);
  });

  it('stays on the same stage after a loss, its lose scene first', () => {
    const lost = play(matchResult(0, 1));

    expect(lost).toMatchObject({ passed: false, scenes: ['c1-4-lose'] });
    expect(lost.save).toMatchObject({ chapter: 0, stage: 3, attempts: 1 });
  });

  it('counts each attempt it stays', () => {
    expect(play(matchResult(0, 1), { attempts: 2 }).save.attempts).toBe(3);
  });

  it('decides a draw by the penalties', () => {
    const won = play(matchResult(1, 1, { penalties: { goalsFor: 5, goalsAgainst: 4 } }));
    const lost = play(matchResult(1, 1, { penalties: false }));

    expect(won).toMatchObject({ passed: true, scenes: ['c1-4-win'] });
    expect(won.save.stage).toBe(4);
    expect(lost).toMatchObject({ passed: false, scenes: ['c1-4-lose'] });
    expect(lost.save.stage).toBe(3);
  });

  it('plays a draw with no shoot-out again', () => {
    expect(play(matchResult(2, 2)).passed).toBe(false);
  });
});
