import { describe, expect, it } from 'vitest';
import { createBall } from '../../../src/sim/ball.js';
import { createMatch } from '../../../src/sim/create-match.js';
import { bounceOffFrame } from '../../../src/sim/goal-frame.js';

function ballBy(match, fields) {
  return Object.assign(match.ball, createBall(match), fields);
}

describe('the goal frame', () => {
  it('sends a ball back off the post it runs into', () => {
    const match = createMatch({ seed: 1 });
    const post = { x: match.pitch.length, y: match.pitch.width / 2 - match.goal.width / 2 };
    const ball = ballBy(match, { x: post.x - 6, y: post.y, z: 10, vx: 8, vy: 0 });

    bounceOffFrame(match, ball);

    expect(ball.vx).toBeLessThan(0);
  });

  it('knocks a ball at the bar back out and down', () => {
    const match = createMatch({ seed: 1 });
    const ball = ballBy(match, {
      x: match.pitch.length - 2,
      y: match.pitch.width / 2,
      z: match.goal.height - 2,
      vx: 9,
      vz: 1,
    });

    bounceOffFrame(match, ball);

    expect(ball.vx).toBeLessThan(0);
    expect(ball.vz).toBeLessThan(0);
  });

  it('leaves a ball clear of the frame alone', () => {
    const match = createMatch({ seed: 1 });
    const ball = ballBy(match, { x: match.pitch.length - 40, y: match.pitch.width / 2, vx: 9 });

    bounceOffFrame(match, ball);

    expect(ball.vx).toBe(9);
  });
});
