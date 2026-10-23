import { createPainter } from '../../../../src/render/painter.js';
import { createRecordingContext } from '../../../support/recording-canvas.js';

export function recordingPainter() {
  const { context, log } = createRecordingContext(null);
  return { painter: createPainter(context), context, log };
}

// every fillRect with the color, alpha and blending in force when it was drawn
export function drawnRects(log) {
  const rects = [];
  const state = { color: null, alpha: 1, light: false };
  for (const entry of log) {
    if (entry.startsWith('fillStyle=')) {
      state.color = entry.slice('fillStyle='.length);
    } else if (entry.startsWith('globalAlpha=')) {
      state.alpha = Number(entry.slice('globalAlpha='.length));
    } else if (entry.startsWith('globalCompositeOperation=')) {
      state.light = entry.endsWith('lighter');
    } else if (entry.startsWith('fillRect(')) {
      const [x, y, width, height] = entry.slice('fillRect('.length, -1).split(',').map(Number);
      rects.push({ x, y, width, height, ...state });
    }
  }
  return rects;
}

// the world is drawn at twice its size, so a screen pixel is half a world pixel
export const onScreenPixels = (value) => Math.abs(value * 2 - Math.round(value * 2)) < 1e-9;

export const offGrid = (rects) =>
  rects.filter((rect) => ![rect.x, rect.y, rect.width, rect.height].every(onScreenPixels));

export function boundsOf(rects) {
  return {
    left: Math.min(...rects.map((rect) => rect.x)),
    right: Math.max(...rects.map((rect) => rect.x + rect.width)),
    top: Math.min(...rects.map((rect) => rect.y)),
    bottom: Math.max(...rects.map((rect) => rect.y + rect.height)),
  };
}
