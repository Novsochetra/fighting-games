import { clamp } from '../../lib/math.js';
import { BLAZE_LIGHT, BLAZE_OUT } from '../../sim/hazards/blazes.js';
import { lanceSpan } from '../../sim/hazards/flame-lances.js';
import { drawFxFrame } from './fx-sheets.js';
import { drawLandingShadow } from './rock-hazards.js';

const BLAZE_TICKS = 5;
const POOL_ERUPT_TICKS = 5;
const POOL_COOL_TICKS = 40;

// frame 0 lights it, 1-4 burn while it lasts, 5 dies down as it fades
function blazeFrame(blaze) {
  if (blaze.time < BLAZE_LIGHT) {
    return 0;
  }
  if (blaze.time < blaze.life) {
    return 1 + (Math.floor((blaze.time - BLAZE_LIGHT) / BLAZE_TICKS) % 4);
  }
  return 5;
}

export function drawBlaze(painter, blaze, sheets) {
  const fading = blaze.time - blaze.life;
  painter.alpha(fading > 0 ? clamp(1 - fading / BLAZE_OUT, 0, 1) : 1);
  drawFxFrame(painter, sheets, {
    name: 'blaze',
    frame: blazeFrame(blaze),
    x: blaze.x,
    y: blaze.y,
    facing: blaze.direction,
  });
  painter.alpha(1);
}

// the spot the pot will break on is marked from the moment it leaves his hands
export function drawSlagPot(painter, pot, sheets) {
  drawLandingShadow(painter, { ...pot.landing, y: pot.y, time: pot.time });
  drawFxFrame(painter, sheets, {
    name: 'slag',
    frame: Math.floor(pot.time / 4) % 4,
    x: pot.x,
    y: pot.y,
    facing: pot.direction,
  });
}

// the lava bursts up as the pot breaks (frames 1-4), then lies smouldering (0 and 5) and cools
function poolFrame(pool) {
  const erupt = Math.floor(pool.time / POOL_ERUPT_TICKS);
  if (erupt < 4) {
    return erupt + 1;
  }
  return Math.floor(pool.time / 12) % 2 ? 5 : 0;
}

export function drawLavaPool(painter, pool, sheets) {
  painter.alpha(clamp((pool.life - pool.time) / POOL_COOL_TICKS, 0, 1));
  drawFxFrame(painter, sheets, {
    name: 'lava',
    frame: poolFrame(pool),
    x: pool.x,
    y: pool.y,
    facing: pool.direction,
  });
  painter.alpha(1);
}

// only what has left the furnace's mouth is drawn, so the lance grows out of his chest
export function drawFlameLance(painter, lance, sheets) {
  const { left, right } = lanceSpan(lance);
  const context = painter.context;
  context.save();
  context.beginPath();
  context.rect(left, lance.y - 24, right - left, 48);
  context.clip();
  drawFxFrame(painter, sheets, {
    name: 'beam',
    frame: Math.floor(lance.time / 3) % 4,
    x: lance.x,
    y: lance.y,
    facing: lance.direction,
  });
  context.restore();
}
