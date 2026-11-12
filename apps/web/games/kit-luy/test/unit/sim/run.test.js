import { describe, expect, it } from 'vitest';
import { OPERATIONS } from '../../../src/data/operations.js';
import { TUNING } from '../../../src/data/tuning.js';
import { advance, answer, createRun, drainEvents } from '../../../src/sim/run.js';
import { answerRight, answerWrong, eventsOf, settle } from '../../support/play.js';

const newRun = (seed = 11) => createRun({ seed, ops: OPERATIONS });

describe('a run', () => {
  it('starts asking, with a full clock and nothing earned', () => {
    const run = newRun();

    expect(run).toMatchObject({
      phase: 'asking',
      timeLeft: TUNING.startTimeMs,
      score: 0,
      level: 1,
    });
    expect(run.question.choices[run.question.correctIndex]).toBe(run.question.answer);
    expect(drainEvents(run)).toEqual([{ type: 'ask' }]);
  });

  it('is the same run again from the same seed', () => {
    expect(newRun(5).question).toEqual(newRun(5).question);
    expect(newRun(5).question).not.toEqual(newRun(6).question);
  });

  it('pays a right answer, with a bonus when it came fast', () => {
    const fast = newRun();
    const slow = newRun();

    answerRight(fast, 500);
    answerRight(slow, TUNING.fastAnswerMs + 1);

    expect(fast.score).toBe(200);
    expect(slow.score).toBe(100);
    expect(eventsOf(fast, 'correct')[0]).toMatchObject({ gain: 200, fast: true, streak: 1 });
  });

  it('gives time back for a right answer, never past a full clock', () => {
    const run = newRun();

    answerRight(run, 100);
    expect(run.timeLeft).toBe(TUNING.maxTimeMs);

    settle(run);
    answerRight(run, 10000);
    expect(run.timeLeft).toBe(TUNING.maxTimeMs - 10000 + TUNING.timeGainMs);
  });

  it('fines a wrong answer, breaks the streak and names the right key', () => {
    const run = newRun();

    answerRight(run);
    settle(run);
    answerWrong(run);

    expect(run).toMatchObject({ streak: 0, bestStreak: 1, wrong: 1, score: 200 });
    expect(run.timeLeft).toBe(TUNING.startTimeMs - TUNING.wrongPenaltyMs);
    expect(eventsOf(run, 'wrong')[0].correctIndex).toBe(run.question.correctIndex);
  });

  it('holds the clock and takes no answer while one settles', () => {
    const run = newRun();

    answerWrong(run);

    const { timeLeft, wrong } = run;

    advance(run, TUNING.wrongRevealMs - 1);
    answerWrong(run);

    expect(run).toMatchObject({ phase: 'settling', timeLeft, wrong });
  });

  it('asks a new question once an answer has settled', () => {
    const run = newRun();
    const first = run.question;

    answerRight(run);
    drainEvents(run);
    advance(run, TUNING.rightPauseMs);

    expect(run.phase).toBe('asking');
    expect(run.question).not.toEqual(first);
    expect(drainEvents(run)).toEqual([{ type: 'ask' }]);
  });

  it('ignores a key that is not there', () => {
    const run = newRun();

    for (const key of [-1, 4, 1.5, NaN, undefined, 'toString']) {
      answer(run, key);
    }

    expect(run).toMatchObject({ phase: 'asking', correct: 0, wrong: 0 });
  });

  it('climbs a level every six right answers and says so once', () => {
    const run = newRun();

    for (let i = 0; i < TUNING.answersPerLevel; i++) {
      answerRight(run);
      settle(run);
    }

    expect(run.level).toBe(2);
    expect(eventsOf(run, 'levelUp')).toEqual([{ type: 'levelUp', level: 2 }]);
  });

  it('multiplies the pay on the fifth right answer running', () => {
    const run = newRun();

    for (let i = 0; i < TUNING.streakPerCombo; i++) {
      answerRight(run);
      settle(run);
    }

    expect(eventsOf(run, 'correct').map((event) => event.combo)).toEqual([1, 1, 1, 1, 2]);
  });

  it('ticks each of the last seconds, then ends when the clock runs out', () => {
    const run = newRun();

    advance(run, TUNING.startTimeMs - TUNING.lowTimeMs);
    drainEvents(run);

    for (let i = 0; i < 60; i++) {
      advance(run, 100);
    }

    expect(eventsOf(run, 'tick').map((event) => event.seconds)).toEqual([4, 3, 2, 1]);
    expect(run).toMatchObject({ phase: 'over', timeLeft: 0 });
    expect(eventsOf(run, 'over')).toHaveLength(1);
  });

  it('ends on the fine that empties the clock, after showing the right answer', () => {
    const run = newRun();

    advance(run, TUNING.startTimeMs - 1000);
    answerWrong(run);
    expect(run).toMatchObject({ phase: 'settling', timeLeft: 0 });

    advance(run, TUNING.wrongRevealMs);
    expect(run.phase).toBe('over');
  });

  it('stays over: no clock, no answers, no more events', () => {
    const run = newRun();

    advance(run, TUNING.startTimeMs);
    drainEvents(run);
    advance(run, 5000);
    answer(run, run.question.correctIndex);

    expect(run).toMatchObject({ phase: 'over', correct: 0, score: 0 });
    expect(run.events).toEqual([]);
  });
});
