import { BOSS_ULT_COLORS } from '../../art/boss-colors.js';
import { bodyPoint } from '../fighters/body-point.js';
import { shake } from '../fx/camera-fx.js';
import { addFloatText, addRing } from '../fx/effects.js';

// its chest and the air over its head, in its own units (body-point.js)
const CHEST = { ahead: 6, up: 26 };
const ABOVE_HEAD = { up: 56 };

// a boss calls its ultimate by name as it gathers itself, so the player knows what is coming
export function announceBossUltimate(game, boss, move) {
  const colors = BOSS_ULT_COLORS[boss.kind];
  addRing(game, { ...bodyPoint(boss, CHEST), color: colors.ring, big: true });
  addFloatText(game, { ...bodyPoint(boss, ABOVE_HEAD), text: move.name, color: colors.title });
  shake(game, 3, 20);
  game.io.sfx('bossUltimate', false, { x: boss.x });
}
