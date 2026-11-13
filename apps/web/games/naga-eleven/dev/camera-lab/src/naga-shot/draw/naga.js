import { drawNagaHead } from '../../../../../src/render/duel/looks/naga-head.js';
import { NAGA_ART } from '../colors.js';

export function drawSummonedNaga(pen, { naga }) {
  if (!naga.shown || naga.eyesOnly) {
    return;
  }

  drawNagaHead(pen, { x: naga.x, y: naga.y, size: naga.size, art: NAGA_ART });
}
