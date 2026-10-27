import { COLORS } from '../../art/colors.js';
import { bossHpOn } from '../../data/boss-toughness.js';
import { createFighter } from '../fighters/create-fighter.js';
import { screenEdges } from '../fighters/arena-bounds.js';
import { shake } from '../fx/camera-fx.js';
import { showBanner } from '../fx/effects.js';
import { refreshPose } from '../pose/refresh-pose.js';
import { isFinalBoss, isMissionBoss } from './mission.js';
import { groundAt, waterBetween } from './terrain.js';

// a raider walks in from this far outside the screen to this far inside it (arena-bounds.js)
const ENTRY_OUTSIDE = 18;
const ENTRY_INSIDE = 10;

function bossTitle(game, boss) {
  if (isFinalBoss(game, boss)) {
    return 'Final boss';
  }
  return isMissionBoss(game, boss) ? 'Boss' : 'Mid-boss';
}

function growBossHp(game, boss) {
  const hp = bossHpOn(game.missionIndex, boss.def.hp);
  Object.assign(boss, { hp, maxHp: hp, hpLag: hp });
}

function entryX(game, side) {
  const { left, right } = screenEdges(game);

  return side < 0 ? left - ENTRY_OUTSIDE : right + ENTRY_OUTSIDE;
}

// a raider never walks in over a moat: one due in across the water comes in from the other side
function entrySide(game, side) {
  const x = entryX(game, side);
  const path = ENTRY_OUTSIDE + ENTRY_INSIDE;
  const [from, to] = side < 0 ? [x, x + path] : [x - path, x];

  return waterBetween(game.terrain, from, to) ? -side : side;
}

export function spawnEnemy(game, kind, side) {
  const from = entrySide(game, side);
  const x = entryX(game, from);
  const enemy = createFighter('enemy', kind, x, groundAt(game.terrain, x));
  enemy.facing = from < 0 ? 1 : -1;
  enemy.entering = true;
  enemy.state = 'walk';
  refreshPose(enemy);
  game.fighters.push(enemy);
  if (enemy.def.boss) {
    growBossHp(game, enemy);
    game.boss = enemy;
    showBanner(game, {
      text: enemy.def.name,
      color: COLORS.red,
      time: 140,
      sub: bossTitle(game, enemy),
    });
    game.io.sfx('boom');
    shake(game, 3, 20);
  }
}
