// an ultimate is made to clear a crowd, and a boss standing alone takes every blow of it; two
// banked ultimates took the first boss nearly to nothing, so a boss takes only this share
export const BOSS_ULT_SHARE = 0.5;
// each road's bosses carry this much more of their health than the road before's, so a boss met
// again on a later road is tougher too
export const BOSS_HP_GROWTH = 0.04;

export function bossHpOn(missionIndex, baseHp) {
  return Math.round(baseHp * (1 + BOSS_HP_GROWTH * missionIndex));
}

// kept exact, not rounded: most ultimate blows are 2 to 4, and rounding each one would leave a
// boss more than half of some ultimates
export function ultDamageToBoss(damage) {
  return damage * BOSS_ULT_SHARE;
}
