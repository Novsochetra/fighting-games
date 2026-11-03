// the view menus, cards and the HUD are laid out in
export const VIEW = { width: 768, height: 432 };
// the canvas, and the match world drawn on it pixel for pixel: twice the view each way, so the
// camera sees twice as much of the pitch while the footballers keep their size. What is laid out
// in VIEW is drawn UI_SCALE times as big over it (src/render/spaces.js), so it looks as it was made.
export const WORLD_VIEW = { width: 1536, height: 864 };
export const UI_SCALE = WORLD_VIEW.width / VIEW.width;
export const TICKS_PER_SECOND = 60;
export const TICK_MS = 1000 / TICKS_PER_SECOND;
