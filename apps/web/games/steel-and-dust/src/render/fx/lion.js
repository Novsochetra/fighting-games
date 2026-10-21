import { FX_COLORS } from '../../art/fx-colors.js';
import { FX_SPRITES } from '../../data/fx-sprites.js';
import { LION_RISE_TICKS, lionPoseAt } from '../../sim/summons/lions.js';
import { drawFxFrame } from './fx-sheets.js';

// the strip's first frames are the lion taking shape, roaring and crouching, played once as it
// appears and held on the crouch while it waits; the rest are one leap, from push-off to reaching
// for the ground, spread over each bound
const RISE_FRAMES = 3;
const ECHOES = 2;
const ECHO_GAP = 3;

export function leapFrame(stride) {
  const leaps = FX_SPRITES.lion.frames - RISE_FRAMES;
  return RISE_FRAMES + Math.min(leaps - 1, Math.floor(stride * leaps));
}

export function lionFrame(lion, time) {
  if (time <= lion.appear) {
    return Math.min(RISE_FRAMES - 1, Math.floor((time / LION_RISE_TICKS) * RISE_FRAMES));
  }
  return leapFrame(lion.stride);
}

// gold afterimages of where it was a few ticks ago fill the gaps between its leap frames
function drawEchoes(painter, sheets, lion) {
  const running = lion.time - lion.appear;
  for (let echo = ECHOES; echo >= 1; echo--) {
    const time = running - echo * ECHO_GAP;
    if (time <= 0) {
      continue;
    }
    const pose = lionPoseAt(lion, time);
    painter.alpha(0.3 / echo);
    drawFxFrame(painter, sheets, {
      name: 'lion',
      frame: leapFrame(pose.stride),
      x: pose.x,
      y: pose.y,
      scale: lion.scale,
      facing: pose.direction,
      tint: FX_COLORS.lionGold,
    });
  }
}

// drawn solid like the sheet it comes from, then fading out once it has landed for good
export function drawLion(painter, sheets, lion) {
  if (lion.fade > 0) {
    painter.alpha(1 - lion.fade);
  } else {
    drawEchoes(painter, sheets, lion);
    painter.alpha(1);
  }
  drawFxFrame(painter, sheets, {
    name: 'lion',
    frame: lionFrame(lion, lion.time),
    x: lion.x,
    y: lion.y,
    scale: lion.scale,
    facing: lion.direction,
  });
  painter.alpha(1);
}
