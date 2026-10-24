import { CHEST_DROP, RAIDER_DROP } from '../../data/loot.js';
import { isMissionBoss } from '../stage/mission.js';
import { dropChest } from './loot-chest.js';
import { repeatKind, spillPieces } from './loot-pieces.js';
import { lootChance, lootCount } from './loot-random.js';

function purseDrop(game) {
  const kinds = repeatKind('coin', lootCount(game, RAIDER_DROP.coins));
  if (lootChance(game, RAIDER_DROP.gemChance)) {
    kinds.push('gem');
  }
  return kinds;
}

// not every raider pays: most fall with empty pockets
function raiderKinds(game) {
  const kinds = lootChance(game, RAIDER_DROP.chance) ? purseDrop(game) : [];
  if (lootChance(game, RAIDER_DROP.appleChance)) {
    kinds.push('apple');
  }
  return kinds;
}

export function chestContents({ coins, gems, apples }) {
  return [...repeatKind('coin', coins), ...repeatKind('gem', gems), ...repeatKind('apple', apples)];
}

// a raider spills its coins where it falls; a boss leaves a chest that bursts open
export function dropLoot(game, enemy) {
  const middleY = enemy.y - 16 * enemy.scale;
  if (enemy.def.boss) {
    const drop = isMissionBoss(game, enemy) ? CHEST_DROP.missionBoss : CHEST_DROP.midBoss;
    dropChest(game, { x: enemy.x, y: enemy.y, contents: chestContents(drop) });
    return;
  }
  spillPieces(game, { kinds: raiderKinds(game), x: enemy.x, y: middleY, spread: 1.5 });
}
