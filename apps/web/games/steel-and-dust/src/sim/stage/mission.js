import { isLastMission, missionAt } from '../../data/missions/index.js';

export function missionOf(game) {
  return missionAt(game.missionIndex);
}

export function currentZone(game) {
  return missionOf(game).zones[game.stage.zoneIndex];
}

// a mission ends when its own boss falls; a boss met earlier on the road only opens it
export function isMissionBoss(game, enemy) {
  return enemy.kind === missionOf(game).boss;
}

export function isFinalBoss(game, enemy) {
  return isMissionBoss(game, enemy) && isLastMission(game.missionIndex);
}
