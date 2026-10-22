import { BOSS_ULT_COLORS } from '../../art/boss-colors.js';
import { shake } from '../fx/camera-fx.js';
import { addFloatText, addRing } from '../fx/effects.js';

// a boss calls its ultimate by name as it gathers itself, so the player knows what is coming
export function announceBossUltimate(game, boss, move) {
  const colors = BOSS_ULT_COLORS[boss.kind];
  const chest = { x: boss.x + boss.facing * 6, y: boss.y - 26 };
  addRing(game, { ...chest, color: colors.ring, big: true });
  addFloatText(game, { x: boss.x, y: boss.y - 56, text: move.name, color: colors.title });
  shake(game, 3, 20);
  game.io.sfx('bossUltimate', false, { x: boss.x });
}
