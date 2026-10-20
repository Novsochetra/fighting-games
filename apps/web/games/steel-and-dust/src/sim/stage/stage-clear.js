import { COLORS } from '../../art/colors.js';
import { isLastMission } from '../../data/missions/index.js';
import { commitScore, endCombo } from '../combat/combo.js';
import { knockOut } from '../combat/knock-out.js';
import { showBanner } from '../fx/effects.js';
import { buzz } from '../fx/haptics.js';

export const BANNER_FOREVER = 9999;
export const CLEAR_TICKS = 170;

export function stageClear(game) {
  game.clearTime = 1;
  game.slowMotion = 60;
  for (const enemy of game.fighters) {
    if (enemy.side === 'enemy' && enemy !== game.boss && enemy.state !== 'ko') {
      knockOut(game, enemy, enemy.x < game.player.x ? -1 : 1);
    }
  }
  const text = isLastMission(game.missionIndex) ? 'All clear' : 'Mission complete';
  showBanner(game, { text, color: COLORS.amber, time: BANNER_FOREVER });
  game.io.sfx('clear');
  endCombo(game);
  commitScore(game);
  buzz(game, [40, 60, 40, 60, 120]);
}
