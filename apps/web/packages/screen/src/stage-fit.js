// on a screen held sideways the touch controls stand under the stage instead of over the fight when
// that costs the stage at most a fifth of its width: an unfolded foldable or a big tablet
const SHRINK_FOR_CONTROLS = 0.8;

export function isPortrait(width, height) {
  return height > width * 1.05;
}

const greatestDivisor = (first, second) =>
  second ? greatestDivisor(second, first % second) : first;

// a view of 768x432 is drawn 16 to 9: its shape works out in its smallest terms, as it always has,
// so no width rounds a pixel away from what the game laid out before the package
function shapeOf(view) {
  const divisor = greatestDivisor(view.width, view.height);

  return { across: view.width / divisor, down: view.height / divisor };
}

// the stage keeps the view's shape and fills its area
export function fitView(area, view) {
  const scale = Math.min(area.width / view.width, area.height / view.height);
  const width = Math.floor(view.width * scale);
  const height = Math.floor(view.height * scale);

  return {
    x: area.x + Math.floor((area.width - width) / 2),
    y: area.y + Math.floor((area.height - height) / 2),
    width,
    height,
  };
}

// the widest stage the space above the touch controls holds
function widthAboveControls(area, { safe, controlsHeight, shape }) {
  const free = area.height - safe.top - safe.bottom - controlsHeight;

  return Math.max(0, Math.min(area.width, Math.floor((free * shape.across) / shape.down)));
}

// the stage stands at the top, right under the status bar: centred lower down, it ran over the fold
// of a phone half-folded on a table in a browser that cannot tell the phone is folded (Safari)
function aboveControls(area, { safe, shape }, width) {
  return {
    x: area.x + Math.floor((area.width - width) / 2),
    y: area.y + Math.round(safe.top),
    width,
    height: Math.round((width * shape.down) / shape.across),
  };
}

function belowTheTop(area, safe) {
  return { ...area, y: area.y + safe.top, height: area.height - safe.top };
}

// the stage over the touch controls, or null to leave them over the fight; an upright screen always
// stands it over them, as wide as the screen
function stageOverControls(area, options) {
  if (isPortrait(area.width, area.height)) {
    return aboveControls(area, options, area.width);
  }

  const width = widthAboveControls(area, options);
  const fits = width >= fitView(area, options.view).width * SHRINK_FOR_CONTROLS;

  return fits ? aboveControls(area, options, width) : null;
}

const sideOf = (frame, side) => frame[side] ?? 0;

// a skin's frame keeps the stage clear of the controls beside it or under it: px inside the safe
// area from each side, the stage at the top of what is left or in its middle
function framedRect({ width, height, safe, view, frame }) {
  const box = {
    x: safe.left + sideOf(frame, 'left'),
    y: safe.top + sideOf(frame, 'top'),
    width: width - safe.left - safe.right - sideOf(frame, 'left') - sideOf(frame, 'right'),
    height: height - safe.top - safe.bottom - sideOf(frame, 'top') - sideOf(frame, 'bottom'),
  };
  const rect = fitView(box, view);

  return frame.align === 'top' ? { ...rect, y: box.y } : rect;
}

// where the stage stands, and whether the touch controls stand under it: `view` is the game's size
// in its own pixels, `controlsHeight` the px its touch controls need under it, or null without
// touch controls, `frame` a skin's frame for its screen (`framed` then), and `hinge` a folded
// phone's halves (viewport-segments.js). A phone half-folded on a table shows the game on its top
// half and the controls on the bottom half, like a handheld, whatever the skin's frame
export function arrangeView({ width, height, safe, hinge, view, controlsHeight, frame }) {
  const touch = controlsHeight !== null;

  if (hinge?.stacked) {
    return { rect: fitView(belowTheTop(hinge.game, safe), view), controlsBelow: touch };
  }

  if (frame && touch && !hinge) {
    return {
      rect: framedRect({ width, height, safe, view, frame }),
      controlsBelow: false,
      framed: true,
    };
  }

  const area = hinge?.game ?? { x: 0, y: 0, width, height };
  const options = { safe, controlsHeight, view, shape: shapeOf(view) };
  const below = touch && stageOverControls(area, options);

  return below
    ? { rect: below, controlsBelow: true }
    : { rect: fitView(area, view), controlsBelow: false };
}
