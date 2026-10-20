import { GROUND_Y, VIEW_WIDTH } from '../../config.js';
import { createRng } from '../../lib/math.js';

function paintBands(context, { bands }) {
  const bandHeight = GROUND_Y / bands.length;
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

function sunColor(colors, dy) {
  if (dy < -12) {
    return colors.sunTop;
  }
  return dy < 4 ? colors.sunMiddle : colors.sunBottom;
}

// the lower half of the sun is cut by widening gaps, like a retro sunset
function isSunGap(dy) {
  return dy > 3 && (dy - 3) % 5 < Math.min(3, 1 + (((dy - 3) / 7) | 0));
}

function paintSun(context, colors) {
  const centerX = 286;
  const centerY = 120;
  const radius = 26;
  for (let dy = -radius; dy <= radius; dy++) {
    const half = Math.floor(Math.sqrt(radius * radius - dy * dy));
    if (isSunGap(dy)) {
      continue;
    }
    context.fillStyle = sunColor(colors, dy);
    context.fillRect(centerX - half, centerY + dy, half * 2, 1);
  }
}

// a whole moon high in the sky, its far side in shadow and a few craters on its face
function paintMoon(context, colors) {
  const centerX = 300;
  const centerY = 46;
  const radius = 16;
  for (let dy = -radius; dy <= radius; dy++) {
    const half = Math.floor(Math.sqrt(radius * radius - dy * dy));
    context.fillStyle = colors.sunTop;
    context.fillRect(centerX - half, centerY + dy, half * 2, 1);
    context.fillStyle = colors.sunBottom;
    context.fillRect(centerX + Math.floor(half / 2), centerY + dy, half - Math.floor(half / 2), 1);
  }
  context.fillStyle = colors.sunMiddle;
  for (const [x, y, size] of [
    [-7, -5, 4],
    [2, 4, 3],
    [-3, 8, 2],
    [-9, 3, 2],
  ]) {
    context.fillRect(centerX + x, centerY + y, size, size);
  }
}

function paintClouds(context, colors) {
  const random = createRng(11);
  for (let i = 0; i < 9; i++) {
    const y = (50 + random() * 80) | 0;
    const x = (random() * VIEW_WIDTH) | 0;
    const width = (30 + random() * 90) | 0;
    context.fillStyle = i % 2 ? colors.cloudDark : colors.cloudLight;
    context.fillRect(x, y, width, 2);
    context.fillRect(x + 6, y - 1, width - 14, 1);
  }
}

export function buildSky(createCanvas, { sky, celestial }) {
  const canvas = createCanvas(VIEW_WIDTH, GROUND_Y);
  const context = canvas.getContext('2d');
  paintBands(context, sky);
  if (celestial === 'moon') {
    paintMoon(context, sky);
  } else {
    paintSun(context, sky);
  }
  paintClouds(context, sky);
  return canvas;
}
