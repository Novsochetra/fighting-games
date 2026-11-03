import { DUEL_AFTERMATH } from '../../data/duels.js';
import { nextRandom } from '../random.js';
import { ballAtFeet, faceGoal, floor, looseBall, rollTo, touched } from './aftermath.js';
import { pushEvent } from './events.js';
import { attackSign, keepOnPitch } from './geometry.js';

const AFTER = DUEL_AFTERMATH;

// the dribbler comes out past the defender, who is left on the grass
function broke(match, { attacker, defender }) {
  attacker.x = defender.x + attackSign(attacker.team) * AFTER.pastGap;
  keepOnPitch(match, attacker);
  faceGoal(attacker);
  floor(defender, AFTER.floored);
  ballAtFeet(match, attacker);
  pushEvent(match, { type: 'tackle', player: defender.index, target: attacker.index, won: false });
}

function stolen(match, { attacker, defender }) {
  faceGoal(defender);
  floor(attacker, AFTER.shaken);
  ballAtFeet(match, defender);
  pushEvent(match, { type: 'tackle', player: defender.index, target: attacker.index, won: true });
}

function passed(match, { attacker, defender, receiver }) {
  const mate = receiver ?? attacker;

  rollTo(match, match.ball, mate);
  touched(match, attacker, { kick: 'pass' });
  mate.receiving = 60;
  attacker.noPickup = AFTER.passerPause;
  attacker.lastKick = match.tick;
  floor(defender, AFTER.beaten);
  pushEvent(match, { type: 'pass', player: attacker.index });
}

function cut(match, { attacker, defender }) {
  faceGoal(defender);
  attacker.noPickup = AFTER.shaken;
  attacker.lastKick = match.tick;
  ballAtFeet(match, defender);
}

// the shot comes off the defender, back the way it came and off to a side
function blocked(match, { attacker, defender, move }) {
  const back = -attackSign(attacker.team);
  const across = nextRandom(match.random) - 0.5;

  looseBall(match, {
    x: defender.x + back * 12,
    y: defender.y,
    height: 2,
    vx: back * AFTER.blockSpeed,
    vy: across * AFTER.blockSpeed * 1.4,
    vz: 1.5,
  });
  touched(match, defender);
  attacker.noPickup = AFTER.shaken;
  attacker.lastKick = match.tick;
  defender.noPickup = 8;
  pushEvent(match, { type: 'shot', player: attacker.index, power: 1, move });
}

export const FIELD_APPLIERS = { broke, stolen, passed, cut, blocked };
