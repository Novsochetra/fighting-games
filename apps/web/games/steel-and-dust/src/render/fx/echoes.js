import { FX_COLORS } from '../../art/fx-colors.js';
import { POUNDING_LION } from '../../data/ultimates/pounding-lion.js';
import { heroSheetFor } from '../fighters/hero-sheets.js';
import { drawHeroFrame } from '../fighters/hero-sprites.js';

const { windTicks } = POUNDING_LION;
// half a world px is one pixel of the hero's sprite: a one-pixel rim of light all round
const RIM = [
  [-0.5, 0],
  [0.5, 0],
  [0, -0.5],
  [0, 0.5],
];
const FLASH_TICKS = 3;
const HELD = 0.62;
const STRIKING = 0.9;
const RIM_SHARE = 0.7;

// it holds the blow it was left with, winds up on the frame before and strikes again
export function echoFrame(echo) {
  const [strip, strike, row] = echo.sprite;
  const winding = echo.time >= echo.strikeAt - windTicks && echo.time < echo.strikeAt;
  return [strip, winding ? Math.max(0, strike - 1) : strike, row];
}

function flashing(echo) {
  const struck = echo.time >= echo.strikeAt && echo.time < echo.strikeAt + FLASH_TICKS;
  return struck || (echo.wakeAt !== null && echo.time >= echo.wakeAt);
}

// see-through and flickering like an afterimage: the hero cast in gold, every line of him kept, in a
// rim of light; it burns pale and solid as it strikes again and as it wakes into a lion
export function echoLook(echo) {
  if (flashing(echo)) {
    return { alpha: STRIKING, rim: FX_COLORS.reliefRim, body: FX_COLORS.reliefRim, relief: false };
  }
  const flicker = (echo.time >> 1) % 2 ? 0.08 : 0;
  return { alpha: HELD + flicker, rim: FX_COLORS.lionGold, body: FX_COLORS.lionGold, relief: true };
}

function drawEcho(painter, sheet, echo) {
  const frame = echoFrame(echo);
  const at = { frame, x: echo.x, y: echo.y, facing: echo.direction, row: frame[2] };
  const { alpha, rim, body, relief } = echoLook(echo);
  painter.alpha(alpha * RIM_SHARE);
  for (const [dx, dy] of RIM) {
    drawHeroFrame(painter, sheet, { ...at, x: at.x + dx, y: at.y + dy, tint: rim });
  }
  painter.alpha(alpha);
  drawHeroFrame(painter, sheet, { ...at, tint: body, relief });
  painter.alpha(1);
}

export function drawEchoes(painter, { summons, view }) {
  for (const echo of summons) {
    if (echo.kind === 'echo') {
      drawEcho(painter, heroSheetFor(view, echo.hero), echo);
    }
  }
}
