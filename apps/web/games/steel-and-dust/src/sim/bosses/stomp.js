import { FX_COLORS } from '../../art/fx-colors.js';
import { floorUnder } from '../fighters/terrain-motion.js';
import { shake } from '../fx/camera-fx.js';
import { addDust, addSparks } from '../fx/particles.js';

// his walk strip sets a foot down twice a loop (8 frames, 6 ticks each)
const STRIDE = 24;
// his feet, either side of where he stands, in his own units (body-point.js)
const FOOT = 12;

// each footfall of a colossus shakes the road and kicks up dust; once he has reformed, gold sparks
// fly from the stone too
export function stomp(game, boss) {
  const ai = boss.ai;
  ai.stride = (ai.stride ?? 0) + 1;
  if (ai.stride % STRIDE !== 0) {
    return;
  }
  const y = floorUnder(game.terrain, boss);
  const x = boss.x + ((ai.stride / STRIDE) % 2 ? FOOT : -FOOT) * boss.scale;
  addDust(game, { x, y, count: 4, color: FX_COLORS.rootDust });
  if (boss.glowing) {
    addSparks(game, { x, y: y - 4, count: 3, color: FX_COLORS.gazeGold, speed: 1.4 });
  }
  shake(game, 1, 6);
  game.io.sfx('land', false, { x, vol: 0.5 });
}
