import { CAMPFIRE, CAMPFIRE_SINGE } from '../../data/campfires.js';
import { applyHit } from '../combat/apply-hit.js';
import { hurtBox, overlaps } from '../combat/boxes.js';
import { igniteTarget } from '../summons/burn.js';
import { hazardAttacker } from './hazard-attacker.js';

export function createCampfires(campfires) {
  return campfires.map(({ x, y }) => ({ x, y, singe: 0 }));
}

export function flameBox(fire) {
  return {
    x: fire.x - CAMPFIRE.halfWidth,
    y: fire.y - CAMPFIRE.height,
    width: CAMPFIRE.halfWidth * 2,
    height: CAMPFIRE.height,
  };
}

function singe(game, fire, hero) {
  const attacker = hazardAttacker({ x: fire.x, direction: 1, side: 'enemy' }, 'none');

  applyHit(game, { attacker, target: hero, move: CAMPFIRE_SINGE, x: hero.x, y: hero.y - 12 });
  fire.singe = CAMPFIRE.singeEvery;
}

function burn(game, fire, fighter) {
  if (fighter.side !== 'player') {
    igniteTarget(game, fighter, CAMPFIRE.burn);
  } else if (fire.singe === 0) {
    singe(game, fire, fighter);
  }
}

// raiders walking in from off screen are not in the fight yet
function inTheFlames(fire, fighter) {
  const body = hurtBox(fighter);

  return Boolean(body) && !fighter.entering && overlaps(flameBox(fire), body);
}

export function updateCampfires(game) {
  for (const fire of game.campfires) {
    fire.singe = Math.max(0, fire.singe - 1);
    for (const fighter of game.fighters.slice()) {
      if (inTheFlames(fire, fighter)) {
        burn(game, fire, fighter);
      }
    }
  }
}
