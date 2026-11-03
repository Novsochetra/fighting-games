import { describe, expect, it } from 'vitest';
import { DRILLS } from '../../../../src/data/training.js';
import { isRunOver, runTime, updateRun } from '../../../../src/training/cone-dribble/index.js';
import { moveRunner } from '../../../../src/training/cone-dribble/runner.js';
import { createDrill } from '../../../../src/training/index.js';

const TUNING = DRILLS['cone-dribble'].tuning;
const NOTHING = { held: {}, pressed: {} };

function inPlay(level = 1) {
  const state = createDrill('cone-dribble', { seed: 8, level });

  state.phase = 'play';

  return state;
}

// puts the runner just short of a cone, on the side given, and carries him over its line
function crossCone(state, { cone, offset }) {
  const runner = state.run.runner;

  runner.x = cone.x - 1;
  runner.y = cone.y + offset;
  runner.vx = 2;
  runner.vy = 0;
  runner.facing = { x: 1, y: 0 };
  runner.ball = { x: runner.x + 10, y: runner.y, travel: 0 };
  updateRun(state, { held: { right: true }, pressed: {} });
}

describe('running the cones', () => {
  it('scores a cone passed on its side, more with each one clean in a row', () => {
    const state = inPlay();
    const [first, second] = state.run.course.cones;

    crossCone(state, { cone: first, offset: -18 });
    crossCone(state, { cone: second, offset: 18 });

    expect(first.clean && second.clean).toBe(true);
    expect(state.score).toBe(TUNING.cleanPoints * 2 + TUNING.comboPoints);
    expect(state.combo).toBe(2);
  });

  it('costs time and the combo for a cone passed on the wrong side', () => {
    const state = inPlay();
    const [first, second] = state.run.course.cones;

    crossCone(state, { cone: first, offset: -18 });
    crossCone(state, { cone: second, offset: -18 });

    expect(second.clean).toBe(false);
    expect(state.combo).toBe(0);
    expect(state.run.penalty).toBe(TUNING.wrongSidePenalty);
    expect(state.marks.at(-1).kind).toBe('wrongSide');
  });

  it('knocks a brushed cone over, costs time and sets the runner wobbling', () => {
    const state = inPlay();
    const cone = state.run.course.cones[0];

    crossCone(state, { cone, offset: -4 });

    expect(cone.down).toBe(state.tick);
    expect(cone.clean).toBe(false);
    expect(state.run.penalty).toBe(TUNING.brushPenalty);
    expect(state.run.runner.wobble).toBeGreaterThan(0);
    expect(state.marks.map((mark) => mark.kind)).toContain('brush');
  });

  it('runs faster on a sprint but turns slower', () => {
    const run = (sprint) => {
      const runner = inPlay().run.runner;
      const course = { tuning: TUNING, length: 5000 };

      for (let i = 0; i < 60; i += 1) {
        moveRunner(runner, { held: { right: true, sprint }, pressed: {} }, course);
      }

      const fromY = runner.y;

      for (let i = 0; i < 10; i += 1) {
        moveRunner(runner, { held: { down: true, sprint }, pressed: {} }, course);
      }

      return { speed: runner.vx, turned: runner.y - fromY };
    };

    expect(run(true).speed).toBeGreaterThan(run(false).speed);
    expect(run(true).turned).toBeLessThan(run(false).turned);
  });

  it('ends when the clock and the penalties reach the limit', () => {
    const state = inPlay();

    state.run.penalty = state.run.limit - 1;
    updateRun(state, NOTHING);

    expect(runTime(state.run)).toBe(state.run.limit);
    expect(state.run.timeUp).toBe(true);
    expect(isRunOver(state)).toBe(true);
    expect(state.score).toBe(0);
  });

  it('adds the seconds left as a bonus on crossing the finish', () => {
    const state = inPlay();
    const runner = state.run.runner;

    runner.x = state.run.course.finishX - 1;
    runner.vx = 2;
    updateRun(state, { held: { right: true }, pressed: {} });

    const left = (state.run.limit - runTime(state.run)) / 60;

    expect(state.run.finished).toBe(true);
    expect(state.score).toBe(Math.round(left * TUNING.secondPoints));
  });
});
