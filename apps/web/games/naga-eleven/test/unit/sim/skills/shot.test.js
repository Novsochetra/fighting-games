import { describe, expect, it } from 'vitest';
import { SKILL_PLAY } from '../../../../src/data/skills.js';
import { speedOf } from '../../../../src/sim/ball.js';
import { skillShot } from '../../../../src/sim/skills/shot.js';
import { shotSpeedOf } from '../../../../src/sim/stats.js';
import { holdBallAt, matchInPlay } from '../../../support/match-driver.js';

function forwardOnTheBall(spirit) {
  const match = matchInPlay();
  const forward = holdBallAt(match, { x: 1500, y: 540 }, match.players[9]);

  forward.spirit = spirit;
  match.events.length = 0;

  return { match, forward };
}

describe('a role shot skill in the open', () => {
  it('flies faster than any full charge, with its look on the ball, and tells the match', () => {
    const { match, forward } = forwardOnTheBall(80);

    skillShot(match, forward, { move: 'kouprey-kick', aimY: 540 });

    expect(speedOf(match.ball)).toBeGreaterThan(shotSpeedOf(forward, 1) * 1.05);
    expect(speedOf(match.ball)).toBeLessThanOrEqual(
      shotSpeedOf(forward, 1) * SKILL_PLAY.shot.speed,
    );
    expect(match.ball.move).toBe('kouprey-kick');
    expect(match.events.map((event) => event.type)).toEqual(['skill', 'shot']);
    expect(forward.spirit).toBe(45);
  });

  it('is the shot it was charged as without the spirit for it', () => {
    const { match, forward } = forwardOnTheBall(5);

    skillShot(match, forward, { move: 'kouprey-kick', aimY: 540, power: 1 });

    expect(match.ball.move).toBeNull();
    expect(match.events.map((event) => event.type)).toEqual(['shot']);
    expect(forward.spirit).toBe(5);
  });
});
