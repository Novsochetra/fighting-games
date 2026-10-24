import { COLORS } from '../../art/colors.js';
import { LOOT_TIME } from '../../data/loot.js';
import { commitScore, endCombo } from '../combat/combo.js';
import { knockOut } from '../combat/knock-out.js';
import { screenEdges } from '../fighters/arena-bounds.js';
import { showBanner } from '../fx/effects.js';
import { stageClear } from './stage-clear.js';

// once the mission's boss is down nothing fights on: the hero first fetches the loot (lootTime),
// then the clear card and the summary of the loot play (clearTime)
export function isFightOver(game) {
  return game.lootTime > 0 || game.clearTime > 0;
}

// every raider still standing falls with the boss and none come after, so the road is the hero's
export function startLootTime(game, boss) {
  game.lootTime = 1;
  game.slowMotion = 60;
  game.stage.spawnQueue = [];
  for (const enemy of game.fighters) {
    if (enemy.side === 'enemy' && enemy.state !== 'ko') {
      knockOut(game, enemy, enemy.x < game.player.x ? -1 : 1);
    }
  }
  const text = `${boss.def.name} down`;
  showBanner(game, { text, sub: 'Grab the loot', color: COLORS.gold, time: 120 });
  endCombo(game);
  commitScore(game);
}

function piecesInReach(game) {
  const { left, right } = screenEdges(game);
  return game.loot.some((piece) => piece.x >= left && piece.x <= right);
}

function isBare(game) {
  return !game.chests.some((chest) => !chest.spilled) && !piecesInReach(game);
}

// with the road bare, every piece taken or blinked out, the loot time runs on only a short beat
function shortenWhenBare(game) {
  if (isBare(game)) {
    game.lootTime = Math.max(game.lootTime, LOOT_TIME.limit - LOOT_TIME.settle);
  }
}

// it waits while the continue menu is up; what it ends with still lying, off screen, is lost
export function updateLootTime(game) {
  if (!game.lootTime || game.mode !== 'play') {
    return;
  }
  shortenWhenBare(game);
  if (++game.lootTime < LOOT_TIME.limit) {
    return;
  }
  game.lootTime = 0;
  game.loot = [];
  game.chests = game.chests.filter((chest) => chest.spilled);
  stageClear(game);
}
