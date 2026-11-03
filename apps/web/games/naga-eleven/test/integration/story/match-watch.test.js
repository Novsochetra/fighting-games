import { describe, expect, it } from 'vitest';
import { checkTriggers, createWatch } from '../../../src/story/index.js';
import { FINAL_TRIGGERS, duel, fakeMatch, goal, whistle } from '../../support/story-fixtures.js';

// the National Primary Schools Cup final as the story tells it: Rithy runs the first half, Royal
// Kids lead, and late on the Naga Shot wakes and turns it round
const FINAL = [
  { minute: 0, phase: 'kickoff', events: [whistle('kickoff')] },
  { minute: 1, phase: 'play' },
  { minute: 6, phase: 'duel', events: [duel(6, 12)] },
  { minute: 8, phase: 'duel', events: [duel(13, 6)] },
  { minute: 12, phase: 'goal', score: [0, 1], events: [goal(1, 13)] },
  { minute: 17, phase: 'goal', score: [0, 2], events: [goal(1, 13, 'power-shot')] },
  { minute: 20, phase: 'halfTime', score: [0, 2], events: [whistle('halfTime')] },
  { minute: 20, phase: 'kickoff', half: 2, score: [0, 2], events: [whistle('kickoff', 2)] },
  { minute: 29, phase: 'play', half: 2, score: [0, 2] },
  { minute: 30, phase: 'play', half: 2, score: [0, 2] },
  { minute: 31, phase: 'play', half: 2, score: [0, 2] },
  { minute: 33, phase: 'goal', half: 2, score: [1, 2], events: [goal(0, 6, 'naga-shot')] },
  { minute: 37, phase: 'goal', half: 2, score: [2, 2], events: [goal(0, 6, 'naga-shot')] },
  { minute: 39, phase: 'goal', half: 2, score: [3, 2], events: [goal(0, 3)] },
  { minute: 40, phase: 'over', half: 2, score: [3, 2], events: [whistle('fullTime', 2)] },
];

function watchThrough(moments) {
  const watch = createWatch(FINAL_TRIGGERS);

  return moments.flatMap(({ events = [], ...fields }) =>
    checkTriggers(watch, fakeMatch(fields), events).map((fired) => ({
      minute: fields.minute,
      ...fired,
    })),
  );
}

describe('watching a match for story moments', () => {
  it('tells the final’s story at the moments it was written for, each once', () => {
    expect(watchThrough(FINAL).map(({ minute, scene }) => [minute, scene])).toEqual([
      [0, 'ch1-final-kickoff'],
      [8, 'ch1-final-rithy'],
      [12, 'ch1-final-behind'],
      [20, 'ch1-final-half'],
      [20, 'ch1-final-second'],
      [30, 'ch1-final-naga'],
      [33, 'ch1-final-naga-goal'],
      [33, 'ch1-final-sochetra-scores'],
    ]);
  });

  it('wakes the Naga Shot and fills the gauge when the hero is behind late', () => {
    const naga = watchThrough(FINAL).find((fired) => fired.unlock);

    expect(naga).toMatchObject({ unlock: 'naga-shot', boost: 'spirit', minute: 30 });
  });

  it('keeps the Naga asleep in a final the hero leads', () => {
    const leading = FINAL.map((moment) => ({ ...moment, score: [1, 0] }));

    expect(watchThrough(leading).some((fired) => fired.unlock)).toBe(false);
  });
});
