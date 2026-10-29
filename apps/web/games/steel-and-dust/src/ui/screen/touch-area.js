// a phone half-folded on a table keeps every touch control (stick, buttons and pause) to its bottom
// half, so a thumb on the game's half never catches the stick; null is the whole screen
export function touchAreaOf(hinge) {
  return hinge?.stacked ? hinge.controls : null;
}

// places the touch layer, or the Skins screen's copy of it, on that area
export function fitTouchLayer(touch, area) {
  Object.assign(touch.style, {
    left: area ? `${area.x}px` : '',
    top: area ? `${area.y}px` : '',
    width: area ? `${area.width}px` : '',
    height: area ? `${area.height}px` : '',
  });
  // the status bar's inset is at the top of the screen, not of its bottom half, where pause and a
  // skin's controls stand
  touch.style.setProperty('--sat', area ? '0px' : '');
  touch.style.setProperty('--pad-safe-top', area ? '0px' : '');
}
