// shockwaves and thrown things hit through a stand-in attacker that has only what applyHit reads
export function hazardAttacker(hazard, weaponId) {
  return {
    x: hazard.x,
    facing: hazard.direction,
    side: hazard.side,
    airborne: false,
    moveTime: 0,
    hitstop: 0,
    hitConfirmed: false,
    airHits: 9,
    weapon: { id: weaponId },
  };
}
