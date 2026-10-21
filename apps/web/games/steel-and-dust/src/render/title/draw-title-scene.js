import { drawAmbientEffect } from '../scene/ambient/index.js';
import { drawRipple } from './ripple.js';
import { drawSunGlow } from './sun-glow.js';
import { drawSunRays } from './sun-rays.js';
import { drawSway } from './sway.js';

const TITLE_EFFECTS = {
  ripple: drawRipple,
  sway: drawSway,
  sunGlow: drawSunGlow,
  sunRays: drawSunRays,
};

// the shared air effects only draw inside one 384x216 view, so one meant for lower down a tall
// painting is drawn shifted down to its band
function drawShifted(painter, air) {
  const shiftY = air.effect.shiftY ?? 0;
  painter.context.translate(0, shiftY);
  drawAmbientEffect(painter, air);
  painter.context.translate(0, -shiftY);
}

// the painting, then its life in order, worked out from the tick alone; `still` keeps it a painting
export function drawTitleScene(painter, { scene, painting, tick, colors, still }) {
  painter.context.drawImage(painting, 0, 0);
  if (still) {
    return;
  }
  for (const effect of scene.effects) {
    const air = { effect, tick, cameraX: 0, colors, painting };
    const draw = TITLE_EFFECTS[effect.kind] ?? drawShifted;
    draw(painter, air);
  }
}
