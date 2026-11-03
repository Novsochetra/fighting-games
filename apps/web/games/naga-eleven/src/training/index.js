import { DRILLS } from '../data/training.js';
import { createRandom } from '../sim/random.js';
import * as coneDribble from './cone-dribble/index.js';
import { gradeOf, isBetter, pressed, pruneMarks } from './scoring.js';
import * as spiritFocus from './spirit-focus/index.js';
import * as targetShot from './target-shot/index.js';

export { gradeOf } from './scoring.js';

const RULES = {
  'cone-dribble': coneDribble,
  'target-shot': targetShot,
  'spirit-focus': spiritFocus,
};

// READY shows for the first half, GO for the second
export const READY_TICKS = 90;

// the result card ignores presses a moment, so a button still mashed from the drill skips nothing
export const RESULT_LOCK_TICKS = 40;

const rulesOf = (state) => RULES[state.drill];

function startAttempt(state) {
  Object.assign(state, {
    random: createRandom(state.seed),
    score: 0,
    combo: 0,
    bestCombo: 0,
    grade: 'C',
    marks: [],
    events: [],
  });
  state.run = rulesOf(state).createRun(state);
  state.topScore = rulesOf(state).topScore(state);
}

function enter(state, phase) {
  state.phase = phase;
  state.phaseTicks = 0;
}

export function createDrill(drillId, { seed = 1, level = 1 } = {}) {
  if (!DRILLS[drillId]) {
    throw new Error(`no drill ${drillId}`);
  }

  const state = { drill: drillId, level, seed: seed >>> 0, tick: 0, attempt: 1, best: null };

  startAttempt(state);
  enter(state, 'intro');

  return state;
}

const finalGrade = (state) => gradeOf(state.score, state.topScore, DRILLS[state.drill].grades);

// the grade the run is on for: what it scored against the best what it has played could score,
// or null before anything has been played
export function liveGrade(state) {
  if (state.phase === 'result' || state.phase === 'done') {
    return state.grade;
  }

  const top = rulesOf(state).paceTop(state);

  return top > 0 ? gradeOf(state.score, top, DRILLS[state.drill].grades) : null;
}

function settle(state) {
  state.grade = finalGrade(state);

  const improved =
    !state.best || state.score > state.best.score || isBetter(state.grade, state.best.grade);

  state.newBest = improved;

  if (improved) {
    state.best = { score: state.score, grade: state.grade };
  }

  enter(state, 'result');
}

function updateResult(state, input) {
  if (state.phaseTicks < RESULT_LOCK_TICKS) {
    return;
  }

  if (pressed(input, 'pass')) {
    enter(state, 'done');
  } else if (pressed(input, 'shoot')) {
    state.attempt += 1;
    startAttempt(state);
    enter(state, 'ready');
  }
}

const STEPS = {
  intro: (state, input) => pressed(input, 'pass') && enter(state, 'ready'),
  ready: (state) => state.phaseTicks >= READY_TICKS && enter(state, 'play'),
  play: (state, input) => {
    rulesOf(state).updateRun(state, input);

    if (rulesOf(state).isRunOver(state)) {
      enter(state, 'finish');
    }
  },
  finish: (state) => {
    rulesOf(state).updateFinish?.(state);

    if (state.phaseTicks >= rulesOf(state).FINISH_TICKS) {
      settle(state);
    }
  },
  result: updateResult,
  done: () => {},
};

export function updateDrill(state, input) {
  state.events = [];
  state.tick += 1;
  state.phaseTicks += 1;
  STEPS[state.phase](state, input);
  pruneMarks(state);
}

export const isDrillOver = (state) => state.phase === 'done';

// the best of the attempts made goes to the campaign
export function drillResult(state) {
  const best = state.best ?? { score: state.score, grade: finalGrade(state) };

  return { drill: state.drill, score: best.score, grade: best.grade };
}
