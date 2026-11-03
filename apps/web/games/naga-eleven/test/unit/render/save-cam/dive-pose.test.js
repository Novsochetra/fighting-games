import { describe, expect, it } from 'vitest';

import { DIVE_FRAMES } from '../../../../src/art/save-cam/keeper-dive/index.js';
import { DIVE_BEATS, restOf } from '../../../../src/render/save-cam/dive-frames.js';
import { divePose } from '../../../../src/render/save-cam/dive-pose.js';
import { KEEPER_SHARE, shotPoint } from '../../../../src/render/save-cam/flight.js';
import { camMoment } from '../../../../src/render/save-cam/moment.js';
import { contactTick } from '../../../../src/render/save-cam/timing.js';
import { DEPTH, project } from '../../../../src/render/save-cam/view.js';

const contact = contactTick();
const SPOT = project({ x: 0, y: 0, z: DEPTH.keeper });
const GROUND = Math.round(SPOT.y);

const AIMS = [
  { side: 0.9, height: 0.95 },
  { side: -0.8, height: 0.85 },
  { side: 0.6, height: 0.45 },
  { side: -0.5, height: 0.15 },
  { side: 0.7, height: 0 },
];

const momentOf = (result, aim, extra = {}) =>
  camMoment({ result, aim, dive: Math.sign(aim.side), ...extra });

// the lowest row the pose's frame paints, on the art grid
const lowestRow = (pose) => pose.y + restOf(pose.figure);

describe('the front-facing dive', () => {
  it('waits set in the middle of the goal, then flies the way he dives', () => {
    const left = momentOf('saved', { side: -0.7, height: 0.7 });

    expect(divePose(left, 5)).toMatchObject({ frame: 'set', x: Math.round(SPOT.x) });
    expect(divePose(left, contact)).toMatchObject({ frame: 'stretch', mirror: true });
    expect(divePose(left, contact).x).toBeLessThan(SPOT.x - 20);
    expect(divePose(momentOf('saved', { side: 0.7, height: 0.7 }), contact).x).toBeGreaterThan(
      SPOT.x + 20,
    );
  });

  it('takes the steep diagonal high, the shallow one at mid height and the flat dive low', () => {
    expect(divePose(momentOf('saved', AIMS[0]), contact).figure).toBe(DIVE_FRAMES.high.catch);
    expect(divePose(momentOf('saved', AIMS[2]), contact).figure).toBe(DIVE_FRAMES.mid.catch);
    expect(divePose(momentOf('saved', AIMS[3]), contact).figure).toBe(DIVE_FRAMES.low.catch);
  });

  it('is off the grass at full stretch for a high ball, and never sinks into it', () => {
    expect(lowestRow(divePose(momentOf('saved', AIMS[0]), contact))).toBeLessThan(GROUND - 15);

    for (const aim of AIMS) {
      for (let play = 0; play < 96; play += 1) {
        const pose = divePose(momentOf('goal', aim), play);

        expect(lowestRow(pose), `${JSON.stringify(aim)} ${play}`).toBeLessThanOrEqual(GROUND);
      }
    }
  });

  it('lands on his side on the grass, a little on from where he flew', () => {
    const moment = momentOf('saved', AIMS[0]);
    const landed = divePose(moment, contact + DIVE_BEATS.land + 20);

    expect(landed.frame).toBe('land');
    expect(lowestRow(landed)).toBe(GROUND);
    expect(landed.x).toBeGreaterThan(divePose(moment, contact).x);
  });

  it('holds the ball in his frame from the catch on, and never for a punch or a goal', () => {
    const caught = momentOf('saved', AIMS[2]);

    expect(divePose(caught, contact - 1).holdsBall).toBe(false);
    expect(divePose(caught, contact).holdsBall).toBe(true);
    expect(divePose(caught, contact + 40).holdsBall).toBe(true);

    for (const moment of [
      momentOf('parried', AIMS[0], { style: 'punch' }),
      momentOf('goal', AIMS[0]),
    ]) {
      for (let play = 0; play < 96; play += 4) {
        expect(divePose(moment, play).holdsBall).toBe(false);
      }
    }
  });

  it('goes the wrong way for a goal he guessed wrong, his gloves nowhere near it', () => {
    const aim = { side: 0.8, height: 0.6 };
    const wrong = camMoment({ result: 'goal', aim, dive: -1 });
    const ball = project(shotPoint(aim, KEEPER_SHARE));
    const pose = divePose(wrong, contact);

    expect(pose.mirror).toBe(true);
    expect(pose.gloves.x).toBeLessThan(SPOT.x);
    expect(ball.x - pose.gloves.x).toBeGreaterThan(60);
  });

  it('lays his shadow under him, as wide as the frame', () => {
    const pose = divePose(momentOf('saved', AIMS[0]), contact);

    expect(pose.shadow.radiusX).toBeGreaterThan(15);
    expect(Math.abs(pose.shadow.x - pose.x)).toBeLessThan(pose.shadow.radiusX);
  });
});
