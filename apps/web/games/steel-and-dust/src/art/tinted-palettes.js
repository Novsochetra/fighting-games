import { CHARACTER_PALETTES } from './character-palettes.js';

const PALETTE_KEYS = [
  ...new Set(Object.values(CHARACTER_PALETTES).flatMap((palette) => Object.keys(palette))),
];

function tintPalette(color, outline) {
  const palette = {};
  for (const key of PALETTE_KEYS) {
    palette[key] = color;
  }
  palette.outline = outline;
  palette.headStyle = null;
  palette.hideTabard = true;
  return palette;
}

export const FLASH_PALETTE = tintPalette('#ffffff', '#140f1a');
export const ARMOR_PALETTE = tintPalette('#ffd36b', '#5a3a10');
export const GHOST_PALETTE = tintPalette('#3cc8ff', '#1a5f8a');
export const TELEGRAPH_PALETTE = tintPalette('#ff6a4a', '#3a0a05');
export const ICE_PALETTE = tintPalette('#a8dcff', '#1a3a78');
