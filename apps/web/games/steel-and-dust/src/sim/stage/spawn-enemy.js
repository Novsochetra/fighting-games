import { COLORS } from '../../art/colors.js';
import { createFighter } from '../fighters/create-fighter.js';
import { screenEdges } from '../fighters/arena-bounds.js';
import { shake } from '../fx/camera-fx.js';
import { showBanner } from '../fx/effects.js';
import { refreshPose } from '../pose/refresh-pose.js';
import { isFinalBoss, isMissionBoss } from './mission.js';

function bossTitle(game, boss) {
  if (isFinalBoss(game, boss)) {
    return 'Final boss';
  }
  return isMissionBoss(game, boss) ? 'Boss' : 'Mid-boss';
}

export function spawnEnemy(game, kind, side) {
  const { left, right } = screenEdges(game);
  const enemy = createFighter('enemy', kind, side < 0 ? left - 18 : right + 18);
  enemy.facing = side < 0 ? 1 : -1;
  enemy.entering = true;
  enemy.state = 'walk';
  refreshPose(enemy);
  game.fighters.push(enemy);
  if (enemy.def.boss) {
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
