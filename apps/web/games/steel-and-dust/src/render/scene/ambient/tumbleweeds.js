import { CYCLE_WIDTH, MARGIN, TAU, isOnScreen, trait, wrapX } from './motion.js';

const SALT = 23000;
const SPAN = CYCLE_WIDTH;

// a weed rolls with the wind across the view, one lap per cycle; some laps it stays away, so the
// road is not crossed at a steady beat
function weedAt(i, { effect, tick, cameraX }) {
  const seed = i + SALT;
  const speed = effect.speed * (0.75 + trait(seed, 1) * 0.5);
  const travel = trait(seed, 0) * SPAN - tick * speed - cameraX * effect.drift;
  const lap = Math.floor(travel / SPAN);
  const radius = 4 + Math.floor(trait(seed, 2) * 4);
  const hop = Math.abs(Math.sin(tick * speed * 0.06 + trait(seed, 3) * TAU));
  return {
    x: wrapX(travel, SPAN) - MARGIN,
    y: effect.y - radius - 1 - hop * (3 + radius),
    radius,
    turn: Math.floor(-travel / 3),
    shown: trait(seed * 977 + lap, 4) < (effect.often ?? 0.6),
    hop,
  };
}

// every other row of the ball is solid and the rows between show only its rim, so it reads as a
// see-through tangle; a light twig slides round each row as it rolls
function drawWeed(painter, weed, [body, light]) {
  const centreX = Math.round(weed.x);
  const centreY = Math.round(weed.y);
  for (let dy = -weed.radius; dy <= weed.radius; dy++) {
    const half = Math.round(Math.sqrt(weed.radius * weed.radius - dy * dy));
    const span = half * 2 + 1;
    const left = centreX - half;
    painter.use(body);
    if ((dy + weed.turn) & 1 || span < 3) {
      painter.rect(left, centreY + dy, span, 1);
    } else {
      painter.rect(left, centreY + dy, 1, 1).rect(left + span - 1, centreY + dy, 1, 1);
    }
    painter.use(light).rect(left + wrapX(dy * 3 + weed.turn, span), centreY + dy, 1, 1);
  }
}

export function drawTumbleweeds(painter, { effect, tick, cameraX, colors }) {
  for (let i = 0; i < effect.count; i++) {
    const weed = weedAt(i, { effect, tick, cameraX });
    const size = weed.radius * 2 + 1;
    if (weed.shown && isOnScreen(weed.x - weed.radius, weed.y - weed.radius, size)) {
      painter.use(colors.tumbleweed[2]).alpha(0.3 * (1 - weed.hop * 0.6));
      painter.rect(weed.x - weed.radius, effect.y, size, 1);
      painter.alpha(1);
      drawWeed(painter, weed, colors.tumbleweed);
    }
  }
}
