import { GROUND_Y } from '../../config.js';
import { activeEnd } from '../../data/moves/define-move.js';
import { shake } from '../fx/camera-fx.js';
import { addDust } from '../fx/particles.js';
import { spawnShockwave } from '../hazards/shockwaves.js';
import { endMove } from './actions.js';

function landFromJump(game, fighter) {
  fighter.state = 'idle';
  fighter.airHits = 0;
  fighter.landedAt = fighter.animTime;
  addDust(game, { x: fighter.x, y: GROUND_Y, count: 3 });
  game.io.sfx('land');
}

function landFromAttack(game, fighter) {
  const move = fighter.move;
  fighter.airHits = 0;
  if (move && move.dive) {
    fighter.moveTime = activeEnd(move);
    fighter.vx = 0;
    shake(game, move.shockwave ? 3 : 1, 6);
    addDust(game, { x: fighter.x, y: GROUND_Y, count: 8 });
    if (move.shockwave) {
      spawnShockwave(game, fighter);
    }
    game.io.sfx(move.shockwave ? 'heavy' : 'land');
  } else if (move && move.aerial) {
    endMove(game, fighter);
    addDust(game, { x: fighter.x, y: GROUND_Y, count: 3 });
  }
}

function landFromJuggle(game, fighter) {
  if (fighter.groundBounce && !fighter.groundBounceUsed) {
    Object.assign(fighter, { groundBounceUsed: true, groundBounce: false, vy: -3.4 });
    fighter.vx *= 0.5;
    Object.assign(fighter, { airborne: true, y: GROUND_Y - 1 });
    shake(game, 2, 6);
    addDust(game, { x: fighter.x, y: GROUND_Y, count: 10 });
    game.io.sfx('heavy');
    return;
  }
  fighter.state = 'down';
  fighter.stateTime = 0;
  fighter.vx *= 0.4;
  addDust(game, { x: fighter.x, y: GROUND_Y, count: 8 });
  game.io.sfx('land');
  shake(game, 1, 4);
}

function landKnockedOut(game, fighter) {
  if (fighter.koBounced) {
    fighter.vx = 0;
    return;
  }
  Object.assign(fighter, { koBounced: true, vy: -1.8, airborne: true, y: GROUND_Y - 1 });
  addDust(game, { x: fighter.x, y: GROUND_Y, count: 8 });
}

const LANDING_BY_STATE = {
  air: landFromJump,
  attack: landFromAttack,
  juggle: landFromJuggle,
  ko: landKnockedOut,
};

export function land(game, fighter) {
  const landing = LANDING_BY_STATE[fighter.state];
  if (landing) {
    landing(game, fighter);
  }
}
