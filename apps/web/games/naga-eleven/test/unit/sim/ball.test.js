import { describe, expect, it } from 'vitest';
import { BALL } from '../../../src/data/tuning.js';
import { createBall, dribble, rollOut, speedOf, stepBall } from '../../../src/sim/ball.js';
import { createMatch } from '../../../src/sim/create-match.js';

const ballIn = (match, fields) => Object.assign(match.ball, createBall(match), fields);

function stepUntil(match, wanted, most = 300) {
  for (let i = 0; i < most; i += 1) {
    const crossing = stepBall(match);

    if (crossing !== null) {
      return crossing === wanted ? crossing : `${crossing} (wanted ${wanted})`;
    }
  }

  return null;
}

describe('the ball in flight', () => {
  it('falls, bounces lower each time and comes to rest on the grass', () => {
    const match = createMatch({ seed: 1 });
    const ball = ballIn(match, { z: 40 });
    let highest = 40;
    let bounces = 0;

    for (let i = 0; i < 400; i += 1) {
      const falling = ball.vz < 0;

      stepBall(match);

      if (falling && ball.vz > 0) {
        bounces += 1;
        expect((ball.vz * ball.vz) / (2 * BALL.gravity)).toBeLessThan(highest);
        highest = (ball.vz * ball.vz) / (2 * BALL.gravity);
      }
    }

    expect(bounces).toBeGreaterThan(1);
    expect(ball.z).toBe(0);
    expect(ball.vz).toBe(0);
  });

  it('slows as it rolls', () => {
    const match = createMatch({ seed: 1 });
    const ball = ballIn(match, { vx: 6 });

    stepBall(match);

    const early = speedOf(ball);

    for (let i = 0; i < 60; i += 1) {
      stepBall(match);
    }

    expect(speedOf(ball)).toBeLessThan(early);
    expect(speedOf(ball)).toBeGreaterThan(0);
  });

  it('starts on the centre spot of the format’s pitch', () => {
    const match = createMatch({ seed: 1, format: '7' });

    expect(createBall(match)).toMatchObject({ x: 600, y: 320, owner: null, lastTouch: null });
  });
});

describe('the ball at the lines', () => {
  it('goes out over a touchline', () => {
    const match = createMatch({ seed: 1 });

    ballIn(match, { y: match.pitch.width - 4, vy: 6 });

    expect(stepUntil(match, 'out')).toBe('out');
    expect(match.ball.y).toBeGreaterThan(match.pitch.width);
  });

  it('scores for the team attacking that end when it goes in under the bar', () => {
    const match = createMatch({ seed: 1 });
    const { length, width } = match.pitch;

    ballIn(match, { x: length - 20, y: width / 2, vx: 8, z: 10 });
    expect(stepUntil(match, 'goal')).toBe('goal');
    expect(match.ball.inGoal).toBe(0);

    ballIn(match, { x: 20, y: width / 2 + 20, vx: -8, inGoal: null });
    expect(stepUntil(match, 'goal')).toBe('goal');
    expect(match.ball.inGoal).toBe(1);
  });

  it('stays in the net once it is in', () => {
    const match = createMatch({ seed: 1 });
    const { length, width } = match.pitch;

    ballIn(match, { x: length - 10, y: width / 2, vx: 12 });
    stepUntil(match, 'goal');

    for (let i = 0; i < 200; i += 1) {
      expect(stepBall(match)).toBe(null);
    }

    expect(match.ball.x).toBeGreaterThanOrEqual(length);
    expect(match.ball.x).toBeLessThanOrEqual(length + match.goal.depth);
  });

  it('goes out over the goal line beside the posts and over the bar', () => {
    const match = createMatch({ seed: 1 });
    const { length, width } = match.pitch;

    ballIn(match, { x: length - 10, y: width / 2 + match.goal.width, vx: 8 });
    expect(stepUntil(match, 'out')).toBe('out');

    ballIn(match, { x: length - 30, y: width / 2, z: match.goal.height + 30, vx: 8, vz: 2 });
    expect(stepUntil(match, 'out')).toBe('out');
  });

  it('rolls on to the boards once out of play, never further', () => {
    const match = createMatch({ seed: 1 });
    const ball = ballIn(match, { x: 100, y: -10, vy: -20 });

    for (let i = 0; i < 100; i += 1) {
      rollOut(match);
    }

    expect(ball.y).toBe(-BALL.runoff);
  });
});

describe('the ball at a carrier’s feet', () => {
  it('runs a step ahead of where they face, at their pace, and is theirs last', () => {
    const match = createMatch({ seed: 1 });
    const { ball } = match;
    const player = { index: 4, x: 300, y: 200, vx: 2, vy: 0, facing: { x: 1, y: 0 } };

    for (let i = 0; i < 20; i += 1) {
      dribble(ball, player);
    }

    expect(ball.x).toBeCloseTo(300 + BALL.dribbleGap);
    expect(ball.y).toBeCloseTo(200);
    expect(ball.vx).toBe(2);
    expect(ball.lastTouch).toBe(4);
  });
});
