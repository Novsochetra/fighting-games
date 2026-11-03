import { moveOf } from '../../data/moves.js';
import { SKILL_RULES } from '../../data/skills.js';
import { startChain } from '../combos/chains.js';
import { pushEvent } from '../events.js';

export const skillsOn = (match) => match.systems?.roleSkills !== false;

// his own skill, then a star's own moves
export const ownMovesOf = (player) =>
  [player.skill, ...(player.moves ?? [])].map(moveOf).filter(Boolean);

// the move he plays this way in the open (a dribble, a save, a tackle), or null
export const openMoveOf = (player, play) =>
  ownMovesOf(player).find((move) => move.play === play) ?? null;

// his role skill when it plays one of these ways (a star's shots are specials, for the duel)
export function roleSkillOf(player, plays) {
  const skill = moveOf(player.skill);

  return skill && plays.includes(skill.play) ? skill : null;
}

export const isRested = (player) => (player.cooldown ?? 0) <= 0;

export function canFire(match, player, move, cost = move?.cost ?? 0) {
  return (
    Boolean(move) &&
    skillsOn(match) &&
    isRested(player) &&
    (player.stun ?? 0) === 0 &&
    (player.spirit ?? 0) >= cost
  );
}

export function rest(player) {
  player.cooldown = SKILL_RULES.cooldown;
}

// a skill in the open: paid, waited out after, its name over him; a dribble or pass skill starts a
// chain for whoever is to strike next
export function fireSkill(match, player, move, { receiver = player.index, cost = move.cost } = {}) {
  player.spirit = Math.max(0, player.spirit - cost);
  rest(player);
  pushEvent(match, { type: 'skill', player: player.index, move: move.id });
  startChain(match, player, move, receiver);
}
