import { createFighter } from '../../src/sim/fighters/create-fighter.js';
import { createPlayingGame } from './test-game.js';

// a game in play with only the hero on the road, every sound it asks for from here on noted in
// `sounds`
export function createLootGame(options = {}) {
  const sounds = [];
  const sfx = (key, big, settings) => sounds.push({ key, ...settings });
  const game = createPlayingGame({ ...options, io: { sfx, ...options.io } });
  game.fighters = [game.player];
  sounds.length = 0;
  return { game, sounds };
}

export function spawnEnemy(game, kind, x) {
  const enemy = createFighter('enemy', kind, x, game.player.y);
  game.fighters.push(enemy);
  return enemy;
}

export function soundKeys(sounds) {
  return sounds.map((sound) => sound.key);
}

// counts Math.random draws while `run` runs: loot must take none, or the raiders would change
export function countRandomDraws(run) {
  const original = Math.random;
  let draws = 0;
  Math.random = () => {
    draws++;
    return original();
  };
  try {
    run();
  } finally {
    Math.random = original;
  }
  return draws;
}

export function piece(overrides) {
  return {
    kind: 'coin',
    x: 100,
    y: 100,
    vx: 0,
    vy: 0,
    time: 0,
    landed: false,
    rolling: false,
    taken: false,
    phase: 0,
    ...overrides,
  };
}
