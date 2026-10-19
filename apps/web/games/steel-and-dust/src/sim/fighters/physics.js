import { GROUND_Y } from '../../config.js';
import { shake } from '../fx/camera-fx.js';
import { addDust } from '../fx/particles.js';
import { arenaBounds } from './arena-bounds.js';
import { land } from './landing.js';

function wallHit(game, fighter, side) {
  if (fighter.state === 'juggle' && Math.abs(fighter.vx) > 2.4 && !fighter.wallBounced) {
    fighter.wallBounced = true;
    fighter.vx = -fighter.vx * 0.45;
    fighter.vy = Math.min(fighter.vy, -2.2);
    shake(game, 2, 6);
    addDust(game, { x: fighter.x + side * 4, y: fighter.y - 12, count: 6 });
    game.io.sfx('blunt');
  } else if (side * fighter.vx > 0) {
    fighter.vx = 0;
  }
}

function applyGravity(fighter) {
  if (!fighter.airborne && fighter.y < GROUND_Y - 0.5) {
    fighter.airborne = true;
    if (fighter.state === 'idle' || fighter.state === 'walk') {
      fighter.state = 'air';
    }
  }
  if (fighter.airborne) {
    const tumbling = fighter.state === 'juggle' || fighter.state === 'ko';
    fighter.vy = Math.min(7, fighter.vy + (tumbling ? 0.26 : 0.3));
    if (fighter.state === 'juggle') {
      fighter.vx *= 0.985;
    }
  }
}

function keepsMomentum(fighter) {
  const rushing =
    fighter.state === 'attack' && fighter.move && fighter.move.sustain && fighter.hitboxActive;
  return fighter.airborne || fighter.state === 'walk' || fighter.state === 'dash' || rushing;
}

function applyFriction(fighter) {
  if (keepsMomentum(fighter)) {
    return;
  }
  fighter.vx *= 0.8;
  if (Math.abs(fighter.vx) < 0.05) {
    fighter.vx = 0;
  }
}

function touchGround(game, fighter) {
  if (fighter.y < GROUND_Y) {
    return;
  }
  fighter.y = GROUND_Y;
  fighter.vy = 0;
  if (fighter.airborne) {
    Object.assign(fighter, { airborne: false, airDashUsed: false, pogoCount: 0 });
    land(game, fighter);
  }
}

function stayInBounds(game, fighter) {
  const bounds = arenaBounds(game, fighter);
  if (fighter.x < bounds.min) {
    wallHit(game, fighter, -1);
    fighter.x = bounds.min;
  } else if (fighter.x > bounds.max) {
    wallHit(game, fighter, 1);
    fighter.x = bounds.max;
  }
}

// the ultimate places the hero itself
export function applyPhysics(game, fighter) {
  if (fighter.state === 'ult') {
    return;
  }
  applyGravity(fighter);
  fighter.x += fighter.vx;
  fighter.y += fighter.vy;
  applyFriction(fighter);
  touchGround(game, fighter);
  stayInBounds(game, fighter);
}
