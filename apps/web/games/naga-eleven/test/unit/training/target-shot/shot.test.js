import { describe, expect, it } from 'vitest';
import { DRILLS } from '../../../../src/data/training.js';
import { createDrill } from '../../../../src/training/index.js';
import { updateRun } from '../../../../src/training/target-shot/index.js';
import { dummyActive, roundOf } from '../../../../src/training/target-shot/motion.js';
import {
  flightTicksOf,
  judgeShot,
  powerOf,
  riseOf,
} from '../../../../src/training/target-shot/shot.js';
import { pickTarget, TARGETS } from '../../../../src/training/target-shot/targets.js';
import { createRandom } from '../../../../src/sim/random.js';

const TUNING = DRILLS['target-shot'].tuning;
const NOTHING = { held: {}, pressed: {} };

function inPlay(level = 1) {
  const state = createDrill('target-shot', { seed: 4, level });

  state.phase = 'play';

  return state;
}

// a ball that has just reached the goal's mouth at a point, struck at a power
function arrive(state, { point, power = 0.75 }) {
  state.run.ball = { fromX: 0, to: point, power, ticks: 0, total: 1 };
  judgeShot(state, TUNING);

  return state.run.results.at(-1);
}

describe('striking the ball', () => {
  it('goes where it is aimed when struck in the sweet band', () => {
    expect(riseOf(0.7, TUNING)).toBe(0);
    expect(riseOf(TUNING.sweetLow, TUNING)).toBe(0);
    expect(riseOf(TUNING.sweetHigh, TUNING)).toBe(0);
  });

  it('dips under the aim struck soft, and climbs over it struck hard', () => {
    expect(riseOf(0.3, TUNING)).toBeLessThan(0);
    expect(riseOf(1, TUNING)).toBeGreaterThan(0);
  });

  it('flies faster the harder it is struck', () => {
    expect(flightTicksOf(1, TUNING)).toBe(TUNING.fastFlight);
    expect(flightTicksOf(0, TUNING)).toBe(TUNING.slowFlight);
    expect(powerOf(TUNING.chargeTicks * 2, TUNING)).toBe(1);
  });

  it('charges while SHOOT is held and is struck when it is let go', () => {
    const state = inPlay();

    for (let i = 0; i < 20; i += 1) {
      updateRun(state, { held: { shoot: true }, pressed: {} });
    }

    expect(state.run.charge).toBe(20);

    updateRun(state, NOTHING);

    expect(state.run.stage).toBe('flight');
    expect(state.run.ball.power).toBeCloseTo(20 / TUNING.chargeTicks);
  });

  it('moves the aim with the arrows', () => {
    const state = inPlay();
    const from = { ...state.run.aim };

    updateRun(state, { held: { left: true, up: true }, pressed: {} });

    expect(state.run.aim.x).toBe(from.x - TUNING.aimSpeed);
    expect(state.run.aim.y).toBe(from.y + TUNING.aimSpeed);
  });
});

describe('what the ball meets', () => {
  it('scores a lit target, and more in the last moment of its light', () => {
    const state = inPlay();
    const spot = TARGETS[state.run.target.index];

    expect(arrive(state, { point: spot })).toBe('hit');
    expect(state.score).toBe(TUNING.hitPoints);

    state.run.target = { index: 0, left: 10, total: 170 };

    expect(arrive(state, { point: TARGETS[0] })).toBe('lateHit');
    expect(state.score).toBe(TUNING.hitPoints + TUNING.latePoints + TUNING.comboPoints);
  });

  it('counts a ball in the net past the targets as a little, and breaks the combo', () => {
    const state = inPlay();

    state.combo = 3;

    expect(arrive(state, { point: { x: 0, y: 80 } })).toBe('net');
    expect(state.score).toBe(TUNING.netPoints);
    expect(state.combo).toBe(0);
  });

  it('misses over the bar, wide of the post and struck too soft', () => {
    const state = inPlay();

    expect(arrive(state, { point: { x: 0, y: 200 } })).toBe('over');
    expect(arrive(state, { point: { x: 300, y: 50 } })).toBe('wide');
    expect(arrive(state, { point: { x: 0, y: 50 }, power: 0.05 })).toBe('short');
    expect(state.score).toBe(0);
  });

  it('is stopped by the keeper dummy from its round on, but not over its head', () => {
    const state = inPlay();

    state.run.shot = (TUNING.dummyFromRound - 1) * TUNING.shotsPerRound;
    state.run.dummy.x = TARGETS[2].x;
    state.run.target = { index: 2, left: 100, total: 170 };

    expect(dummyActive(state, TUNING)).toBe(true);
    expect(arrive(state, { point: TARGETS[2] })).toBe('saved');

    state.run.target = { index: 0, left: 100, total: 170 };
    state.run.dummy.x = TARGETS[0].x;

    expect(arrive(state, { point: TARGETS[0] })).toBe('hit');
  });

  it('brings the dummy on sooner at a higher level', () => {
    const state = inPlay(2);

    state.run.shot = TUNING.shotsPerRound;

    expect(roundOf(state.run, TUNING)).toBe(2);
    expect(dummyActive(state, TUNING)).toBe(true);
    expect(dummyActive({ ...state, level: 1 }, TUNING)).toBe(false);
  });

  it('loses the shot when the light goes out before it is struck', () => {
    const state = inPlay();

    for (let i = 0; i < state.run.target.total; i += 1) {
      updateRun(state, NOTHING);
    }

    expect(state.run.results).toEqual(['late']);
    expect(state.run.stage).toBe('after');
  });
});

describe('the targets', () => {
  it('never light the same corner twice running', () => {
    const random = createRandom(1);

    for (let last = 0; last < TARGETS.length; last += 1) {
      for (let i = 0; i < 20; i += 1) {
        expect(pickTarget(random, last)).not.toBe(last);
      }
    }
  });

  it('light for less time at a higher level', () => {
    expect(inPlay(3).run.target.total).toBeLessThan(inPlay(1).run.target.total);
  });
});
