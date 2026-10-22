import { COLORS } from '../../art/colors.js';
import { activeEnd } from '../../data/moves/define-move.js';
import { startMove } from '../fighters/actions.js';
import { bodyPoint, bodySize } from '../fighters/body-point.js';
import { isPlayer } from '../fighters/loadout.js';
import { shake } from '../fx/camera-fx.js';
import { addFloatText } from '../fx/effects.js';
import { addBurst } from '../summons/bursts.js';

// the hammer's head as he sets his guard (frame 2), and the glint's size there, in his own units
export const GUARD_GLINT = { ahead: 19, up: 27 };
const GLINT_SIZE = 0.45;
const PARRY_SIZE = 1.2;
// both freeze on the parry, and the hero reels back long enough for the counter to land
const PARRY_FREEZE = 10;
const STAGGER = 30;
const RECOIL = 1.6;
// the word rises over the striker's head, or over the turned shot
const ABOVE_HERO = 44;
const ABOVE_SHOT = 16;

export const isParrying = (fighter) =>
  fighter.state === 'attack' &&
  Boolean(fighter.move?.guard) &&
  fighter.moveTime >= fighter.move.startup &&
  fighter.moveTime < activeEnd(fighter.move);

// the light catches the hammer as he sets his guard: hitting him now is what he wants
export function raiseGuard(game, boss) {
  const at = bodyPoint(boss, GUARD_GLINT);
  addBurst(game, { sprite: 'parry', ...at, scale: bodySize(boss, GLINT_SIZE) });
  game.io.sfx('armor', false, { vol: 0.5, x: boss.x });
}

function stagger(hero, boss) {
  hero.move = null;
  hero.hitboxActive = false;
  hero.trail.length = 0;
  const away = Math.sign(hero.x - boss.x) || -boss.facing;
  Object.assign(hero, { state: 'hurt', stateTime: STAGGER, vx: away * RECOIL });
}

// a blow on his guard bursts in gold where it lands; a hero who struck it reels, and he answers
// with the counter at once. A shot is only turned aside
export function parryHit(game, { attacker, target, x, y }) {
  addBurst(game, { sprite: 'parry', x, y, scale: PARRY_SIZE });
  const over = isPlayer(attacker)
    ? { x: attacker.x, y: attacker.y - ABOVE_HERO }
    : { x, y: y - ABOVE_SHOT };
  addFloatText(game, { ...over, text: 'parry!', color: COLORS.gold });
  target.hitstop = PARRY_FREEZE;
  attacker.hitstop = PARRY_FREEZE;
  shake(game, 3, 8);
  game.io.sfx('parry', false, { x });
  if (isPlayer(attacker)) {
    stagger(attacker, target);
    target.facing = Math.sign(attacker.x - target.x) || target.facing;
    startMove(game, target, 'guardStrike');
  }
}
