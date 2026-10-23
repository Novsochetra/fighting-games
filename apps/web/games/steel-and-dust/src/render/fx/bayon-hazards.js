import { drawFxFrame, fxFrameAt } from './fx-sheets.js';
import { drawEyeFlare, drawImpactFlare } from './gaze-flares.js';
import { RAY_AFTER, RAY_LEAD, drawGazeRay } from './gaze-ray.js';
import { drawPillarFoot } from './pillar-burst.js';
import { drawRootCrack } from './root-crack.js';
import { drawRuneRing } from './rune-ring.js';

// a ring of runes glows on the road where a pillar will burst, and its foot stays lit as it burns
export function drawPillarMark(painter, pillar) {
  if (pillar.time < 0) {
    drawRuneRing(painter.context, pillar);
  } else {
    drawPillarFoot(painter.context, pillar);
  }
}

export function drawGazePillar(painter, pillar, sheets) {
  if (pillar.time >= -RAY_LEAD && pillar.time < RAY_AFTER) {
    drawGazeRay(painter, pillar);
    if (pillar.time < 0) {
      drawImpactFlare(painter.context, pillar);
    }
    drawEyeFlare(painter.context, pillar);
  }
  if (pillar.time >= 0) {
    const frame = fxFrameAt('gazePillar', pillar.time);
    drawFxFrame(painter, sheets, { name: 'gazePillar', frame, x: pillar.x, y: pillar.y });
  }
}

export function drawRootMark(painter, root) {
  if (root.time < 0 && root.marked) {
    drawRootCrack(painter.context, root);
  }
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
