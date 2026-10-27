import { VIEW_HEIGHT, VIEW_WIDTH } from '../../config.js';

// room above the stage for the pause button, and the touch buttons' height before the Button size
const PAUSE_ROW = 56;
const CONTROLS_HEIGHT = 260;
// the touch buttons stand under the stage instead of over the fight when that costs the stage at
// most a fifth of its width: on an upright phone, an unfolded foldable or a big tablet
const SHRINK_FOR_CONTROLS = 0.8;

export function isPortrait(width, height) {
  return height > width * 1.05;
}

// the canvas keeps 16:9 and fills its area
function fitted(area) {
  const scale = Math.min(area.width / VIEW_WIDTH, area.height / VIEW_HEIGHT);
  const width = Math.floor(VIEW_WIDTH * scale);
  const height = Math.floor(VIEW_HEIGHT * scale);

  return {
    x: area.x + Math.floor((area.width - width) / 2),
    y: area.y + Math.floor((area.height - height) / 2),
    width,
    height,
  };
}

function aboveControls(area, { safe, buttonScale }) {
  const controls = CONTROLS_HEIGHT * buttonScale;
  const free = area.height - safe.top - PAUSE_ROW - safe.bottom - controls;
  const width = Math.max(0, Math.min(area.width, Math.floor((free * 16) / 9)));
  const height = Math.round((width * 9) / 16);
  const room = (area.height - safe.bottom - controls - height) / 2;

  return {
    x: area.x + Math.floor((area.width - width) / 2),
    y: area.y + Math.round(Math.max(safe.top + PAUSE_ROW, room)),
    width,
    height,
  };
}

function belowTheTop(area, safe) {
  return { ...area, y: area.y + safe.top, height: area.height - safe.top };
}

// where the stage stands, whether the touch buttons stand under it, and the area the touch layer
// (stick, buttons and pause) keeps to, null for the whole screen; a phone half-folded on a table
// shows the game on its top half and every touch control on the bottom half, like a handheld
export function arrangeStage({ width, height, safe, touch, buttonScale, hinge }) {
  if (hinge?.stacked) {
    const rect = fitted(belowTheTop(hinge.game, safe));

    return { rect, controlsBelow: touch, touchArea: hinge.controls };
  }

  const area = hinge?.game ?? { x: 0, y: 0, width, height };
  const below = aboveControls(area, { safe, buttonScale });
  const overlaid = fitted(area);

  if (touch && below.width >= overlaid.width * SHRINK_FOR_CONTROLS) {
    return { rect: below, controlsBelow: true, touchArea: null };
  }

  return { rect: overlaid, controlsBelow: false, touchArea: null };
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
