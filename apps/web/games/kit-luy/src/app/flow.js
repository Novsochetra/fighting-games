import { recordRun, summarize } from '../sim/records.js';
import {
  advance,
  clearCloth,
  clearTyped,
  createRun,
  deal,
  drainEvents,
  eraseDigit,
  give,
  takeBack,
  typeDigits,
} from '../sim/run.js';

function finish(game) {
  const { mode } = game.run;

  game.summary = {
    ...summarize(game.records[mode], game.run),
    mode,
    reason: game.run.closedBy,
    speeds: { ...game.run.speeds },
  };
  game.records = { ...game.records, [mode]: recordRun(game.records[mode], game.run) };
  game.screen = 'over';
  game.events.push({ type: 'finished', summary: game.summary });
}

// The title is a run already open, its clock waiting for the first customer to be paid: paying
// them is what starts the game, so there is no Play button.
function collect(game) {
  game.events.push(...drainEvents(game.run));

  if (game.screen === 'title' && game.run.started) {
    game.screen = 'play';
  }

  if (game.screen === 'play' && game.run.phase === 'closed') {
    finish(game);
  }
}

export function openStall(game, seed) {
  const { ops, total, input } = game.settings;

  game.run = createRun({ seed, ops, totalAlways: total === 'always', mode: input });
  game.screen = 'title';
  game.summary = null;
  game.events.push({ type: 'opened' });
  collect(game);
}

const isOpen = (game) => game.screen === 'title' || game.screen === 'play';

export function tick(game, ms) {
  if (isOpen(game)) {
    advance(game.run, ms);
    collect(game);
  }
}

function atCounter(game, act) {
  if (isOpen(game)) {
    act(game.run);
    collect(game);
  }
}

export const dealPiece = (game, value) => atCounter(game, (run) => deal(run, value));
export const takePiece = (game, value) => atCounter(game, (run) => takeBack(run, value));
export const clearPieces = (game) => atCounter(game, clearCloth);
export const givePieces = (game) => atCounter(game, give);
export const typeKeys = (game, digits) => atCounter(game, (run) => typeDigits(run, digits));
export const eraseKey = (game) => atCounter(game, eraseDigit);
export const clearKeys = (game) => atCounter(game, clearTyped);

export function pause(game) {
  if (game.screen === 'play') {
    game.screen = 'pause';
  }
}

export function resume(game) {
  if (game.screen === 'pause') {
    game.screen = 'play';
  }
}

export function drainGame(game) {
  return game.events.splice(0);
}
