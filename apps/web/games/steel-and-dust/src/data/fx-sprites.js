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
  pillar: { frameWidth: 81, frameHeight: 111, frames: 12, ticks: 3, anchorX: 42, anchorY: 95 },
  burn: { frameWidth: 48, frameHeight: 64, frames: 8, ticks: 4, anchorX: 24, anchorY: 60 },
  inferno: { frameWidth: 244, frameHeight: 180, frames: 16, ticks: 3, anchorX: 122, anchorY: 131 },
  phoenix: { frameWidth: 128, frameHeight: 96, frames: 6, ticks: 4, anchorX: 64, anchorY: 52 },
  lion: { frameWidth: 216, frameHeight: 151, frames: 6, ticks: 4, anchorX: 108, anchorY: 147 },
  feathers: { frameWidth: 66, frameHeight: 70, frames: 8, ticks: 2, anchorX: 18, anchorY: 23 },
};

export const FX_SCALE = 1 / RENDER_SCALE;

// ticks an effect takes to play through once
export function fxLength(name) {
  const sprite = FX_SPRITES[name];
  return sprite.frames * sprite.ticks;
}
