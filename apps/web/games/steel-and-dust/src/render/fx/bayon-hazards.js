import { COLORS } from '../../art/colors.js';
import { FX_COLORS } from '../../art/fx-colors.js';
import { point } from '../painter.js';
import { drawFxFrame, fxFrameAt } from './fx-sheets.js';

// the ray from his eyes shows for the last ticks before a pillar bursts and its first ones
const RAY_LEAD = 10;
const RAY_AFTER = 4;
// a mark turns red and blinks in its last ticks
const MARK_HURRY = 14;

function blinking(time) {
  return -time < MARK_HURRY && (time >> 2) & 1;
}

// a ring of gold glowing on the road where a pillar will burst
export function drawPillarMark(painter, pillar) {
  if (pillar.time >= 0) {
    return;
  }
  const grown = Math.min(1, (pillar.wait + pillar.time) / 10);
  const half = Math.round(4 + 7 * grown);
  painter.alpha(0.55 + 0.35 * grown);
  painter.use(blinking(pillar.time) ? COLORS.red : FX_COLORS.gazeGold);
  painter.rect(pillar.x - half, pillar.y - 1, half * 2, 2);
  painter.use(FX_COLORS.gazeWhite).rect(pillar.x - half / 2, pillar.y - 1, half, 1);
  painter.alpha(1);
}

// the gaze: a thin gold ray from the guardian's eyes down onto the spot
function drawRay(painter, pillar) {
  const from = point(pillar.eyes.x, pillar.eyes.y);
  const to = point(pillar.x, pillar.y);
  painter.alpha(0.45).use(FX_COLORS.gazeEmber).line(from, to, 3);
  painter.alpha(0.9).use(FX_COLORS.gazeGold).line(from, to, 1.5);
  painter.alpha(1).use(FX_COLORS.gazeWhite).line(from, to, 0.5);
}

export function drawGazePillar(painter, pillar, sheets) {
  if (pillar.time >= -RAY_LEAD && pillar.time < RAY_AFTER) {
    drawRay(painter, pillar);
  }
  if (pillar.time >= 0) {
    const frame = fxFrameAt('gazePillar', pillar.time);
    drawFxFrame(painter, sheets, { name: 'gazePillar', frame, x: pillar.x, y: pillar.y });
  }
}

// the road cracks and glows gold over the root about to burst under the hero
export function drawRootMark(painter, root) {
  if (root.time >= 0 || !root.marked) {
    return;
  }
  const crack = Math.min(9, Math.round((root.time + 40) / 4));
  painter.alpha(0.85).use(blinking(root.time) ? COLORS.red : FX_COLORS.gazeGold);
  for (let i = -crack; i <= crack; i += 3) {
    painter.rect(root.x + i, root.y - 1 - (i & 1), 2, 1);
  }
  painter.use(FX_COLORS.gazeWhite).rect(root.x - 1, root.y - 2, 2, 2);
  painter.alpha(1);
}

export function drawFigRoot(painter, root, sheets) {
  if (root.time >= 0) {
    const frame = fxFrameAt('figRoot', root.time);
    drawFxFrame(painter, sheets, {
      name: 'figRoot',
      frame,
      x: root.x,
      y: root.y,
      facing: root.direction,
    });
  }
}
