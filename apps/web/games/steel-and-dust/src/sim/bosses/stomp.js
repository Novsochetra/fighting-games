import { FX_COLORS } from '../../art/fx-colors.js';
import { floorUnder } from '../fighters/terrain-motion.js';
import { shake } from '../fx/camera-fx.js';
import { addDust, addSparks } from '../fx/particles.js';

// his walk strip sets a foot down twice a loop (8 frames, 6 ticks each)
const STRIDE = 24;
// his feet, either side of where he stands, in his own units (body-point.js)
const FOOT = 12;

const footX = (boss, step) => boss.x + (step % 2 ? FOOT : -FOOT) * boss.scale;

// the foot that last came down as he walks, where it is, and how many ticks ago it fell (never,
// before his first)
export function lastFootfall(boss) {
  const stride = boss.ai.stride ?? 0;
  const since = stride < STRIDE ? Infinity : stride % STRIDE;
  return { x: footX(boss, Math.floor(stride / STRIDE)), since };
}

// each footfall of a colossus shakes the road and kicks up dust; once he has reformed, gold sparks
// fly from the stone too
export function stomp(game, boss) {
  const ai = boss.ai;
  ai.stride = (ai.stride ?? 0) + 1;
  if (ai.stride % STRIDE !== 0) {
    return;
  }
  const y = floorUnder(game.terrain, boss);
  const x = footX(boss, ai.stride / STRIDE);
  addDust(game, { x, y, count: 4, color: FX_COLORS.rootDust });
  if (boss.glowing) {
    addSparks(game, { x, y: y - 4, count: 3, color: FX_COLORS.gazeGold, speed: 1.4 });
  }
  shake(game, 1, 6);
  game.io.sfx('land', false, { x, vol: 0.5 });
}
