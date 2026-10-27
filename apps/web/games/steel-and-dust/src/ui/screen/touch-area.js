// a phone half-folded on a table keeps the stick, the buttons and pause on its bottom half, so a
// thumb on the game's half never catches the stick; `area` is null for the whole screen
export function fitTouchLayer(touch, area) {
  Object.assign(touch.style, {
    left: area ? `${area.x}px` : '',
    top: area ? `${area.y}px` : '',
    width: area ? `${area.width}px` : '',
    height: area ? `${area.height}px` : '',
  });
  // the status bar's inset is at the top of the screen, not of its bottom half, where pause stands
  touch.style.setProperty('--sat', area ? '0px' : '');
}
