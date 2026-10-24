import { ULT_FULL } from '../../src/config.js';
import { spawnEnemy } from '../../src/sim/stage/spawn-enemy.js';
import { createPlayingGame, runTicks, tap } from './test-game.js';

// the hero on the first road with Gravel Khan, its boss, a short step in front
export function facingKhan(hero) {
  const game = createPlayingGame({ settings: { hero } });
  runTicks(game, 30);
  spawnEnemy(game, 'khan', 1);
  Object.assign(game.boss, { entering: false, x: game.player.x + 70, facing: -1 });
  return game;
}

// fills the bar, presses ULT and runs the ultimate to its end; false if it never started
export function fireUltimate(game) {
  game.ultMeter = ULT_FULL;
  tap(game, 'ult');
  if (game.player.state !== 'ult') {
    return false;
  }
  for (let i = 0; game.player.state === 'ult' && i < 600; i++) {
    runTicks(game, 1);
  }
  return true;
}

export const hpShare = (fighter) => fighter.hp / fighter.maxHp;
