import { SPIRIT } from '../data/tuning.js';
import { sideOf } from './squad.js';
import { byStat, DEFAULT_STAT } from './stats.js';

export const spiritMaxOf = (spec) =>
  spec.spiritMax ?? Math.round(byStat(SPIRIT.max, spec.stats?.stamina ?? DEFAULT_STAT));

export const hasSpirit = (player, cost) => player.spirit >= cost;

export function refillSpirit(player, amount = SPIRIT.refill) {
  player.spirit = Math.min(player.spiritMax, player.spirit + amount);
}

export const fillSpirit = (player) => refillSpirit(player, player.spiritMax);

export function spendSpirit(player, cost) {
  if (!hasSpirit(player, cost)) {
    return false;
  }

  player.spirit -= cost;

  return true;
}

// good play fills the gauge of the one who plays it, and each star of his side takes a share of
// it, so a side that plays well wakes its stars (README "Spirit"); `gain` is a SPIRIT.gain key or
// a number of points
export function gainSpirit(match, player, gain) {
  const points = typeof gain === 'number' ? gain : (SPIRIT.gain[gain] ?? 0);

  if (!player || points <= 0) {
    return;
  }

  refillSpirit(player, points);

  for (const mate of sideOf(match, player.team)) {
    if (mate !== player && mate.star) {
      refillSpirit(mate, points * SPIRIT.starShare);
    }
  }
}

// a goal against stirs every star of the side that let it in
export function concedeSpirit(match, team) {
  for (const player of sideOf(match, team)) {
    if (player.star) {
      refillSpirit(player, SPIRIT.conceded);
    }
  }
}
