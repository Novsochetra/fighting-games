import { describe, expect, it } from 'vitest';

import { ballAt } from '../../../../../../dev/camera-lab/src/naga-shot/tracks/ball.js';
import { keeperAt } from '../../../../../../dev/camera-lab/src/naga-shot/tracks/keeper.js';
import {
  BALL_REST,
  GOAL,
  GROUND,
  WORLD,
} from '../../../../../../dev/camera-lab/src/naga-shot/world.js';
import { everyClock, EVERY_CASE, lastOf } from '../every-clock.js';

const ballsOf = (settings) => everyClock(settings).map((clock) => ballAt(clock, settings.ending));

describe("the Naga Shot's ball", () => {
  it.each(EVERY_CASE)('stays in the world and on or over the grass (%s)', (_, settings) => {
    for (const ball of ballsOf(settings)) {
      expect(ball.x).toBeGreaterThan(0);
      expect(ball.x).toBeLessThan(WORLD.width);
      expect(ball.y).toBeLessThanOrEqual(GROUND - 5);
      expect(ball.y).toBeGreaterThan(0);
    }
  });

  it.each(EVERY_CASE)('never jumps from one frame to the next (%s)', (_, settings) => {
    const balls = ballsOf(settings);

    balls.slice(1).forEach((ball, i) => {
      expect(Math.hypot(ball.x - balls[i].x, ball.y - balls[i].y)).toBeLessThan(13);
    });
  });

  it("comes to rest at the spot, then lifts off the grass on the Naga's breath", () => {
    const settings = { camera: 'full', ending: 'goal' };
    const rested = ballAt(lastOf(settings, 'awakening'), 'goal');
    const lifted = ballAt(lastOf(settings, 'manifest'), 'goal');

    expect(rested).toMatchObject({ x: BALL_REST.x, y: BALL_REST.y });
    expect(lifted.y).toBeLessThan(BALL_REST.y - 4);
  });

  it('ends in the net on a goal, and out of the goal on a save or the bar', () => {
    const endOf = (ending) => ballAt(lastOf({ camera: 'full', ending }, 'aftermath'), ending);

    expect(endOf('goal').x).toBeGreaterThan(GOAL.line);
    expect(endOf('goal').x).toBeLessThan(GOAL.line + GOAL.depth);

    for (const ending of ['punch', 'parry', 'post']) {
      expect(endOf(ending).x).toBeLessThan(GOAL.line - 30);
      expect(endOf(ending).y).toBeGreaterThan(GROUND - 8);
    }
  });

  it('is held in the gloves from the save on a catch', () => {
    const settings = { camera: 'full', ending: 'catch' };
    const held = everyClock(settings).filter((clock) =>
      ['collision', 'aftermath'].includes(clock.stage),
    );

    for (const clock of held) {
      const hands = keeperAt(clock, 'catch').hands;

      expect(ballAt(clock, 'catch')).toMatchObject({ x: hands.x, y: hands.y });
    }
  });
});
