import { RENDER_SCALE } from '../config.js';

// PixelLab effect strips in assets/sprites/fx/: one row of frames, drawn at the hero sprites'
// resolution; anchor = the pixel that sits on the effect's point (ground or centre)
export const FX_SPRITES = {
  thorns: { frameWidth: 93, frameHeight: 131, frames: 14, ticks: 3, anchorX: 45, anchorY: 100 },
  ice: { frameWidth: 70, frameHeight: 99, frames: 14, ticks: 3, anchorX: 39, anchorY: 88 },
  stag: { frameWidth: 96, frameHeight: 80, frames: 8, ticks: 4, anchorX: 47, anchorY: 75 },
  nova: { frameWidth: 144, frameHeight: 165, frames: 16, ticks: 3, anchorX: 72, anchorY: 56 },
  shatter: { frameWidth: 113, frameHeight: 136, frames: 10, ticks: 3, anchorX: 55, anchorY: 49 },
  firefly: { frameWidth: 20, frameHeight: 20, frames: 6, ticks: 4, anchorX: 10, anchorY: 10 },
};

export const FX_SCALE = 1 / RENDER_SCALE;

// ticks an effect takes to play through once
export function fxLength(name) {
  const sprite = FX_SPRITES[name];
  return sprite.frames * sprite.ticks;
}
