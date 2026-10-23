import { BOSS_ULT_COLORS } from '../../art/boss-colors.js';
import { FX_COLORS } from '../../art/fx-colors.js';
import { bodyPoint, bodySize } from '../fighters/body-point.js';
import { floorUnder } from '../fighters/terrain-motion.js';
import { shake } from '../fx/camera-fx.js';
import { addFloatText, addRing } from '../fx/effects.js';
import { addDust, addSparks } from '../fx/particles.js';
import { addBurst } from '../summons/bursts.js';

// his chest, the air over his head and the size of the rubble he falls into, in his own units
export const CHEST = { ahead: 2, up: 24 };
const ABOVE_HEAD = { up: 50 };
const RUBBLE_SIZE = 0.8;

// at half health the guardian falls to rubble with a crash
export function collapse(game, boss) {
  const y = floorUnder(game.terrain, boss);
  addBurst(game, { sprite: 'rockBurst', x: boss.x, y, scale: bodySize(boss, RUBBLE_SIZE) });
  addDust(game, { x: boss.x, y, count: 18, color: FX_COLORS.rootDust });
  shake(game, 6, 30);
  game.io.sfx('crumble', false, { x: boss.x });
}

// and builds himself back up out of it, glowing gold from then on
export function reform(game, boss) {
  boss.glowing = true;
  const chest = bodyPoint(boss, CHEST);
  addRing(game, { ...chest, color: FX_COLORS.gazeGold, big: true });
  addSparks(game, { ...chest, count: 24, color: FX_COLORS.gazeGold, speed: 3.4 });
  const color = BOSS_ULT_COLORS[boss.kind].title;
  addFloatText(game, { ...bodyPoint(boss, ABOVE_HEAD), text: 'Awakened!', color });
  shake(game, 4, 16);
  game.io.sfx('reform', false, { x: boss.x });
}
