import { COLORS } from '../../art/colors.js';
import { CONVEYOR, FURNACE_SCORCH, mouthOf } from '../../data/conveyors.js';
import { applyHit } from '../combat/apply-hit.js';
import { canBeHit } from '../combat/guard.js';
import { damageOf } from '../combat/hit-damage.js';
import { reactToHit } from '../combat/hit-reaction.js';
import { knockOut } from '../combat/knock-out.js';
import { shake } from '../fx/camera-fx.js';
import { addFloatText } from '../fx/effects.js';
import { addSparks } from '../fx/particles.js';
import { addBurst } from '../summons/bursts.js';
import { hazardAttacker } from './hazard-attacker.js';

// its purse spills on the belt short of the mouth rather than into the fire
function spillOnBelt(pieces, belt) {
  const x = mouthOf(belt) - belt.direction * CONVEYOR.lip;

  for (const piece of pieces) {
    Object.assign(piece, { x, vx: -belt.direction * Math.abs(piece.vx) });
  }
}

function roar(game, mouth, y) {
  addBurst(game, { sprite: 'blaze', x: mouth, y, scale: 0.8 });
  addSparks(game, { x: mouth, y: y - 10, count: 12, color: COLORS.orange, speed: 3.2 });
  shake(game, 2, 8);
  game.io.sfx('flame', false, { x: mouth });
}

// a raider still fighting is out at once, for a bonus; one knocked out already just burns
export function feedFurnace(game, belt, raider) {
  const mouth = mouthOf(belt);

  if (raider.state !== 'ko') {
    const spilled = game.loot.length;

    knockOut(game, raider, belt.direction);
    spillOnBelt(game.loot.slice(spilled), belt);
    game.score += CONVEYOR.smeltBonus;
    const y = raider.y - 56 * raider.scale;
    addFloatText(game, { x: mouth, y, text: 'Smelted!', color: COLORS.gold });
  }

  raider.removed = true;
  roar(game, mouth, belt.y);
}

// a scorch that would finish the hero only throws him out: the furnace never knocks him out alone
function scorch(game, hit) {
  const { target, move } = hit;

  if (damageOf(game, target, move) < target.hp) {
    return applyHit(game, hit);
  }

  if (!canBeHit(target, move)) {
    return false;
  }

  const direction = Math.sign(target.x - hit.attacker.x) || 1;
  reactToHit(game, target, { move, direction, knockback: move.knockback, knockdown: true });

  return true;
}

// the fire licks out and throws him back up the belt; while he cannot be hit (getting up, just
// up) the mouth holds him at its lip until it can
export function scorchHero(game, belt, hero) {
  const mouth = mouthOf(belt);
  const out = -belt.direction;
  const side = { x: mouth + belt.direction * 8, direction: out, side: 'enemy' };
  const attacker = hazardAttacker(side, 'none');
  const hit = { attacker, target: hero, move: FURNACE_SCORCH, x: hero.x, y: hero.y - 12 };

  if (!scorch(game, hit)) {
    hero.x = mouth + out * CONVEYOR.speed;
    return;
  }

  addBurst(game, { sprite: 'flare', x: mouth, y: belt.y - 8, scale: 0.6, direction: out });
  game.io.sfx('flame', false, { x: mouth });
}
