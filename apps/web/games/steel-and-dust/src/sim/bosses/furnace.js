import { BOSS_ULT_COLORS } from '../../art/boss-colors.js';
import { floorUnder } from '../fighters/terrain-motion.js';
import { shake } from '../fx/camera-fx.js';
import { addFloatText } from '../fx/effects.js';
import { FURNACE_MOUTH, looseLance } from '../hazards/flame-lances.js';
import { addBurst } from '../summons/bursts.js';

// the furnace roars this many ticks before each lance, so the player can time the jump
const ROAR_LEAD = 16;

function flare(game, boss, scale) {
  const x = boss.x + boss.facing * FURNACE_MOUTH.ahead * boss.scale;
  const y = boss.y - FURNACE_MOUTH.up * boss.scale;
  addBurst(game, { sprite: 'flare', x, y, scale, direction: boss.facing });
}

export const roarsAt = (move, time) => Boolean(move.lances?.includes(time + ROAR_LEAD));
export const lanceAt = (move, time) => Boolean(move.lances?.includes(time));

export function roar(game, boss) {
  flare(game, boss, 0.5);
  game.io.sfx('flame', false, { vol: 0.5, x: boss.x });
}

export function fireLance(game, boss) {
  flare(game, boss, 0.8);
  looseLance(game, boss);
  shake(game, 3, 10);
}

// steam bursts from the ground at his back, one side then the other
export function ventSteam(game, boss, { scale = 0.6, side = -1 } = {}) {
  const x = boss.x + side * boss.facing * 14;
  addBurst(game, { sprite: 'steam', x, y: floorUnder(game.terrain, boss), scale, behind: true });
  game.io.sfx('steam', false, { vol: scale, x });
}

export const ventsAt = (move, time) => Boolean(move.vents) && time % move.vents === 0;

// red hot, he vents on both sides while his armor is off
export function vent(game, boss, move, time) {
  if (time === 0) {
    const color = BOSS_ULT_COLORS[boss.kind].title;
    addFloatText(game, { x: boss.x, y: boss.y - 60, text: 'Overheat!', color });
  }
  const side = (time / move.vents) % 2 ? 1 : -1;
  ventSteam(game, boss, { scale: 0.8, side });
}
