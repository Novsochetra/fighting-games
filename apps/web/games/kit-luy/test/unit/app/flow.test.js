import { describe, expect, it } from 'vitest';
import {
  answerRun,
  drainGame,
  pause,
  quit,
  resume,
  startRun,
  tick,
} from '../../../src/app/flow.js';
import { createGame } from '../../../src/app/game.js';
import { defaultSettings } from '../../../src/data/settings.js';
import { TUNING } from '../../../src/data/tuning.js';
import { NO_RECORDS } from '../../../src/sim/records.js';

const newGame = (records = NO_RECORDS) => createGame({ records, settings: defaultSettings() });
const typesOf = (events) => events.map((event) => event.type);

function started(records) {
  const game = newGame(records);

  startRun(game, 7);
  tick(game, 0);

  for (let beat = 0; beat < TUNING.countdownBeats; beat++) {
    tick(game, TUNING.countdownBeatMs);
  }

  return game;
}

describe('the game’s flow', () => {
  it('opens on the title with no run', () => {
    expect(newGame()).toMatchObject({ screen: 'title', run: null });
  });

  it('counts three beats down before the run begins, the clock still full', () => {
    const game = newGame();

    startRun(game, 7);
    tick(game, 0);
    tick(game, TUNING.countdownBeatMs);
    tick(game, TUNING.countdownBeatMs);

    expect(game.screen).toBe('countdown');
    expect(drainGame(game)).toEqual([
      { type: 'start' },
      { type: 'beat', count: 3 },
      { type: 'beat', count: 2 },
      { type: 'beat', count: 1 },
    ]);

    tick(game, TUNING.countdownBeatMs);
    expect(game.screen).toBe('play');
    expect(game.run.timeLeft).toBe(TUNING.startTimeMs);
    expect(typesOf(drainGame(game))).toEqual(['go']);
  });

  it('shows the first question only once the run is on', () => {
    const game = started();

    drainGame(game);
    tick(game, 16);

    expect(typesOf(drainGame(game))).toEqual(['ask']);
  });

  it('takes no answer during the countdown', () => {
    const game = newGame();

    startRun(game, 7);
    answerRun(game, game.run.question.correctIndex);

    expect(game.run.correct).toBe(0);
  });

  it('tells of an answer at once, not a frame later', () => {
    const game = started();

    drainGame(game);
    answerRun(game, game.run.question.correctIndex);

    expect(typesOf(drainGame(game))).toContain('correct');
  });

  it('stops the clock while paused and goes on from where it was', () => {
    const game = started();

    tick(game, 1000);
    pause(game);
    tick(game, 60000);

    expect(game).toMatchObject({ screen: 'pause', run: { timeLeft: TUNING.startTimeMs - 1000 } });

    resume(game);
    expect(game.screen).toBe('play');
  });

  it('pauses a countdown and comes back to it', () => {
    const game = newGame();

    startRun(game, 7);
    pause(game);
    resume(game);

    expect(game.screen).toBe('countdown');
  });

  it('has nothing to pause on the title, and nothing to resume in a run', () => {
    const title = newGame();
    const run = started();

    pause(title);
    resume(run);

    expect(title.screen).toBe('title');
    expect(run.screen).toBe('play');
  });

  it('ends on the results with the run counted into the records', () => {
    const game = started({ ...NO_RECORDS, best: 100, savings: 9900 });

    answerRun(game, game.run.question.correctIndex);
    tick(game, TUNING.rightPauseMs);
    tick(game, TUNING.maxTimeMs);

    expect(game.screen).toBe('over');
    expect(game.records).toEqual({ best: 200, bestStreak: 1, savings: 10100, plays: 1 });
    expect(game.summary).toMatchObject({ score: 200, isNewBest: true, rankUp: true });
    expect(typesOf(drainGame(game)).slice(-2)).toEqual(['over', 'finished']);
  });

  it('counts a run once, however long the results stay up', () => {
    const game = started();

    tick(game, TUNING.maxTimeMs);
    tick(game, 5000);
    tick(game, 5000);

    expect(game.records.plays).toBe(1);
  });

  it('drops the run on quitting, counting nothing', () => {
    const game = started();

    answerRun(game, game.run.question.correctIndex);
    quit(game);

    expect(game).toMatchObject({ screen: 'title', run: null, records: NO_RECORDS });
  });

  it('starts a run over from nothing', () => {
    const game = started();

    answerRun(game, game.run.question.correctIndex);
    startRun(game, 8);

    expect(game).toMatchObject({ screen: 'countdown', run: { score: 0, correct: 0 } });
  });
});
