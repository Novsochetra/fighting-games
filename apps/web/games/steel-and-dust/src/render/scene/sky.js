import { SKY_COLORS } from '../../art/scene-colors.js';
import { GROUND_Y, VIEW_WIDTH } from '../../config.js';
import { createRng } from '../../lib/math.js';

function paintBands(context, bandHeight) {
  const bands = SKY_COLORS.bands;
  for (let i = 0; i < bands.length; i++) {
    context.fillStyle = bands[i];
    context.fillRect(0, Math.floor(i * bandHeight), VIEW_WIDTH, Math.ceil(bandHeight) + 1);
  }
  for (let i = 1; i < bands.length; i++) {
    const y = Math.floor(i * bandHeight);
    context.fillStyle = bands[i];
    for (let x = 0; x < VIEW_WIDTH; x += 2) {
      context.fillRect(x, y - 1, 1, 1);
      context.fillRect(x + 1, y - 3, 1, 1);
    }
    context.fillStyle = bands[i - 1];
    for (let x = 1; x < VIEW_WIDTH; x += 2) {
      context.fillRect(x, y + 1, 1, 1);
    }
  }
}

function sunColor(dy) {
  if (dy < -12) {
    return SKY_COLORS.sunTop;
  }
  return dy < 4 ? SKY_COLORS.sunMiddle : SKY_COLORS.sunBottom;
}

// the lower half of the sun is cut by widening gaps, like a retro sunset
function isSunGap(dy) {
  return dy > 3 && (dy - 3) % 5 < Math.min(3, 1 + (((dy - 3) / 7) | 0));
}

function paintSun(context) {
  const centerX = 286;
  const centerY = 120;
  const radius = 26;
  for (let dy = -radius; dy <= radius; dy++) {
    const half = Math.floor(Math.sqrt(radius * radius - dy * dy));
    if (isSunGap(dy)) {
      continue;
    }
    context.fillStyle = sunColor(dy);
    context.fillRect(centerX - half, centerY + dy, half * 2, 1);
  }
}

function paintClouds(context) {
  const random = createRng(11);
  context.fillStyle = SKY_COLORS.cloudShadow;
  for (let i = 0; i < 9; i++) {
    const y = (50 + random() * 80) | 0;
    const x = (random() * VIEW_WIDTH) | 0;
    const width = (30 + random() * 90) | 0;
    context.fillStyle = i % 2 ? SKY_COLORS.cloudDark : SKY_COLORS.cloudLight;
    context.fillRect(x, y, width, 2);
    context.fillRect(x + 6, y - 1, width - 14, 1);
  }
}

export function buildSky(createCanvas) {
  const canvas = createCanvas(VIEW_WIDTH, GROUND_Y);
  const context = canvas.getContext('2d');
  paintBands(context, GROUND_Y / SKY_COLORS.bands.length);
  paintSun(context);
  paintClouds(context);
  return canvas;
}
