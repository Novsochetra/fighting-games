import { VIEW_HEIGHT, VIEW_WIDTH } from '../../config.js';

export function isPortrait(width, height) {
  return height > width * 1.05;
}

// the canvas keeps 16:9 and fills the screen; on an upright phone it sits in the space above the
// touch buttons
export function stageRect({ width, height, safe, portrait, buttonScale }) {
  if (portrait) {
    const stageHeight = Math.round((width * 9) / 16);
    const room = (height - safe.bottom - 260 * buttonScale - stageHeight) / 2;
    return { x: 0, y: Math.round(Math.max(safe.top + 56, room)), width, height: stageHeight };
  }
  const scale = Math.min(width / VIEW_WIDTH, height / VIEW_HEIGHT);
  const stageWidth = Math.floor(VIEW_WIDTH * scale);
  const stageHeight = Math.floor(VIEW_HEIGHT * scale);
  return {
    x: Math.floor((width - stageWidth) / 2),
    y: Math.floor((height - stageHeight) / 2),
    width: stageWidth,
    height: stageHeight,
  };
}

// half the stick base in styles/touch.css, before the button size
export const STICK_RADIUS = 64;

// the fixed stick rests in the bottom-left corner, below the stage when the phone is upright
export function stickRestPosition({ zoneHeight, safe, stageBottom, portrait, buttonScale }) {
  const radius = STICK_RADIUS * buttonScale;
  const bottom = zoneHeight - safe.bottom - radius;
  const y = portrait
    ? Math.min(bottom - 28, Math.max(stageBottom + radius + 40, zoneHeight * 0.68))
    : bottom - 26;
  return { x: safe.left + radius + 26, y };
}
