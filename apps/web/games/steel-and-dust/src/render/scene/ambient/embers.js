import { emitterSpots } from './emitters.js';
import { fillClipped, isOnScreen, trait } from './motion.js';

const SALT = 13000;
const SPARKS = 6;
// stacked translucent layers add up to a brighter middle: a soft glow without gradients
const GLOW_LAYERS = [
  [18, 4],
  [12, 8],
  [6, 10],
];

function drawGlow(painter, spot, { tick, color }) {
  const flicker =
    Math.sin(tick * 0.23 + spot.index * 2.3) * 0.05 + Math.sin(tick * 0.61 + spot.index) * 0.03;
  painter.use(color).alpha(0.11 + flicker);
  for (const [width, height] of GLOW_LAYERS) {
    const box = { x: spot.x - width / 2, y: spot.y - height / 2, width, height };
    fillClipped(painter, box);
  }
}

// each spark replays on its own life cycle; the flight number varies its path every cycle
function sparkAt(spot, { spark, tick }) {
  const seed = spot.index * 64 + spark + SALT;
  const life = 40 + Math.floor(trait(seed, 1) * 40);
  const clock = tick + Math.floor(trait(seed, 2) * life);
  const flight = Math.floor(clock / life);
  const age = clock - flight * life;
  const flightSeed = seed * 977 + flight;
  const startX = (trait(flightSeed, 3) - 0.5) * 8;
  const windX = (trait(flightSeed, 4) - 0.3) * 0.12;
  return {
    x: spot.x + startX + age * windX + Math.sin(age * 0.2 + flight) * 1.2,
    y: spot.y - 2 - age * (0.35 + trait(flightSeed, 5) * 0.35),
    progress: age / life,
  };
}

function drawSparks(painter, spot, { tick, colors }) {
  for (let spark = 0; spark < SPARKS; spark++) {
    const { x, y, progress } = sparkAt(spot, { spark, tick });
    if (isOnScreen(x, y, 1)) {
      const heat = Math.min(colors.length - 1, Math.floor(progress * colors.length));
      painter
        .use(colors[heat])
        .alpha(1 - progress * 0.85)
        .rect(x, y, 1, 1);
    }
  }
}

export function drawEmbers(painter, { effect, tick, cameraX, colors }) {
  for (const spot of emitterSpots(effect, cameraX)) {
    drawGlow(painter, spot, { tick, color: colors.glow });
    drawSparks(painter, spot, { tick, colors: colors.embers });
  }
  painter.alpha(1);
}
