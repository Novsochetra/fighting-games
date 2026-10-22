import { shake } from '../fx/camera-fx.js';
import { floorUnder } from '../fighters/terrain-motion.js';
import { markSerpent, sendSpirit } from '../hazards/spirit-nagas.js';
import { COIL_FRONT } from '../hazards/tides.js';
import { addBurst } from '../summons/bursts.js';

// her coil comes down in a burst of moat water at its front
export function crashCoil(game, boss) {
  const y = floorUnder(game.terrain, boss);
  const x = boss.x + boss.facing * COIL_FRONT * boss.scale;
  addBurst(game, { sprite: 'splash', x, y, scale: 1, behind: true });
  shake(game, 4, 12);
  game.io.sfx('splash', false, { x: boss.x });
}

// the sweep of the rainbow whose spirit leaves on this tick of the move, if any
export function sweepAt(move, time) {
  return move.rainbow?.sweeps.find(([at]) => at === time);
}

export function callSpirit(game, boss, [, from]) {
  sendSpirit(game, boss, from);
}

export const serpentRisesAt = (move, time) => time === move.rainbow?.riseAt;

export function callSerpent(game, boss) {
  markSerpent(game, boss);
  game.io.sfx('nagaHiss', false, { vol: 1, x: game.player.x });
}
