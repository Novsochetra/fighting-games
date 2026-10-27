import { VIEW_HEIGHT, VIEW_WIDTH } from '../../config.js';

// room above the stage for the pause button, and the touch buttons' height before the Button size
const PAUSE_ROW = 56;
const CONTROLS_HEIGHT = 260;
// on a screen held sideways the touch buttons stand under the stage instead of over the fight when
// that costs the stage at most a fifth of its width: an unfolded foldable or a big tablet
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

// the widest stage the space above the touch buttons holds
function widthAboveControls(area, { safe, buttonScale }) {
  const free = area.height - safe.top - PAUSE_ROW - safe.bottom - CONTROLS_HEIGHT * buttonScale;

  return Math.max(0, Math.min(area.width, Math.floor((free * 16) / 9)));
}

function aboveControls(area, { safe, buttonScale }, width) {
  const height = Math.round((width * 9) / 16);
  const room = (area.height - safe.bottom - CONTROLS_HEIGHT * buttonScale - height) / 2;

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

// the stage over the touch buttons, or null to leave them over the fight; an upright screen always
// stands it over them, as wide as the screen, as it always has
function stageOverControls(area, options) {
  if (isPortrait(area.width, area.height)) {
    return aboveControls(area, options, area.width);
  }

  const width = widthAboveControls(area, options);
  const fits = width >= fitted(area).width * SHRINK_FOR_CONTROLS;

  return fits ? aboveControls(area, options, width) : null;
}

// where the stage stands, and whether the touch buttons stand under it; a phone half-folded on a
// table shows the game on its top half and the touch controls on the bottom half, like a handheld
export function arrangeStage({ width, height, safe, touch, buttonScale, hinge }) {
  if (hinge?.stacked) {
    return { rect: fitted(belowTheTop(hinge.game, safe)), controlsBelow: touch };
  }

  const area = hinge?.game ?? { x: 0, y: 0, width, height };
  const below = touch && stageOverControls(area, { safe, buttonScale });

  return below
    ? { rect: below, controlsBelow: true }
    : { rect: fitted(area), controlsBelow: false };
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
