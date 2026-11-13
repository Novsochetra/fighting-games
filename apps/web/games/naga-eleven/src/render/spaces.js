import { UI_SCALE } from '../config.js';

// every screen but the match world is laid out in VIEW's pixels and drawn this many times as big
export function useUiSpace(context) {
  context.setTransform(UI_SCALE, 0, 0, UI_SCALE, 0, 0);
  context.imageSmoothingEnabled = false;
}

// the match world is drawn at the canvas's own pixels (WORLD_VIEW), or a camera's punch-in on
// them ({ scale, x, y }, src/render/camera/punch-in.js); the UI's scale comes back after
export function inWorldSpace(context, draw, zoom = null) {
  context.save();
  context.setTransform(zoom?.scale ?? 1, 0, 0, zoom?.scale ?? 1, zoom?.x ?? 0, zoom?.y ?? 0);
  context.imageSmoothingEnabled = false;
  draw();
  context.restore();
}

// where a point of the world (in the canvas's pixels) lands in the UI's own pixels
export const toUiPoint = ({ x, y }) => ({ x: x / UI_SCALE, y: y / UI_SCALE });
