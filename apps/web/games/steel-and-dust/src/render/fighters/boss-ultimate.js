import { BOSS_ULT_COLORS } from '../../art/boss-colors.js';
import { VIEW_HEIGHT, VIEW_WIDTH } from '../../config.js';

export function isBossUltimate(fighter) {
  const move = fighter.move;
  return (
    fighter.state === 'attack' &&
    Boolean(move?.bossUltimate) &&
    fighter.moveTime < move.startup + move.active
  );
}

// the world dims behind a boss loosing its ultimate, deepest while it gathers itself
export function dimForBossUltimate(painter, fighter, cameraX) {
  const gathering = fighter.moveTime < fighter.move.startup;
  painter
    .alpha(gathering ? 0.5 : 0.3)
    .use(BOSS_ULT_COLORS[fighter.kind].dim)
    .rect(cameraX - 8, -8, VIEW_WIDTH + 16, VIEW_HEIGHT + 16);
  painter.alpha(1);
}
