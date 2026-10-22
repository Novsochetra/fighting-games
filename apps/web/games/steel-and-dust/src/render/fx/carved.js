import { FX_COLORS } from '../../art/fx-colors.js';
import { drawHeroFrame } from '../fighters/hero-sprites.js';

// half a world px is one pixel of the hero's sprite: a one-pixel rim of light round its top and sides
const RIM = [
  [-0.5, 0],
  [0.5, 0],
  [0, -0.5],
];
const FLASH = 0.35;

// carved like the Bayon's reliefs: the hero's own shape in sandstone, a shadow behind it, lit gold
// at its edges, a pale flash over it as it strikes
export function drawCarved(painter, sheet, { at, alpha, flash }) {
  painter.alpha(alpha);
  drawHeroFrame(painter, sheet, { ...at, x: at.x + 1, tint: FX_COLORS.reliefShade });
  for (const [dx, dy] of RIM) {
    drawHeroFrame(painter, sheet, { ...at, x: at.x + dx, y: at.y + dy, tint: FX_COLORS.reliefRim });
  }
  drawHeroFrame(painter, sheet, { ...at, tint: FX_COLORS.reliefStone, relief: true });
  if (flash) {
    painter.alpha(alpha * FLASH);
    drawHeroFrame(painter, sheet, { ...at, tint: FX_COLORS.reliefRim });
  }
  painter.alpha(1);
}
