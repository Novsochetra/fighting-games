import { DUEL_READS, DUEL_STATS, DUELS } from '../../data/duels.js';
import { moveOf } from '../../data/moves.js';
import { clamp } from '../vector.js';

// a special's kind is the kind of option it is; its stats come from that kind, and a combo or a
// chain lifts it by its bonus
export function scoreOf(player, option) {
  const weights = DUEL_STATS[option.kind] ?? {};
  const stats = player.stats ?? {};
  let score = (option.power ?? 0) + (option.bonus ?? 0);

  for (const [stat, share] of Object.entries(weights)) {
    score += (stats[stat] ?? 50) * share;
  }

  return score;
}

export const readOf = (defend, attack) => DUEL_READS[defend.kind]?.[attack.kind] ?? 0;

// the attacker's chance: half and half between equals, tipped by the edge, never certain
export const winChance = (edge) =>
  clamp(0.5 + edge * DUELS.edgeWeight, DUELS.leastChance, DUELS.mostChance);

const isPostSkill = (option) => option.family === 'role' && !moveOf(option.move)?.owner;

// a post's skill stops an ordinary striker's trick, but a star's special or a combo takes a star's
// own answer to stop: against one the post's skill adds nothing, as in the anime the game follows
const outclassed = (attack, defend) =>
  isPostSkill(defend) && (attack.family === 'star' || attack.family === 'combo');

export function attackChance({ attacker, defender, attack, defend, distanceShare = 0 }) {
  const lost = outclassed(attack, defend) ? (defend.power ?? 0) : 0;
  const edge =
    scoreOf(attacker, attack) -
    distanceShare * DUELS.distanceCost -
    (scoreOf(defender, defend) - lost) -
    readOf(defend, attack);

  return winChance(edge);
}

// a strong shooter and a strong move rarely miss the target; a long shot more often does
export function wideChanceOf(shooter, attack, distanceShare) {
  const shot = shooter.stats?.shot ?? 50;
  const chance =
    DUELS.wideChance - (shot - 50) / 600 - (attack.power ?? 0) / 300 + distanceShare * 0.1;

  return clamp(chance, DUELS.leastWide, DUELS.wideChance * 2);
}
