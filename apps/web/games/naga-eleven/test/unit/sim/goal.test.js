import { describe, expect, it } from 'vitest';
import { PHASE_TICKS } from '../../../src/data/tuning.js';
import { goalTick, scoreGoal } from '../../../src/sim/goal.js';
import { matchInPlay } from '../../support/match-driver.js';

function scoredBy(lastTouch, move = null) {
  const match = matchInPlay();

  Object.assign(match.ball, { lastTouch, move });
  match.events = [];
  scoreGoal(match, 0);

  return match;
}

describe('a goal', () => {
  it('counts for the side it went in for, by the last to touch it', () => {
    const match = scoredBy(9, 'naga-shot');

    expect(match.score).toEqual([1, 0]);
    expect(match).toMatchObject({ phase: 'goal', lastScorer: 0 });
    expect(match.events).toEqual([{ type: 'goal', team: 0, scorer: 9, move: 'naga-shot' }]);
  });

  it('is an own goal, with no scorer, off the other side', () => {
    expect(scoredBy(13).events[0]).toMatchObject({ team: 0, scorer: null });
  });

  it('is followed by the other side kicking off, or the whistle when the clock has run out', () => {
    const match = scoredBy(9);

    match.phaseTicks = PHASE_TICKS.goal;
    goalTick(match);
    expect(match).toMatchObject({ phase: 'kickoff', kickoffTeam: 1 });

    const late = scoredBy(9);

    Object.assign(late, { clock: 0, phaseTicks: PHASE_TICKS.goal });
    goalTick(late);
    expect(late.phase).toBe('halfTime');
  });
});
