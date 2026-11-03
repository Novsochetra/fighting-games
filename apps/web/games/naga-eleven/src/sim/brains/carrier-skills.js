import { SKILL_AI } from '../../data/skills.js';
import { AI } from '../../data/tuning.js';
import { duoPassOf } from '../combos/duos.js';
import { opensDuel, shotOffersOf } from '../combos/offers.js';
import { chance } from '../random.js';
import { canFire, openMoveOf, roleSkillOf } from '../skills/fire.js';
import { opponentsOf } from '../squad.js';
import { directionTo, distance, dot } from '../vector.js';

// a defender this near and this far in front of him is closing him down
const CLOSING = { gap: 55, ahead: 0.5 };
// he weighs a dribble skill once a man comes at him, not every tick he is there
const LOOK_AGAIN = 45;

function urgeOf(offers) {
  if (offers.some((option) => option.tag === 'finisher')) {
    return SKILL_AI.finisher;
  }

  return offers.some((option) => option.tag === 'duo') ? SKILL_AI.duo : SKILL_AI.shot;
}

// with a full charge's worth on offer the computer strikes it: a finisher most of the time, a
// special or a skill about half
export function withSkillShot(match, player, shot) {
  const offers = shotOffersOf(match, player);

  if (offers.length === 0 || !chance(match.random, urgeOf(offers))) {
    return shot;
  }

  if (match.hooks?.special && opensDuel(offers)) {
    return { ...shot, kind: 'special', power: 1 };
  }

  const role = offers.find((option) => option.family === 'role' && !option.tag);

  return role ? { ...shot, kind: 'skillShot', move: role.move, power: 1 } : shot;
}

// a quarter of his long balls and a good share of his crosses are his skill, with the spirit
export function withSkillPass(match, player, pass) {
  const skill = roleSkillOf(player, [pass.height ? 'cross' : 'pass']);
  const urge = pass.height ? SKILL_AI.cross : SKILL_AI.pass;
  const worth = pass.lofted && canFire(match, player, skill);

  return worth && chance(match.random, urge)
    ? { kind: 'skillPass', move: skill.id, target: pass.target }
    : pass;
}

// the partner of a duo with the striker in reach plays it to him, once as he settles on the ball
export function duoPassDecision(match, player) {
  const duo = player.holding === AI.firstTouchTicks ? duoPassOf(match, player) : null;

  if (!duo || !chance(match.random, SKILL_AI.duo)) {
    return null;
  }

  const skill = roleSkillOf(player, ['pass', 'cross']);

  return { kind: 'skillPass', move: skill?.id ?? null, target: duo.striker.index, duo: duo.duo };
}

const isClosing = (player, other) =>
  distance(player, other) < CLOSING.gap &&
  dot(directionTo(player, other), player.facing) > CLOSING.ahead;

// a star with a dribble move goes past a man coming at him with it now and then
export function burstDecision(match, player) {
  const move = openMoveOf(player, 'dribble');
  const fresh = match.tick - player.dribbleLook > LOOK_AGAIN;

  if (!fresh || !canFire(match, player, move)) {
    return null;
  }

  if (!opponentsOf(match, player).some((other) => isClosing(player, other))) {
    return null;
  }

  player.dribbleLook = match.tick;

  return chance(match.random, SKILL_AI.dribble) ? { kind: 'burst', move: move.id } : null;
}
