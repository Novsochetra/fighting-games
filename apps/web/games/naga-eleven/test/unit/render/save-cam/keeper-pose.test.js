import { describe, expect, it } from 'vitest';

import { KEEPER_SHARE, shotPoint } from '../../../../src/render/save-cam/flight.js';
import { keeperPose } from '../../../../src/render/save-cam/keeper-pose.js';
import { camMoment } from '../../../../src/render/save-cam/moment.js';
import { contactTick } from '../../../../src/render/save-cam/timing.js';
import { project } from '../../../../src/render/save-cam/view.js';

const contact = contactTick();

describe("the keeper's pose in the save cam", () => {
  it('waits set facing the camera until the shot is nearly on him, then dives its way', () => {
    const moment = camMoment({ result: 'saved', aim: { side: -0.6, height: 0.4 }, dive: -1 });
    const centre = keeperPose(moment, 12).x;

    expect(keeperPose(moment, 12)).toMatchObject({ animation: 'front-dive', frame: 'set' });
    expect(keeperPose(moment, contact)).toMatchObject({ frame: 'stretch', mirror: true });
    expect(keeperPose(moment, contact).x).toBeLessThan(centre);
    expect(keeperPose(moment, contact + 60)).toMatchObject({ frame: 'land' });
  });

  it('meets the ball with his gloves on a save, high or low, either side', () => {
    for (const aim of [
      { side: 0.6, height: 0.8 },
      { side: -0.5, height: 0.15 },
      { side: 0.45, height: 0.45 },
      { side: -0.9, height: 0.95 },
      { side: 0.75, height: 0 },
    ]) {
      for (const style of ['catch', 'punch']) {
        const moment = camMoment({ result: 'saved', style, aim, dive: Math.sign(aim.side) });
        const ball = project(shotPoint(aim, KEEPER_SHARE));
        const { gloves } = keeperPose(moment, contact);
        const name = `${style} ${JSON.stringify(aim)}`;

        expect(Math.abs(gloves.x - ball.x), name).toBeLessThan(6);
        expect(Math.abs(gloves.y - ball.y), name).toBeLessThan(6);
      }
    }
  });

  it('falls short of a goal toward a post', () => {
    const aim = { side: 0.9, height: 0.5 };
    const moment = camMoment({ result: 'goal', aim, dive: 1 });
    const ball = project(shotPoint(aim, KEEPER_SHARE));

    expect(keeperPose(moment, contact).gloves.x).toBeLessThan(ball.x - 6);
  });

  it('stands big with his arms up for a wall, and goes down beaten through the middle', () => {
    const wall = camMoment({
      result: 'saved',
      style: 'wall',
      aim: { side: 0, height: 0.4 },
      dive: 0,
    });
    const beaten = camMoment({ result: 'goal', aim: { side: 0.1, height: 0.9 }, dive: 0 });

    expect(keeperPose(wall, contact - 10).animation).toBe('celebrate');
    expect(keeperPose(beaten, contact - 1).animation).toBe('idle');
    expect(keeperPose(beaten, contact + 20).animation).toBe('fall');
  });
});
