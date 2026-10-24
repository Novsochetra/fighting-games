import { COLORS } from '../../art/colors.js';
import { RENDER_SCALE } from '../../config.js';
import { HUD_FRAMES } from '../../data/hud-frames.js';
import { drawNineSlice } from '../nine-slice.js';
import { drawStamped } from '../stamps.js';

const DIRECTORY = 'assets/ui/hud/';

export function loadHudFrames({ createImage, baseUrl }) {
  const sheets = { images: {}, ready: {} };
  for (const [kind, frame] of Object.entries(HUD_FRAMES)) {
    const image = createImage();
    image.onload = () => {
      sheets.ready[kind] = true;
    };
    image.src = `${baseUrl}${DIRECTORY}${frame.file}`;
    sheets.images[kind] = image;
  }
  return sheets;
}

// until its image is in, a panel shows only its dark fill
export function drawHudFrame(painter, sheets, kind, rect) {
  if (!sheets.ready[kind]) {
    return;
  }
  const { width, height } = rect;
  drawStamped(painter, {
    key: `frame|${kind}|${width}|${height}`,
    x: rect.x,
    y: rect.y,
    width,
    height,
    resolution: RENDER_SCALE,
    draw: (context, x, y) =>
      drawNineSlice(context, sheets.images[kind], {
        slice: HUD_FRAMES[kind].slice,
        rect: { x, y, width, height },
        scale: RENDER_SCALE,
      }),
  });
}

// the dark fill keeps the text readable on a bright sky
export function drawPlaque(painter, sheets, kind, rect) {
  painter
    .alpha(0.55)
    .use(COLORS.night)
    .rect(rect.x + 2, rect.y + 2, rect.width - 4, rect.height - 4);
  painter.alpha(1);
  drawHudFrame(painter, sheets, kind, rect);
}
