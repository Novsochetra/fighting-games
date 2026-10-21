import { CYCLE_WIDTH, isOnScreen, scrollX, trait } from './motion.js';

const SALT = 17000;
const STAR_SHARE = 0.25;

// each glint flashes once per cycle: it grows from a speck to its full dash and shrinks back,
// and every flash lands a little apart from the last so the water shimmers rather than blinks
function flashOf(seed, tick) {
  const cycle = 70 + Math.floor(trait(seed, 1) * 150);
  const clock = tick + Math.floor(trait(seed, 2) * cycle);
  const flash = Math.floor(clock / cycle);
  const lit = (clock - flash * cycle) / (cycle * (0.25 + trait(seed, 3) * 0.25));
  return { flash, lit };
}

function glintAt(i, { effect, tick, cameraX }) {
  const seed = i + SALT;
  const { flash, lit } = flashOf(seed, tick);
  if (lit >= 1) {
    return null;
  }
  const flashSeed = seed * 977 + flash;
  const depth = trait(seed, 4);
  const shimmer = 0.8 + 0.2 * Math.sin(tick * 0.45 + seed);
  const intensity = Math.sin(Math.PI * lit) * shimmer;
  // nearer water, lower in the band, throws longer dashes
  const reach = 1 + depth * 2 + trait(seed, 5) * 2;
  // a road's glints spread over the whole water; `left` and `span` gather them into one stretch
  const across = (effect.left ?? 0) + trait(seed, 0) * (effect.span ?? CYCLE_WIDTH);
  const baseX = across + (trait(flashSeed, 6) - 0.5) * 6;
  return {
    x: Math.round(scrollX(baseX, { cameraX, drift: effect.drift })),
    y: effect.top + Math.round(depth * (effect.bottom - effect.top)),
    length: Math.max(1, Math.round(reach * intensity)),
    intensity,
    star: trait(seed, 7) < STAR_SHARE && trait(flashSeed, 8) < 0.6,
  };
}

// a flash at its brightest takes the first color, dimmer moments the next ones
const DIMMER_BELOW = [0.75, 0.4];

function shadeOf(colors, intensity) {
  const step = DIMMER_BELOW.filter((threshold) => intensity <= threshold).length;
  return colors[Math.min(step, colors.length - 1)];
}

function drawStar(painter, glint, colors) {
  const arm = glint.intensity > 0.9 ? 2 : 1;
  painter
    .use(colors[Math.min(1, colors.length - 1)])
    .rect(glint.x, glint.y - arm, 1, arm * 2 + 1)
    .rect(glint.x - arm - 1, glint.y, arm * 2 + 3, 1);
  painter.use(colors[0]).rect(glint.x, glint.y, 1, 1);
}

function drawGlint(painter, glint, colors) {
  if (glint.star && glint.intensity > 0.7) {
    drawStar(painter, glint, colors);
    return;
  }
  const left = glint.x - Math.floor(glint.length / 2);
  painter.use(shadeOf(colors, glint.intensity)).rect(left, glint.y, glint.length, 1);
}

export function drawGlints(painter, { effect, tick, cameraX, colors }) {
  for (let i = 0; i < effect.count; i++) {
    const glint = glintAt(i, { effect, tick, cameraX });
    if (glint && isOnScreen(glint.x - 3, glint.y, 7)) {
      drawGlint(painter, glint, colors.glints);
    }
  }
}
