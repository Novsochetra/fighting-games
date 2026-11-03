import { PASS_COMBO } from '../../data/combos.js';
import { moveOf } from '../../data/moves.js';
import { WORLD_KITS } from '../../data/skills.js';
import { KICK } from '../../data/tuning.js';

const canPay = (player, move) => Boolean(move) && (player.spirit ?? 0) >= move.cost;

// the finisher a full-charge SHOOT plays for the holder of a combo of x3 or more, free
function finisherFor(match, player) {
  const { combo } = match;

  if (!combo || combo.team !== player.team || combo.holder !== player.index) {
    return null;
  }

  if (combo.level < PASS_COMBO.finisherFrom) {
    return null;
  }

  const style = WORLD_KITS.includes(match.teams?.[player.team]?.kit) ? 'world' : 'khmer';
  const finishers = PASS_COMBO.finishers[style];

  return combo.level >= PASS_COMBO.most ? finishers[PASS_COMBO.most] : finishers[3];
}

function strongestShot(player) {
  const shots = (player.moves ?? [])
    .map(moveOf)
    .filter((move) => move?.kind === 'shot' && canPay(player, move));

  return shots.sort((first, second) => second.power - first.power)[0]?.id ?? null;
}

const skillFor = (player, plays) => {
  const skill = moveOf(player.skill);

  return skill && plays.includes(skill.play) && canPay(player, skill) ? skill.id : null;
};

// the move a full charge would fire if the button were let go now, or null: the charge is full,
// the player is not waiting out a skill, and the spirit is there (README "On the pitch")
export function readyMoveOf(match, player) {
  if (!player.charging || (player.charge ?? 0) < KICK.chargeTicks || (player.cooldown ?? 0) > 0) {
    return null;
  }

  if (player.charging === 'pass') {
    return skillFor(player, ['pass', 'cross']);
  }

  return finisherFor(match, player) ?? strongestShot(player) ?? skillFor(player, ['shot']);
}
