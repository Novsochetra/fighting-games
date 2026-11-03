import { DRILLS } from '../../data/training.js';
import { breakCombo, comboTop, pushMark } from '../scoring.js';
import { drift, moveDummy } from './motion.js';
import { chargeShot, judgeShot, moveAim } from './shot.js';
import { AIM_HOME, lightTarget, TARGETS } from './targets.js';

const TUNING = DRILLS['target-shot'].tuning;

export const FINISH_TICKS = 60;

export function createRun(state) {
  const run = {
    stage: 'aim',
    stageTicks: 0,
    shot: 0,
    results: [],
    target: null,
    aim: { ...AIM_HOME },
    spot: { x: 0, dir: 1 },
    dummy: { x: 0, dir: 1 },
    charge: 0,
    ball: null,
  };

  state.run = run;
  lightTarget(state, TUNING);

  return run;
}

const shotsTop = (count) =>
  comboTop({
    count,
    base: TUNING.latePoints,
    step: TUNING.comboPoints,
    cap: TUNING.comboCap,
  });

export const topScore = () => shotsTop(TUNING.shots);

export const paceTop = (state) => shotsTop(state.run.results.length);

function enterStage(run, stage) {
  run.stage = stage;
  run.stageTicks = 0;
}

function tooLate(state) {
  const spot = TARGETS[state.run.target.index];

  state.run.results.push('late');
  state.run.charge = 0;
  breakCombo(state);
  pushMark(state, { kind: 'tooLate', x: spot.x, y: spot.y, points: 0 });
  enterStage(state.run, 'after');
}

const STAGES = {
  aim: (state, input) => {
    const run = state.run;

    moveAim(run, input, TUNING);

    if (!chargeShot(run, input, TUNING) && run.target.left <= 0) {
      tooLate(state);
    }
  },
  flight: (state) => {
    const run = state.run;

    run.ball.ticks += 1;

    if (run.ball.ticks >= run.ball.total) {
      judgeShot(state, TUNING);
      enterStage(run, 'after');
    }
  },
  after: (state) => {
    const run = state.run;

    if (run.stageTicks < TUNING.afterTicks) {
      return;
    }

    run.shot += 1;
    run.ball = null;

    if (run.shot < TUNING.shots) {
      lightTarget(state, TUNING);
      enterStage(run, 'aim');
    }
  },
};

export function updateRun(state, input) {
  const run = state.run;

  run.stageTicks += 1;
  run.target.left = Math.max(0, run.target.left - 1);
  moveDummy(state, TUNING);
  drift(state, TUNING);
  STAGES[run.stage](state, input);
}

export const isRunOver = (state) => state.run.shot >= TUNING.shots;
