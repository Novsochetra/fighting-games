import { VIEW_HEIGHT } from '../../../config.js';

// a half-buried rock with a bleached bone across it, for the bare stretches between bushes
function drawBones(painter, x, { hash, colors }) {
  const width = 16 + (hash % 10);
  const height = 4 + (hash % 3);
  painter.use(colors.rock).rect(x, VIEW_HEIGHT - height, width, height);
  painter.use(colors.top).rect(x + 2, VIEW_HEIGHT - height - 1, width - 6, 1);
  painter.use(colors.bone).rect(x + 5, VIEW_HEIGHT - height - 2, 9, 2);
  painter.use(colors.bone).rect(x + 4, VIEW_HEIGHT - height - 3, 2, 4);
  painter.use(colors.bone).rect(x + 13, VIEW_HEIGHT - height - 3, 2, 4);
  painter.use(colors.boneShade).rect(x + 6, VIEW_HEIGHT - height - 1, 7, 1);
}

// a dry desert bush: forked twigs fanning up from one root, all bent downwind and shivering
// harder when a gust comes through
function drawBush(painter, x, { hash, colors, tick }) {
  const twigs = 5 + (hash % 4);
  const shiver = Math.sin(tick / 9 + hash) * 0.6 + Math.sin(tick / 37 + hash) * 0.8;
  for (let i = 0; i < twigs; i++) {
    const height = 7 + ((hash >>> i) % 10);
    const fan = (i - (twigs - 1) / 2) * 0.5;
    painter.use(i % 2 ? colors.scrub : colors.scrubLight);
    for (let y = 0; y < height; y += 2) {
      const bend = (y / height) * (fan * 4 - 3 + shiver);
      painter.rect(x + i * 2 + bend, VIEW_HEIGHT - y - 2, 1, 2);
    }
    painter.rect(x + i * 2 + fan * 4 - 4 + shiver, VIEW_HEIGHT - height - 1, 2, 1);
  }
}

export function drawScrub(painter, x, options) {
  if (options.hash % 4 === 1) {
    drawBones(painter, x, options);
  } else {
    drawBush(painter, x, options);
  }
}
