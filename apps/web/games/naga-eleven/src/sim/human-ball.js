import { SKILL_RULES } from '../data/skills.js';
import { KICK } from '../data/tuning.js';
import { stickAimY } from './aim.js';
import { duoPassOf } from './combos/duos.js';
import { opensDuel, shotOffersOf } from './combos/offers.js';
import { isHeld, wasPressed } from './input-state.js';
import { firstTimePassOf } from './receiving.js';
import { canFire, openMoveOf, roleSkillOf } from './skills/fire.js';
import { lengthOf } from './vector.js';

// a press starts a charge, holding fills it, and letting go is the kick: true on that tick, the
// charge kept for the kick to read
export function letGoOf(match, player, button) {
  const { input } = match;

  if (wasPressed(input, button) && player.charging === null) {
    Object.assign(player, { charging: button, charge: 1 });

    return false;
  }

  if (player.charging !== button) {
    return false;
  }

  if (isHeld(input, button)) {
    player.charge = Math.min(player.charge + 1, KICK.chargeTicks);

    return false;
  }

  player.charging = null;

  return true;
}

const isFull = (player) => player.charge >= KICK.chargeTicks;

const aimOf = (player, stick) => (lengthOf(stick.x, stick.y) > 0 ? stick : player.facing);

// a tap passes along the grass, a held pass goes in the air, further the longer it was held
export function passOnLetGo(player, stick, lofted) {
  return {
    kind: 'pass',
    aim: aimOf(player, stick),
    lofted,
    power: player.charge / KICK.chargeTicks,
  };
}

// a full-charge PASS with the spirit for it is his pass or cross skill, not the longest ball; with
// a duo's striker in reach it is the duo's pass to him
function skillPassOnLetGo(match, player, stick) {
  const skill = roleSkillOf(player, ['pass', 'cross']);
  const duo = duoPassOf(match, player);

  if (duo) {
    return { kind: 'skillPass', move: skill?.id ?? null, target: duo.striker.index, duo: duo.duo };
  }

  return canFire(match, player, skill)
    ? { kind: 'skillPass', move: skill.id, aim: aimOf(player, stick) }
    : null;
}

// a full charge strikes what is on offer: the keeper duel for a special, a combo or a chain, else
// his role shot skill in the open, else the shot it was charged as
function shotOnLetGo(match, player, stick) {
  const power = player.charge / KICK.chargeTicks;
  const aimY = stickAimY(match, player, stick);
  const offers = isFull(player) ? shotOffersOf(match, player) : [];
  const role = offers.find((option) => option.family === 'role' && !option.tag);

  if (match.hooks?.special && opensDuel(offers)) {
    return { kind: 'special', power, aimY };
  }

  return role
    ? { kind: 'skillShot', move: role.move, power, aimY }
    : { kind: 'shoot', power, aimY };
}

// two presses of RUN close together with the ball play a star's dribble move
function runTwice(match, player) {
  if (!wasPressed(match.input, 'sprint')) {
    return null;
  }

  const twice = match.tick - match.runTap <= SKILL_RULES.doubleTap;
  const move = twice ? openMoveOf(player, 'dribble') : null;

  match.runTap = twice ? -Infinity : match.tick;

  return canFire(match, player, move) ? { kind: 'burst', move: move.id } : null;
}

function passAction(match, player, stick) {
  if (isFull(player)) {
    return skillPassOnLetGo(match, player, stick) ?? passOnLetGo(player, stick, true);
  }

  return passOnLetGo(player, stick, player.charge >= KICK.loftFrom);
}

export function withBall(match, player, stick) {
  const action = firstTimePassOf(player, stick) ?? runTwice(match, player);

  if (action) {
    return action;
  }

  if (letGoOf(match, player, 'pass')) {
    return passAction(match, player, stick);
  }

  return letGoOf(match, player, 'shoot') ? shotOnLetGo(match, player, stick) : null;
}

// at a restart the taker stands still: a tap plays it short, a held pass or shoot long
export function restartAction(match, player, stick) {
  if (letGoOf(match, player, 'pass')) {
    return passOnLetGo(player, stick, player.charge >= KICK.loftFrom);
  }

  return letGoOf(match, player, 'shoot') ? passOnLetGo(player, stick, true) : null;
}
