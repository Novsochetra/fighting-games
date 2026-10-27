import { COLORS } from '../../art/colors.js';
import { difficultyOf } from '../../data/difficulty.js';
import { SLAB, SLAB_FALL } from '../../data/slabs.js';
import { applyHit } from '../combat/apply-hit.js';
import { knockOut } from '../combat/knock-out.js';
import { endMove } from '../fighters/actions.js';
import { addFloatText } from '../fx/effects.js';
import { groundAt } from '../stage/terrain.js';
import { hazardAttacker } from './hazard-attacker.js';

const isRaider = (fighter) => fighter.side === 'enemy' && !fighter.def.boss;

// a raider still fighting is out at once, however much health it has left, for a bonus; one
// knocked out already just drops. Its purse spills on the rubble, which stays walkable
function dropThrough(game, slab, raider) {
  if (raider.state !== 'ko') {
    knockOut(game, raider, raider.x < slab.x ? -1 : 1);
    game.score += SLAB.fallBonus;
  }

  raider.removed = true;
}

// the hero or a boss climbs out on the nearer edge
function climbOut(game, slab, fighter) {
  const side = fighter.x < slab.x ? -1 : 1;
  const x = slab.x + side * (SLAB.halfWidth + SLAB.edgeIn);

  Object.assign(fighter, { x, y: groundAt(game.terrain, x), vx: 0, vy: 0 });
  endMove(game, fighter);
}

// as hard as the fall hits on this difficulty, short of the hero's last point of health, or none
export function fallMove(game, hero) {
  const most = Math.floor((hero.hp - 1) / difficultyOf(game.settings).damage);
  const damage = Math.min(SLAB_FALL.hero.damage, most);

  return damage >= 1 ? { ...SLAB_FALL.hero, damage } : null;
}

// the hero is thrown out of the hole knocked down, and the fall alone never knocks it out
function hurtHero(game, slab, hero) {
  const move = fallMove(game, hero);

  if (move) {
    const attacker = hazardAttacker({ x: slab.x, direction: 1, side: 'enemy' }, 'none');

    applyHit(game, { attacker, target: hero, move, x: hero.x, y: hero.y - 12 });
  }
}

function hauledOut(game, slab, fighter) {
  if (fighter.state === 'ko') {
    return;
  }

  climbOut(game, slab, fighter);
  if (fighter.side === 'player') {
    hurtHero(game, slab, fighter);
  }
}

// everyone on the slab as it gives way falls in; one call over the hole for every raider it took,
// so a crowd dropped at once does not stack its words
export function fallThrough(game, slab, fighters) {
  const raiders = fighters.filter(isRaider);
  const fighting = raiders.some((raider) => raider.state !== 'ko');

  for (const raider of raiders) {
    dropThrough(game, slab, raider);
  }

  for (const fighter of fighters.filter((body) => !isRaider(body))) {
    hauledOut(game, slab, fighter);
  }

  if (fighting) {
    addFloatText(game, { x: slab.x, y: slab.y - 64, text: 'Fell through!', color: COLORS.gold });
  }
}
