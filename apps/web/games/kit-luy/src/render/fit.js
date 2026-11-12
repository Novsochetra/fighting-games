import { clamp } from '../lib/math.js';

const SHORT_SIDE_IN_ART_PIXELS = 130;

// how many screen pixels one pixel of the art takes: whole, so every art pixel stays square
export const pixelScale = ({ width, height }) =>
  clamp(Math.round(Math.min(width, height) / SHORT_SIDE_IN_ART_PIXELS), 2, 5);

export function fitCanvas(canvas, viewport, scale) {
  canvas.width = Math.ceil(viewport.width / scale);
  canvas.height = Math.ceil(viewport.height / scale);
  canvas.style.width = `${canvas.width * scale}px`;
  canvas.style.height = `${canvas.height * scale}px`;
}
