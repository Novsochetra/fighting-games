import { KICK } from '../../../src/data/tuning.js';
import { chainOf } from '../../../src/sim/combos/chains.js';
import { duoPassOf, duoStrikeOf } from '../../../src/sim/combos/duos.js';
import { shotOffersOf } from '../../../src/sim/combos/offers.js';
import { holdTicksOf } from '../../../src/sim/combos/pass-combo.js';
import { opennessOf } from '../../../src/sim/passing.js';
import { goalOf, inBoxOf, midY, progressOf } from '../../../src/sim/pitch.js';
import { canFire, openMoveOf, roleSkillOf } from '../../../src/sim/skills/fire.js';
import { directionTo, distance, dot } from '../../../src/sim/vector.js';

// a full charge is let go a couple of ticks after it is in, so it fires what it charged for
export const FULL = KICK.chargeTicks + 2;

const CLOSING = { gap: 60, ahead: 0.45 };
const STAR_REACH = 420;

// a full charge strikes something now: a special, a combo, a chain or his shot skill
export const hasShotOffer = (match, player) => shotOffersOf(match, player).length > 0;

// straight after his dribble skill, or a skill pass to him, a good player strikes at once: a chain
export const isChaining = (match, player) =>
  match.systems?.chains !== false && chainOf(match, player) !== null;

// a combo of x3 or more: its holder looks for the finisher
export const holdsFinisher = (match, player) =>
  shotOffersOf(match, player).some((option) => option.tag === 'finisher');

const sochetraOf = (match, player) =>
  match.sides[player.team].find((mate) => mate.star === 'sochetra' && mate !== player) ?? null;

// a skill pass to the star when he is ahead and free enough, the pass a good player saves it for
function starTarget(match, player) {
  const star = sochetraOf(match, player);

  if (!star || star.stun > 0 || distance(player, star) > STAR_REACH) {
    return null;
  }

  const ahead = progressOf(match, player.team, star.x) > progressOf(match, player.team, player.x);
  const foes = match.sides[1 - player.team];
  const free = Math.min(...foes.map((foe) => distance(foe, star))) > 30;

  return ahead && free ? star : null;
}

// wide in the last third, a cross for the freest mate in the box
function boxTarget(match, player) {
  const wide = Math.abs(player.y - midY(match)) / match.pitch.width > 0.2;

  if (!wide || progressOf(match, player.team, player.x) < 0.7) {
    return null;
  }

  const mates = match.sides[player.team].filter(
    (mate) => mate !== player && inBoxOf(match, 1 - player.team, mate),
  );

  mates.sort(
    (first, second) =>
      opennessOf(match, second, player.team) - opennessOf(match, first, player.team),
  );

  return mates[0] ?? null;
}

// with the ball: the duo's pass to its striker from the other half, a skill cross into the box,
// or the skill pass that plays the star in
export function skillPassPlan(match, player) {
  const attacking = progressOf(match, player.team, player.x) > 0.5;
  const duo = attacking ? duoPassOf(match, player) : null;

  if (duo) {
    return { holdFor: FULL, aim: directionTo(player, duo.striker) };
  }

  const skill = roleSkillOf(player, ['pass', 'cross']);

  if (!canFire(match, player, skill)) {
    return null;
  }

  const target = skill.play === 'cross' ? boxTarget(match, player) : starTarget(match, player);

  return target ? { holdFor: FULL, aim: directionTo(player, target) } : null;
}

// a star with his dribble skill ready goes past a man coming at him with it
export function runsTwice(match, player) {
  const move = openMoveOf(player, 'dribble');

  if (!canFire(match, player, move)) {
    return false;
  }

  return match.sides[1 - player.team].some(
    (foe) =>
      distance(foe, player) < CLOSING.gap &&
      dot(directionTo(player, foe), player.facing) > CLOSING.ahead,
  );
}

// a duo's ball or a skill cross coming to him is struck first time, as it is meant
export function strikesAsItComes(match, player) {
  const pass = match.ball.skillPass;

  return duoStrikeOf(match, player) !== null || (pass?.cross && pass.receiver === player.index);
}

// building a pass combo, he looks to move the ball on before the hold runs out, when a good pass
// is there
export const keepsComboGoing = (match, player) =>
  match.combo?.team === player.team &&
  match.combo.level === 2 &&
  player.holding > holdTicksOf(match) * 0.5;

export const towardGoal = (match, player) => directionTo(player, goalOf(match, player.team));
