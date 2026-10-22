import { screenEdges } from '../fighters/arena-bounds.js';
import { markStrike } from '../hazards/storm-strikes.js';

const EDGE = 8;

// the wave of the storm whose spots are marked on this tick of the move, if any
export function stormWaveAt(move, time) {
  return move.storm?.waves.find(([at]) => at === time);
}

// each wave falls around where the hero stands as it is marked; spots off the screen are dropped
export function callStormWave(game, boss, [, offsets]) {
  const { left, right } = screenEdges(game);
  for (const offset of offsets) {
    const x = game.player.x + offset;
    if (x > left + EDGE && x < right - EDGE) {
      markStrike(game, boss, { x });
    }
  }
  game.io.sfx('zap', false, { vol: 0.5, x: boss.x });
}

// the last and greatest strike, on the hero
export function callGreatStrike(game, boss) {
  markStrike(game, boss, { x: game.player.x, great: true });
  game.io.sfx('zap', false, { x: boss.x });
}
