import { shiftedPen } from '../../../../../../src/render/duel/pen.js';
import { NAGA_ART, SHOT_ART } from '../../colors.js';
import { canBake, stamp } from '../bake.js';
import { bakedLook, bakeKey, headBake } from './bakes.js';
import { GAPES, paintHead } from './figure.js';
import { edgeAt, lightnessOf, mapPixels, packed } from './pixels.js';
import { rasterOf } from './raster.js';
import { drawInrush } from './inrush.js';
import { drawStreaks } from './streaks.js';

const LIGHT = [SHOT_ART.emerald[2], SHOT_ART.emerald[3], SHOT_ART.emerald[4], SHOT_ART.flash].map(
  packed,
);

const EDGE = packed(SHOT_ART.white);

const stepOf = (word) => [40, 110, 190].filter((bound) => lightnessOf(word) >= bound).length;

export const lightBake = (look) =>
  bakedLook(bakeKey('light', look.size), rasterOf('head', look), (raster) =>
    mapPixels(raster, (word, x, y) => {
      if (word === 0) {
        return 0;
      }

      return edgeAt(raster, x, y) ? EDGE : LIGHT[stepOf(word)];
    }),
  );

const WHOLE = 0.6;

export const quantized = (size) => Math.max(0.5, Math.round(size * 2) / 2);

function drawShrinkingHead(pen, naga) {
  const size = quantized(naga.size);
  const at = { x: Math.round(naga.x), y: Math.round(naga.y) };

  if (!canBake()) {
    paintHead(shiftedPen(pen, at.x, at.y), { size, gape: GAPES.at(-1), art: NAGA_ART });

    return;
  }

  const look = { size, gape: GAPES.at(-1) };
  const layout = rasterOf('head', look);
  const canvas = naga.compress < WHOLE ? headBake(look) : lightBake(look);

  stamp(pen, canvas, { left: at.x + layout.left, top: at.y + layout.top });
}

export function drawPour(pen, naga) {
  drawShrinkingHead(pen, naga);
  drawStreaks(pen, { compress: naga.compress, ball: naga.ball });
  drawInrush(pen, { compress: naga.compress, ball: naga.ball });
}
