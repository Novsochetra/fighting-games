import { describe, expect, it } from 'vitest';

import { DIVE_BEATS } from '../../../../src/render/save-cam/dive-frames.js';
import { ballAtPlay } from '../../../../src/render/save-cam/flight.js';
import { keeperPose } from '../../../../src/render/save-cam/keeper-pose.js';
import { camMoment } from '../../../../src/render/save-cam/moment.js';
import { netRestOf, rested } from '../../../../src/render/save-cam/net-rest.js';
import { contactTick } from '../../../../src/render/save-cam/timing.js';
import { DEPTH, GOAL_SIZE, project } from '../../../../src/render/save-cam/view.js';

const moment = (raw) => camMoment({ shooter: 4, keeper: 5, move: 'power-shot', ...raw }, 5);

const inNet = (cam, since = 12) => project(ballAtPlay(cam, contactTick() + since));

const landingOf = (cam) => keeperPose(cam, contactTick() + DIVE_BEATS.land);

describe('where the ball in the net comes to rest', () => {
  it('stays where it struck when he keeps it out, stands for it or went the other way', () => {
    const rests = [
      { result: 'saved', aim: { side: 0.4, height: 0.1 }, dive: 1 },
      { result: 'goal', aim: { side: 0.1, height: 0.2 }, dive: 0 },
      { result: 'goal', aim: { side: 0.6, height: 0.2 }, dive: -1 },
    ];

    for (const raw of rests) {
      expect(netRestOf(moment(raw)), raw.aim.side).toEqual({ roll: 0, floor: Infinity });
    }
  });

  it('rolls on past his gloves when it beat him low under his stretch', () => {
    const cam = moment({ result: 'goal', aim: { side: 0.4, height: 0.12 }, dive: 1 });
    const { roll } = netRestOf(cam);

    expect(roll).toBeGreaterThan(0);
    expect(inNet(cam).x + roll).toBeGreaterThan(landingOf(cam).gloves.x + 6);
  });

  it('is held over him when it came in over him, slipping down no further', () => {
    const cam = moment({ result: 'goal', aim: { side: 0.3, height: 0.8 }, dive: 1 });
    const { roll, floor } = netRestOf(cam);

    expect(roll).toBe(0);
    expect(floor).toBeGreaterThan(inNet(cam).y);
    expect(floor).toBeLessThan(inNet(cam, 60).y);
  });

  it('rolls away from him, never back behind him', () => {
    for (const dive of [-1, 1]) {
      for (const side of [-0.8, -0.5, -0.3, 0.3, 0.5, 0.8]) {
        const cam = moment({ result: 'goal', aim: { side, height: 0.2 }, dive });
        const away = Math.sign(inNet(cam).x - landingOf(cam).x);

        expect([0, away], `${dive} ${side}`).toContain(Math.sign(netRestOf(cam).roll));
      }
    }
  });

  it('never rolls out past the posts', () => {
    const inside = GOAL_SIZE.halfWidth * project({ x: 0, y: 0, z: DEPTH.net }).scale;

    for (const side of [-0.7, -0.5, -0.3, 0.3, 0.5, 0.7]) {
      for (const height of [0.1, 0.3, 0.5]) {
        const cam = moment({ result: 'goal', aim: { side, height }, dive: Math.sign(side) });
        const across = inNet(cam).x + netRestOf(cam).roll - 128;

        expect(Math.abs(across), `${side} ${height}`).toBeLessThan(inside);
      }
    }
  });
});

describe('the ball resting in the net', () => {
  const rest = { roll: 20, floor: 84 };

  it('rolls once it is in the net and eases to its rest', () => {
    const at = (since) => rested({ x: 100, y: 80 }, rest, contactTick() + since).x;

    expect(at(0)).toBe(100);
    expect(at(4)).toBe(100);
    expect(at(10)).toBeGreaterThan(100);
    expect(at(10)).toBeLessThan(120);
    expect(at(16)).toBe(120);
    expect(at(40)).toBe(120);
  });

  it('slips no lower than its floor once in the net, and flies in as it flies', () => {
    expect(rested({ x: 100, y: 96 }, rest, contactTick() + 30).y).toBe(84);
    expect(rested({ x: 100, y: 80 }, rest, contactTick() + 30).y).toBe(80);
    expect(rested({ x: 100, y: 120 }, rest, contactTick() - 10).y).toBe(120);
  });

  it('leaves a ball with nowhere to go where it is', () => {
    const point = { x: 100, y: 90 };

    expect(rested(point, { roll: 0, floor: Infinity }, contactTick() + 30)).toBe(point);
  });
});
