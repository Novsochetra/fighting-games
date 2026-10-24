import { defaultSettings } from '../../src/data/settings.js';
import { createGame } from '../../src/sim/create-game.js';
import { placeOnTitle, startPlay } from '../../src/sim/stage/flow.js';
import { tick } from '../../src/sim/tick.js';

export function createTestGame({
  settings = {},
  io = {},
  records = {},
  checkpoint = null,
  leaderboard = [],
} = {}) {
  const game = createGame({
    settings: { ...defaultSettings(false), ...settings },
    device: { coarsePointer: false, touchUsed: false },
    records: { bestCombo: 0, bestScore: 0, ...records },
    hintsSeen: {},
    checkpoint,
    leaderboard,
    io,
  });
  placeOnTitle(game);
  return game;
}

export function createPlayingGame(options) {
  const game = createTestGame(options);
  startPlay(game);
  return game;
}

export function runTicks(game, count) {
  for (let i = 0; i < count; i++) {
    tick(game);
  }
}

export function press(game, action) {
  game.input.pressed[action] = true;
  game.input.held[action] = true;
}

export function release(game, action) {
  game.input.held[action] = false;
}

export function tap(game, action) {
  press(game, action);
  tick(game);
  release(game, action);
}
