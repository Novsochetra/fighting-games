import { GROUND_Y } from '../../../config.js';
import { emitterSpots } from './emitters.js';
import { isOnScreen, trait, wrapX } from './motion.js';

const SALT = 17000;
const GRAVITY = 0.05;
// a spark falling faster than this draws as a short streak
const STREAK_SPEED = 0.9;

// the sparks of one shower are born across its first `burst` ticks; the shower number gives each
// shower its own spray, and each spout starts its showers at its own moment
function sparkAt(spot, { spark, tick, effect }) {
  const clock = tick + spot.index * 53;
  const shower = Math.floor(clock / effect.period);
  const age = wrapX(clock, effect.period) - Math.floor((spark * effect.burst) / effect.count);
  const seed = (spot.index * 97 + shower) * 131 + spark + SALT;
  const life = 26 + Math.floor(trait(seed, 1) * 30);
  if (age < 0 || age >= life) {
    return null;
  }
  const speedX = (trait(seed, 2) - 0.5) * 2.2;
  const speedY = -0.2 - trait(seed, 3) * 0.9 + GRAVITY * age;
  return {
    x: spot.x + speedX * age,
    y: spot.y + (speedY - (GRAVITY * age) / 2) * age,
    progress: age / life,
    streak: speedY > STREAK_SPEED,
  };
}

// a fresh spark carries a faint halo of its own light, so a single pixel still reads at a glance
function drawSpark(painter, spark, colors) {
  const heat = Math.min(colors.length - 1, Math.floor(spark.progress * colors.length));
  if (heat === 0) {
    painter
      .use(colors[1])
      .alpha(0.3)
      .rect(spark.x - 1, spark.y - 1, 3, 3);
  }
  painter
    .use(colors[heat])
    .alpha(1 - spark.progress * 0.7)
    .rect(spark.x, spark.y, 1, spark.streak ? 3 : 1);
}

// showers of sparks spilling from a spout or a gantry in the near layer, arcing down to the road
export function drawSparks(painter, { effect, tick, cameraX, colors }) {
  const floor = effect.floor ?? GROUND_Y;
  for (const spot of emitterSpots(effect, cameraX)) {
    for (let spark = 0; spark < effect.count; spark++) {
      const flying = sparkAt(spot, { spark, tick, effect });
      if (flying && flying.y < floor && isOnScreen(flying.x - 1, flying.y - 1, 3)) {
        drawSpark(painter, flying, colors.sparks);
      }
    }
  }
  painter.alpha(1);
}
