import { RENDER_SCALE } from '../../config.js';
import { HUD_FRAMES } from '../../data/hud-frames.js';
import { drawNineSlice } from '../nine-slice.js';

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
  drawNineSlice(painter.context, sheets.images[kind], {
    slice: HUD_FRAMES[kind].slice,
    rect,
    scale: RENDER_SCALE,
  });
}
