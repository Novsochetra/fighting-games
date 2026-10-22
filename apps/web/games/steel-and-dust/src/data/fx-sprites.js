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
  lion: { frameWidth: 216, frameHeight: 155, frames: 6, ticks: 4, anchorX: 108, anchorY: 151 },
  feathers: { frameWidth: 66, frameHeight: 70, frames: 8, ticks: 2, anchorX: 18, anchorY: 23 },
  crescent: { frameWidth: 96, frameHeight: 64, frames: 6, ticks: 3, anchorX: 88, anchorY: 62 },
  boulder: { frameWidth: 56, frameHeight: 56, frames: 4, ticks: 4, anchorX: 28, anchorY: 28 },
  shards: { frameWidth: 64, frameHeight: 64, frames: 6, ticks: 4, anchorX: 32, anchorY: 63 },
  spike: { frameWidth: 64, frameHeight: 96, frames: 8, ticks: 4, anchorX: 32, anchorY: 95 },
  bamboo: { frameWidth: 160, frameHeight: 168, frames: 4, ticks: 6, anchorX: 40, anchorY: 166 },
  stars: { frameWidth: 56, frameHeight: 32, frames: 4, ticks: 4, anchorX: 28, anchorY: 16 },
  impact: { frameWidth: 104, frameHeight: 104, frames: 6, ticks: 3, anchorX: 52, anchorY: 102 },
  glob: { frameWidth: 44, frameHeight: 20, frames: 4, ticks: 4, anchorX: 35, anchorY: 10 },
  puddle: { frameWidth: 80, frameHeight: 40, frames: 6, ticks: 6, anchorX: 40, anchorY: 38 },
  hypnosis: { frameWidth: 128, frameHeight: 80, frames: 8, ticks: 3, anchorX: 64, anchorY: 40 },
  wasp: { frameWidth: 56, frameHeight: 48, frames: 4, ticks: 3, anchorX: 28, anchorY: 24 },
  eruption: { frameWidth: 144, frameHeight: 144, frames: 6, ticks: 3, anchorX: 72, anchorY: 143 },
  howl: { frameWidth: 112, frameHeight: 112, frames: 6, ticks: 3, anchorX: 56, anchorY: 56 },
  bones: { frameWidth: 144, frameHeight: 72, frames: 6, ticks: 3, anchorX: 72, anchorY: 71 },
  redeye: { frameWidth: 56, frameHeight: 16, frames: 4, ticks: 3, anchorX: 15, anchorY: 8 },
  zap: { frameWidth: 120, frameHeight: 56, frames: 4, ticks: 3, anchorX: 114, anchorY: 28 },
  tornado: { frameWidth: 136, frameHeight: 160, frames: 8, ticks: 4, anchorX: 68, anchorY: 158 },
  thunder: { frameWidth: 232, frameHeight: 352, frames: 8, ticks: 3, anchorX: 116, anchorY: 348 },
  blaze: { frameWidth: 80, frameHeight: 64, frames: 6, ticks: 5, anchorX: 40, anchorY: 62 },
  slag: { frameWidth: 96, frameHeight: 64, frames: 4, ticks: 4, anchorX: 48, anchorY: 32 },
  lava: { frameWidth: 112, frameHeight: 72, frames: 6, ticks: 4, anchorX: 56, anchorY: 70 },
  beam: { frameWidth: 160, frameHeight: 72, frames: 4, ticks: 3, anchorX: 154, anchorY: 36 },
  flare: { frameWidth: 128, frameHeight: 96, frames: 4, ticks: 3, anchorX: 16, anchorY: 48 },
  steam: { frameWidth: 80, frameHeight: 128, frames: 6, ticks: 4, anchorX: 40, anchorY: 126 },
  scarab: { frameWidth: 48, frameHeight: 24, frames: 4, ticks: 3, anchorX: 24, anchorY: 19 },
  canopic: { frameWidth: 80, frameHeight: 64, frames: 6, ticks: 4, anchorX: 40, anchorY: 59 },
  curse: { frameWidth: 48, frameHeight: 48, frames: 4, ticks: 6, anchorX: 24, anchorY: 24 },
  sunfall: { frameWidth: 96, frameHeight: 160, frames: 6, ticks: 4, anchorX: 48, anchorY: 156 },
  mirageBolt: { frameWidth: 48, frameHeight: 24, frames: 4, ticks: 3, anchorX: 30, anchorY: 12 },
  glint: { frameWidth: 32, frameHeight: 32, frames: 4, ticks: 4, anchorX: 16, anchorY: 16 },
  parry: { frameWidth: 96, frameHeight: 96, frames: 4, ticks: 3, anchorX: 48, anchorY: 48 },
  axeWhirl: { frameWidth: 176, frameHeight: 144, frames: 6, ticks: 3, anchorX: 88, anchorY: 72 },
  hook: { frameWidth: 56, frameHeight: 32, frames: 1, ticks: 1, anchorX: 3, anchorY: 21 },
  chain: { frameWidth: 48, frameHeight: 12, frames: 1, ticks: 1, anchorX: 0, anchorY: 6 },
  pounce: { frameWidth: 202, frameHeight: 127, frames: 8, ticks: 3, anchorX: 101, anchorY: 99 },
  strike: { frameWidth: 67, frameHeight: 53, frames: 7, ticks: 2, anchorX: 33, anchorY: 27 },
  awaken: { frameWidth: 60, frameHeight: 100, frames: 10, ticks: 3, anchorX: 30, anchorY: 86 },
  gather: { frameWidth: 67, frameHeight: 84, frames: 8, ticks: 2, anchorX: 33, anchorY: 76 },
  sever: { frameWidth: 55, frameHeight: 55, frames: 7, ticks: 2, anchorX: 24, anchorY: 27 },
  rubble: { frameWidth: 105, frameHeight: 92, frames: 11, ticks: 2, anchorX: 53, anchorY: 46 },
};

export const FX_SCALE = 1 / RENDER_SCALE;

// ticks an effect takes to play through once
export function fxLength(name) {
  const sprite = FX_SPRITES[name];
  return sprite.frames * sprite.ticks;
}
