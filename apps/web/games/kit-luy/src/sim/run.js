import { TUNING } from '../data/tuning.js';
import { makeChoices } from './choices.js';
import { makeQuestion } from './question.js';
import { comboOf, gainOf, levelOf, timeGainOf } from './scoring.js';

function ask(run) {
  const question = makeQuestion(run, { level: run.level, ops: run.ops, previous: run.question });

  run.question = { ...question, ...makeChoices(run, question) };
  run.askedAt = run.elapsed;
  run.events.push({ type: 'ask' });
}

export function createRun({ seed, ops }) {
  const run = {
    seed,
    ops,
    phase: 'asking',
    timeLeft: TUNING.startTimeMs,
    elapsed: 0,
    askedAt: 0,
    settleLeft: 0,
    score: 0,
    correct: 0,
    wrong: 0,
    streak: 0,
    bestStreak: 0,
    level: 1,
    question: null,
    events: [],
  };

  ask(run);

  return run;
}

function settle(run, ms) {
  run.phase = 'settling';
  run.settleLeft = ms;
}

function answeredRight(run, index) {
  const fast = run.elapsed - run.askedAt <= TUNING.fastAnswerMs;

  run.streak += 1;
  run.correct += 1;
  run.bestStreak = Math.max(run.bestStreak, run.streak);

  const gain = gainOf({ level: run.level, streak: run.streak, fast });

  run.score += gain;
  run.timeLeft = Math.min(TUNING.maxTimeMs, run.timeLeft + timeGainOf(run.level));
  run.events.push({
    type: 'correct',
    index,
    gain,
    fast,
    streak: run.streak,
    combo: comboOf(run.streak),
  });

  if (levelOf(run.correct) > run.level) {
    run.level = levelOf(run.correct);
    run.events.push({ type: 'levelUp', level: run.level });
  }

  settle(run, TUNING.rightPauseMs);
}

function answeredWrong(run, index) {
  run.wrong += 1;
  run.streak = 0;
  run.timeLeft = Math.max(0, run.timeLeft - TUNING.wrongPenaltyMs);
  run.events.push({ type: 'wrong', index, correctIndex: run.question.correctIndex });
  settle(run, TUNING.wrongRevealMs);
}

export function answer(run, index) {
  if (run.phase !== 'asking' || !Number.isInteger(index) || !(index in run.question.choices)) {
    return;
  }

  if (index === run.question.correctIndex) {
    answeredRight(run, index);
  } else {
    answeredWrong(run, index);
  }
}

function end(run) {
  run.timeLeft = 0;
  run.phase = 'over';
  run.events.push({ type: 'over' });
}

// The clock stands still while an answer settles, so the reveal of a wrong one costs only its fine.
function settleOn(run, ms) {
  run.settleLeft -= ms;

  if (run.settleLeft > 0) {
    return;
  }

  if (run.timeLeft <= 0) {
    end(run);
  } else {
    run.phase = 'asking';
    ask(run);
  }
}

const secondsLeft = (ms) => Math.ceil(ms / 1000);

function runClock(run, ms) {
  const before = run.timeLeft;

  run.elapsed += ms;
  run.timeLeft -= ms;

  if (run.timeLeft <= 0) {
    end(run);
  } else if (run.timeLeft <= TUNING.lowTimeMs && secondsLeft(run.timeLeft) < secondsLeft(before)) {
    run.events.push({ type: 'tick', seconds: secondsLeft(run.timeLeft) });
  }
}

export function advance(run, ms) {
  if (run.phase === 'settling') {
    settleOn(run, ms);
  } else if (run.phase === 'asking') {
    runClock(run, ms);
  }
}

export function drainEvents(run) {
  return run.events.splice(0);
}
