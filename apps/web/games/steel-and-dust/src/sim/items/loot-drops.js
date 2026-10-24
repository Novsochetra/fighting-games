import { CHEST_DROP, LOOT_VALUES, RAIDER_DROP } from '../../data/loot.js';
import { isMissionBoss } from '../stage/mission.js';
import { dropChest } from './loot-chest.js';
import { addToPurse, repeatKind, spillPieces } from './loot-pieces.js';
import { lootChance, lootCount } from './loot-random.js';

function raiderKinds(game) {
  const kinds = repeatKind('coin', lootCount(game, RAIDER_DROP.coins));
  if (lootChance(game, RAIDER_DROP.gemChance)) {
    kinds.push('gem');
  }
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

// what is still on the road or in a chest when the road ends goes into the purse, apples aside
export function bankLeftovers(game) {
  const pieces = game.loot.filter((piece) => !piece.taken).map((piece) => piece.kind);
  const unspilled = game.chests
    .filter((chest) => !chest.spilled)
    .flatMap((chest) => chest.contents);
  for (const kind of [...pieces, ...unspilled]) {
    if (LOOT_VALUES[kind].coins) {
      addToPurse(game, kind);
    }
  }
  game.loot = [];
  game.chests = [];
}
