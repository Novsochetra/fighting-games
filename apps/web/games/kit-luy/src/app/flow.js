import { TUNING } from '../data/tuning.js';
import { recordRun, summarize } from '../sim/records.js';
import { advance, answer, createRun, drainEvents } from '../sim/run.js';

export function startRun(game, seed) {
  game.run = createRun({ seed, ops: game.settings.ops });
  game.screen = 'countdown';
  game.beatsLeft = TUNING.countdownBeats;
  game.beatLeft = 0;
  game.summary = null;
  game.events.push({ type: 'start' });
}

function countDown(game, ms) {
  game.beatLeft -= ms;

  if (game.beatLeft > 0) {
    return;
  }

  if (game.beatsLeft === 0) {
    game.screen = 'play';
    game.events.push({ type: 'go' });
  } else {
    game.events.push({ type: 'beat', count: game.beatsLeft });
    game.beatsLeft -= 1;
    game.beatLeft = TUNING.countdownBeatMs;
  }
}

function finish(game) {
  game.summary = summarize(game.records, game.run);
  game.records = recordRun(game.records, game.run);
  game.screen = 'over';
  game.events.push({ type: 'finished', summary: game.summary });
}

function collect(game) {
  game.events.push(...drainEvents(game.run));

  if (game.run.phase === 'over') {
    finish(game);
  }
}

export function tick(game, ms) {
  if (game.screen === 'countdown') {
    countDown(game, ms);
  } else if (game.screen === 'play') {
    advance(game.run, ms);
    collect(game);
  }
}

export function answerRun(game, index) {
  if (game.screen === 'play') {
    answer(game.run, index);
    collect(game);
  }
}

const isRunning = (game) => game.screen === 'play' || game.screen === 'countdown';

export function pause(game) {
  if (isRunning(game)) {
    game.resumeTo = game.screen;
    game.screen = 'pause';
    game.events.push({ type: 'paused' });
  }
}

export function resume(game) {
  if (game.screen === 'pause') {
    game.screen = game.resumeTo;
    game.events.push({ type: 'resumed' });
  }
}

export function quit(game) {
  game.run = null;
  game.screen = 'title';
  game.events.push({ type: 'quit' });
}

export function drainGame(game) {
  return game.events.splice(0);
}
