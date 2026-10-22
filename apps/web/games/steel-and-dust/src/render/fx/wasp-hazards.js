import { COLORS } from '../../art/colors.js';
import { FX_COLORS } from '../../art/fx-colors.js';
import { FX_SPRITES } from '../../data/fx-sprites.js';
import { drawText } from '../text/draw-text.js';
import { drawFxFrame } from './fx-sheets.js';

const MARK_LENGTH = 30;
const EDGE_GAP = 16;

// while a wasp waits its lane is marked where it will come in, like every boss danger: a red bar
// at its height with chevrons pointing the way it will fly, blinking faster as it nears
function drawLaneMark(painter, wasp) {
  const edge = wasp.x + wasp.direction * EDGE_GAP;
  const left = wasp.direction > 0 ? edge : edge - MARK_LENGTH;
  const blink = wasp.warn - wasp.time < 12 ? 1 : 2;
  painter.alpha((wasp.time >> blink) & 1 ? 0.75 : 0.4).use(COLORS.red);
  painter.rect(left, wasp.y - 1, MARK_LENGTH, 3);
  painter.use(FX_COLORS.dangerLight).rect(left, wasp.y - 1, MARK_LENGTH, 1);
  for (let i = 1; i <= 2; i++) {
    drawText(painter, wasp.direction > 0 ? '>' : '<', {
      x: edge + wasp.direction * i * 11,
      y: wasp.y - 9,
      color: COLORS.coral,
      align: 'center',
      shadow: null,
    });
  }
  painter.alpha(1);
}

export function drawWasp(painter, wasp, sheets) {
  if (wasp.time < wasp.warn) {
    drawLaneMark(painter, wasp);
    return;
  }
  const { frames, ticks } = FX_SPRITES.wasp;
  drawFxFrame(painter, sheets, {
    name: 'wasp',
    frame: Math.floor(wasp.time / ticks) % frames,
    x: wasp.x,
    y: wasp.y,
    facing: wasp.direction,
  });
}
