import { TICKS_PER_SECOND } from '../../config.js';
import { DRILLS } from '../../data/training.js';
import { comboTop, pushMark } from '../scoring.js';
import { judgeCones } from './cones.js';
import { createCourse, limitTicks, parTicks } from './course.js';
import { createRunner, moveRunner } from './runner.js';

const TUNING = DRILLS['cone-dribble'].tuning;

// the finish holds while the ball is struck into the net
export const FINISH_TICKS = 80;

export function createRun(state) {
  const course = createCourse(state.random, { tuning: TUNING, level: state.level });

  return {
    course,
    runner: createRunner(),
    elapsed: 0,
    penalty: 0,
    limit: limitTicks(course, TUNING),
    finished: false,
    timeUp: false,
    finishedAt: null,
  };
}

export const runTime = (run) => run.elapsed + run.penalty;

const secondsBonus = (ticks) =>
  Math.round((Math.max(0, ticks) * TUNING.secondPoints) / TICKS_PER_SECOND);

const cleanTop = (count) =>
  comboTop({
    count,
    base: TUNING.cleanPoints,
    step: TUNING.comboPoints,
    cap: TUNING.comboCap,
  });

export function topScore(state) {
  const { course, limit } = state.run;

  return cleanTop(course.cones.length) + secondsBonus(limit - parTicks(course, TUNING));
}

// the best the cones passed so far could have scored, for the grade the run is on for
export function paceTop(state) {
  const { course, finished } = state.run;

  return finished ? topScore(state) : cleanTop(course.cones.filter((cone) => cone.passed).length);
}

function finish(state) {
  const run = state.run;
  const bonus = secondsBonus(run.limit - runTime(run));

  run.finished = true;
  run.finishedAt = { x: run.runner.x, y: run.runner.y };
  state.score += bonus;
  pushMark(state, { kind: 'finish', x: run.runner.x, y: run.runner.y, points: bonus });
}

export function updateRun(state, input) {
  const run = state.run;
  const fromX = run.runner.x;

  run.elapsed += 1;
  moveRunner(run.runner, input, { tuning: TUNING, length: run.course.finishX + 4 });
  judgeCones(state, { tuning: TUNING, fromX });

  if (run.runner.x >= run.course.finishX) {
    finish(state);
  } else if (runTime(run) >= run.limit) {
    run.timeUp = true;
    pushMark(state, { kind: 'timeUp', x: run.runner.x, y: run.runner.y, points: 0 });
  }
}

export const isRunOver = (state) => state.run.finished || state.run.timeUp;

// the runner slows to a stop past the line
export function updateFinish(state) {
  const runner = state.run.runner;

  runner.vx *= 0.9;
  runner.vy *= 0.9;
  runner.x += runner.vx;
}
