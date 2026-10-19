import { COLORS } from '../../art/colors.js';
import { HUD_COLORS } from '../../art/hud-colors.js';
import { drawText } from '../text/draw-text.js';

// raiders flash a "!" during the wind-up so the player can react
export function drawWindupWarning(painter, fighter, tickCount) {
  const move = fighter.move;
  if (fighter.state !== 'attack' || fighter.moveTime >= Math.min(12, move.startup)) {
    return;
  }
  drawText(painter, '!', {
    x: fighter.joints.head.x,
    y: fighter.joints.head.y - 12 * fighter.scale,
    color: (tickCount >> 1) & 1 ? COLORS.gold : COLORS.red,
    scale: fighter.def.boss ? 2 : 1,
    align: 'center',
  });
}

export function drawEnemyHealth(painter, fighter) {
  if (fighter.def.boss || fighter.hpBarTime <= 0 || fighter.state === 'ko') {
    return;
  }
  const x = Math.round(fighter.x - 10);
  const y = Math.round(fighter.y - 46);
  painter.use(COLORS.outline).rect(x - 1, y - 1, 22, 5);
  painter.use(HUD_COLORS.barTrough).rect(x, y, 20, 3);
  painter.use(HUD_COLORS.barLag).rect(x, y, Math.ceil((20 * fighter.hpLag) / fighter.maxHp), 3);
  painter.use(COLORS.red).rect(x, y, Math.ceil((20 * fighter.hp) / fighter.maxHp), 3);
  painter.use(COLORS.coral).rect(x, y, Math.ceil((20 * fighter.hp) / fighter.maxHp), 1);
}
