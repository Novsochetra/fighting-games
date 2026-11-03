import { describe, expect, it } from 'vitest';
import { createCamera } from '../../../../src/render/camera.js';
import { clampAlong } from '../../../../src/render/camera/bounds.js';
import {
  brakeForAim,
  brakeForRail,
  railOf,
  stoppingPace,
} from '../../../../src/render/camera/brakes.js';
import { matchOf } from './fixture.js';

const RAIL = { low: 0, high: 100 };

// the paces a camera goes at, from `pace` at `from`, braking for the rail's high end every tick
function brakedRun({ from, pace, most, hardest = most }) {
  const paces = [];
  let at = from;
  let speed = pace;

  for (let i = 0; i < 200 && at < RAIL.high; i += 1) {
    speed = brakeForRail(speed, { from: at, pace: speed, rail: RAIL, most, hardest });
    at += speed;
    paces.push(speed);

    if (speed <= 0) {
      break;
    }
  }

  return { paces, at };
}

describe('stoppingPace', () => {
  it('is no more than the way left, and nothing when there is none', () => {
    expect(stoppingPace(0, 0.25)).toBe(0);
    expect(stoppingPace(0.1, 0.25)).toBeCloseTo(0.1);
  });

  it('adds up to the way left exactly when it sheds `most` a tick', () => {
    for (const distance of [3, 17.5, 40, 333]) {
      let left = distance;
      let pace = stoppingPace(left, 0.25);

      while (pace > 1e-9) {
        left -= pace;
        pace = Math.max(0, pace - 0.25);
      }

      expect(left).toBeCloseTo(0, 6);
    }
  });

  it('never asks a camera on it to shed more than `most` the tick after', () => {
    for (let distance = 0.5; distance < 300; distance += 7.3) {
      const pace = stoppingPace(distance, 0.25);
      const next = stoppingPace(distance - pace, 0.25);

      expect(pace - next).toBeLessThanOrEqual(0.25 + 1e-9);
    }
  });
});

describe('brakeForAim', () => {
  it('slows a step toward the aim to what can stop by it, and leaves a step away alone', () => {
    expect(brakeForAim(9, { gap: 10, most: 0.25 })).toBeCloseTo(stoppingPace(10, 0.25));
    expect(brakeForAim(1, { gap: 10, most: 0.25 })).toBe(1);
    expect(brakeForAim(-3, { gap: 10, most: 0.25 })).toBe(-3);
  });
});

describe('brakeForRail', () => {
  it('lets the camera go no faster than it can stop from by either end', () => {
    const limits = { rail: RAIL, most: 0.25, hardest: 0.8 };

    expect(brakeForRail(9, { from: 90, pace: 0, ...limits })).toBeCloseTo(stoppingPace(10, 0.25));
    expect(brakeForRail(-9, { from: 10, pace: 0, ...limits })).toBeCloseTo(-stoppingPace(10, 0.25));
    expect(brakeForRail(2, { from: 50, pace: 2, ...limits })).toBe(2);
  });

  it('eases a camera into the end, shedding no more than `most` a tick, and stops it there', () => {
    const { paces, at } = brakedRun({ from: 0, pace: stoppingPace(100, 0.25), most: 0.25 });

    paces.slice(1).forEach((pace, i) => expect(paces[i] - pace).toBeLessThanOrEqual(0.25 + 1e-9));
    expect(at).toBeCloseTo(RAIL.high, 6);
  });

  it('sheds the pace of one coming in too fast evenly, never speeding it up nor past the end', () => {
    const { paces, at } = brakedRun({ from: 40, pace: 9, most: 0.25, hardest: 0.8 });
    const sheds = paces.slice(1).map((pace, i) => paces[i] - pace);

    expect(paces[0]).toBeLessThan(9);
    expect(Math.max(...sheds)).toBeLessThanOrEqual(0.8 + 1e-9);
    expect(Math.max(...sheds) - Math.min(...sheds.slice(0, -2))).toBeLessThan(0.2);
    expect(at).toBeLessThanOrEqual(RAIL.high + 1e-9);
  });
});

describe('railOf', () => {
  it('runs along between where the camera stops at each end, and in depth between its bounds', () => {
    const camera = createCamera(matchOf('11'));
    const rail = railOf(camera);

    expect(rail.along.low).toBe(clampAlong(camera.bounds, camera.lens, { x: -5000 }));
    expect(rail.along.high).toBe(clampAlong(camera.bounds, camera.lens, { x: 5000 }));
    expect(rail.depth).toEqual({ low: camera.bounds.minY, high: camera.bounds.maxY });
  });
});
