import { COLORS } from '../../art/colors.js';
import { FX_COLORS } from '../../art/fx-colors.js';
import { easeOutCubic } from '../../lib/math.js';
import { PILLAR_BURNS } from '../../sim/hazards/gaze-pillars.js';
import {
  PIXEL,
  ellipseRows,
  fillRows,
  inLight,
  ringRows,
  snap,
  steppedLevel,
} from './fine-pixels.js';

// as the pillar bursts, a shock ring runs out along the road from its mark, white, then gold, then
// ember as it thins; the road at its foot stays lit while it burns
const BURST_TICKS = 10;
const BURST_FROM = 13;
const BURST_REACH = 16;
const FLAT = 0.3;
const BURST_COLORS = [COLORS.white, FX_COLORS.gazeGold, FX_COLORS.gazeEmber];
const FOOT_LEVELS = [0.22, 0.3, 0.38];

export function burstRing(time) {
  const progress = Math.min(1, time / BURST_TICKS);
  return {
    radius: snap(BURST_FROM + easeOutCubic(progress) * BURST_REACH),
    width: progress < 0.4 ? 2 : 1,
    color: BURST_COLORS[Math.min(2, Math.floor(progress * 3))],
    alpha: 1 - progress * 0.7,
  };
}

function drawFootLight(context, pillar) {
  const fade = Math.min(1, (PILLAR_BURNS[1] + 6 - pillar.time) / 6);
  inLight(context, () => {
    context.globalAlpha = steppedLevel(FOOT_LEVELS, Math.round(pillar.x), pillar.time >> 1) * fade;
    context.fillStyle = FX_COLORS.gazeGold;
    fillRows(context, { x: pillar.x, y: pillar.y, rows: ellipseRows(BURST_FROM + 2, 4) });
    context.fillStyle = FX_COLORS.gazeWhite;
    fillRows(context, { x: pillar.x, y: pillar.y, rows: ellipseRows(BURST_FROM - 4, 2) });
  });
}

export function drawPillarFoot(context, pillar) {
  if (pillar.time < PILLAR_BURNS[1] + 6) {
    drawFootLight(context, pillar);
  }
  if (pillar.time < BURST_TICKS) {
    const ring = burstRing(pillar.time);
    context.globalAlpha = ring.alpha;
    context.fillStyle = ring.color;
    fillRows(context, {
      x: pillar.x,
      y: pillar.y,
      rows: ringRows(ring.radius, ring.radius * FLAT + PIXEL, ring.width),
    });
  }
  context.globalAlpha = 1;
}
