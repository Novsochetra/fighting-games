import { BOSS_ULT_COLORS } from '../../art/boss-colors.js';
import { bodyPoint, bodySize } from '../fighters/body-point.js';
import { floorUnder } from '../fighters/terrain-motion.js';
import { shake } from '../fx/camera-fx.js';
import { addFloatText } from '../fx/effects.js';
import { FURNACE_MOUTH, looseLance } from '../hazards/flame-lances.js';
import { addBurst } from '../summons/bursts.js';

// the furnace roars this many ticks before each lance, so the player can time the jump
const ROAR_LEAD = 16;
// the vents at his sides, the air over his head and the sizes of his fire and steam, in his own units
const VENT = { ahead: 14 };
const ABOVE_HEAD = { up: 60 };
const ROAR_SIZE = 0.5;
const FIRE_SIZE = 0.8;
const WALK_STEAM = 0.6;
const HOT_STEAM = 0.8;

function flare(game, boss, size) {
  const at = bodyPoint(boss, FURNACE_MOUTH);
  addBurst(game, { sprite: 'flare', ...at, scale: bodySize(boss, size), direction: boss.facing });
}

export const roarsAt = (move, time) => Boolean(move.lances?.includes(time + ROAR_LEAD));
export const lanceAt = (move, time) => Boolean(move.lances?.includes(time));

export function roar(game, boss) {
  flare(game, boss, ROAR_SIZE);
  game.io.sfx('flame', false, { vol: 0.5, x: boss.x });
}

export function fireLance(game, boss) {
  flare(game, boss, FIRE_SIZE);
  looseLance(game, boss);
  shake(game, 3, 10);
}

// steam bursts from the ground at his back, one side then the other
export function ventSteam(game, boss, { size = WALK_STEAM, side = -1 } = {}) {
  const { x } = bodyPoint(boss, { ahead: side * VENT.ahead });
  const y = floorUnder(game.terrain, boss);
  addBurst(game, { sprite: 'steam', x, y, scale: bodySize(boss, size), behind: true });
  game.io.sfx('steam', false, { vol: size / HOT_STEAM, x });
}

export const ventsAt = (move, time) => Boolean(move.vents) && time % move.vents === 0;

// red hot, he vents on both sides while his armor is off
export function vent(game, boss, move, time) {
  if (time === 0) {
    const color = BOSS_ULT_COLORS[boss.kind].title;
    addFloatText(game, { ...bodyPoint(boss, ABOVE_HEAD), text: 'Overheat!', color });
  }
  const side = (time / move.vents) % 2 ? 1 : -1;
  ventSteam(game, boss, { size: HOT_STEAM, side });
}
