import { describe, expect, it } from 'vitest';
import { crowdFrame, moodOf } from '../../../../src/render/venues/crowd/mood.js';

const matchOf = () => ({
  tick: 0,
  score: [0, 0],
  pitch: { length: 1800, width: 1080 },
  ball: { x: 900, y: 540 },
});

describe('the mood of the crowd', () => {
  it('sits and bobs while nothing happens, then stands up cheering after a goal', () => {
    const match = matchOf();
    const calm = moodOf(match, 10);

    match.score = [1, 0];

    const cheering = moodOf(match, 11);

    expect(calm.cheer).toBe(false);
    expect([0, 1]).toContain(crowdFrame(calm));
    expect(cheering).toMatchObject({ cheer: true, goalTeam: 0, sinceGoal: 0 });
    expect([2, 3]).toContain(crowdFrame(cheering));
  });

  it('cheers for a while, stays restless a while longer, then settles', () => {
    const match = matchOf();

    moodOf(match, 0);
    match.score = [0, 1];
    moodOf(match, 1);

    expect(moodOf(match, 300).cheer).toBe(true);
    expect(moodOf(match, 500)).toMatchObject({ cheer: false, excited: true });
    expect(moodOf(match, 1000)).toMatchObject({ cheer: false, excited: false });
  });

  it('is restless when the ball is near a goal, and the same for the same ticks', () => {
    const match = matchOf();

    match.ball.x = 60;

    expect(moodOf(match, 4).excited).toBe(true);
    expect(crowdFrame(moodOf(match, 40))).toBe(crowdFrame(moodOf(matchOf(), 40)));
  });
});
