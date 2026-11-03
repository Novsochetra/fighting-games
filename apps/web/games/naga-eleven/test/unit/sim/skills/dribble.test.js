import { describe, expect, it } from 'vitest';
import { SKILL_PLAY } from '../../../../src/data/skills.js';
import {
  burstPaceOf,
  followBurst,
  isBursting,
  startBurst,
} from '../../../../src/sim/skills/dribble.js';
import { holdBallAt, matchInPlay } from '../../../support/match-driver.js';

function starOnTheBall() {
  const match = matchInPlay();
  const star = holdBallAt(match, { x: 900, y: 540 }, match.players[9]);

  Object.assign(star, { star: 'sochetra', moves: ['hanuman-leap'], skill: null, spirit: 80 });
  Object.assign(match.players[13], { x: 960, y: 545 });

  return { match, star };
}

describe('a dribble skill', () => {
  it('is a burst of pace while he has the ball, paid and waited out', () => {
    const { match, star } = starOnTheBall();

    startBurst(match, star, { move: 'hanuman-leap' });

    expect(isBursting(star)).toBe(true);
    expect(star.burst).toBe(SKILL_PLAY.dribble.ticks);
    expect(burstPaceOf(star, true)).toBe(SKILL_PLAY.dribble.speed);
    expect(burstPaceOf(star, false)).toBe(1);
    expect(star.spirit).toBe(50);
    expect(star.beating).toContain(13);
  });

  it('beats each man he gets past, filling his gauge', () => {
    const { match, star } = starOnTheBall();

    startBurst(match, star, { move: 'hanuman-leap' });

    const before = star.spirit;

    star.x = 1000;
    followBurst(match, star);

    expect(star.spirit).toBeGreaterThan(before);
    expect(star.beating).not.toContain(13);
  });

  it('does nothing without the spirit for it', () => {
    const { match, star } = starOnTheBall();

    star.spirit = 5;
    startBurst(match, star, { move: 'hanuman-leap' });

    expect(isBursting(star)).toBe(false);
  });
});
