import { VIEW_HEIGHT, VIEW_WIDTH } from '../../../config.js';
import { emitterSpots } from './emitters.js';
import { isOnScreen, trait, wrapX } from './motion.js';

const SALT = 23000;
const LIFE = 360;
const PUFFS = 14;
const START_SIZE = 8;

// each puff of a stack's plume is one of a few on a shared loop, spaced evenly along it; they
// stay nearly opaque and overlap, so the column reads as painted billows rather than a smudge
function puffAt(spot, { puff, tick, effect }) {
  const clock = tick + Math.floor((puff * LIFE) / PUFFS) + spot.index * 97;
  const age = wrapX(clock, LIFE);
  const seed = (Math.floor(clock / LIFE) * PUFFS + puff) * 7 + spot.index + SALT;
  const progress = age / LIFE;
  const grown = START_SIZE + progress * (effect.size - START_SIZE) * (0.7 + trait(seed, 1) * 0.5);
  const size = Math.round(grown);
  const sway = (Math.sin(age * 0.025 + puff * 1.7) * 3 + (trait(seed, 2) - 0.5) * 10) * progress;
  // the column climbs straight out of the stack, then bends downwind the higher it gets
  const lean = age * effect.wind * progress * 1.6;
  return {
    age,
    x: Math.round(spot.x + lean + sway - size / 2),
    y: Math.round(spot.y - age * effect.rise - size / 2),
    size,
    alpha: 0.8 * Math.min(1, progress * 40) * Math.min(1, (1 - progress) * 2.5),
  };
}

// a billow can be wider than the margin, so its boxes are cut at the edges of the view
function fillInView(painter, { x, y, width, height }) {
  const left = Math.max(0, x);
  const top = Math.max(0, y);
  const right = Math.min(VIEW_WIDTH, x + width);
  const bottom = Math.min(VIEW_HEIGHT, y + height);
  if (right > left && bottom > top) {
    painter.rect(left, top, right - left, bottom - top);
  }
}

// two crossed boxes make a rounded billow; only its upper left catches the sun, so the
// highlights stagger with the sway instead of lining up like rungs
function drawBillow(painter, { x, y, size, alpha }, [soot, sunlit]) {
  const inset = size >> 2;
  const rim = Math.max(1, inset >> 1);
  painter.use(soot).alpha(alpha);
  fillInView(painter, { x: x + inset, y, width: size - inset * 2, height: size });
  fillInView(painter, { x, y: y + inset, width: size, height: size - inset * 2 });
  painter.use(sunlit).alpha(alpha * 0.7);
  fillInView(painter, { x: x + inset, y, width: Math.max(1, size >> 2), height: rim });
  fillInView(painter, { x, y: y + inset, width: rim, height: inset });
}

// the newest billows go on top, so each one's sunlit crown shows against the one above it
function billowsOf(spot, { tick, effect }) {
  const billows = [];
  for (let puff = 0; puff < PUFFS; puff++) {
    billows.push(puffAt(spot, { puff, tick, effect }));
  }
  return billows.sort((first, second) => second.age - first.age);
}

// thick soot columns rising from the stacks of the near layer, swelling as the wind leans them
export function drawPlume(painter, { effect, tick, cameraX, colors }) {
  for (const spot of emitterSpots(effect, cameraX)) {
    for (const billow of billowsOf(spot, { tick, effect })) {
      if (billow.alpha > 0 && isOnScreen(billow.x, billow.y, billow.size)) {
        drawBillow(painter, billow, colors.plume);
      }
    }
  }
  painter.alpha(1);
}
