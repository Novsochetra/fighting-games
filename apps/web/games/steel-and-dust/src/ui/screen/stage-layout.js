import { arrangeView, isPortrait } from '../../../../../packages/screen/src/stage-fit.js';
import { VIEW_HEIGHT, VIEW_WIDTH } from '../../config.js';

export { isPortrait };

// the touch buttons' height before the Button size
const CONTROLS_HEIGHT = 260;

const VIEW = { width: VIEW_WIDTH, height: VIEW_HEIGHT };

// where the stage stands, and whether the touch buttons stand under it (packages/screen)
export function arrangeStage({ width, height, safe, touch, buttonScale, hinge }) {
  const controlsHeight = touch ? CONTROLS_HEIGHT * buttonScale : null;

  return arrangeView({ width, height, safe, hinge, view: VIEW, controlsHeight });
}

// half the stick base in styles/touch.css, before the button size
export const STICK_RADIUS = 64;

// the fixed stick rests in the bottom-left corner, below the stage when the buttons are
export function stickRestPosition({ zoneHeight, safe, stageBottom, controlsBelow, buttonScale }) {
  const radius = STICK_RADIUS * buttonScale;
  const bottom = zoneHeight - safe.bottom - radius;
  const y = controlsBelow
    ? Math.min(bottom - 28, Math.max(stageBottom + radius + 40, zoneHeight * 0.68))
    : bottom - 26;

  return { x: safe.left + radius + 26, y };
}
