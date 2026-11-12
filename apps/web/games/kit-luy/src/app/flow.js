import { recordRun, summarize } from '../sim/records.js';
import { advance, clearCloth, createRun, deal, drainEvents, give, takeBack } from '../sim/run.js';

function finish(game) {
  game.summary = summarize(game.records, game.run);
  game.records = recordRun(game.records, game.run);
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
  const { ops, total } = game.settings;

  game.run = createRun({ seed, ops, totalAlways: total === 'always' });
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
