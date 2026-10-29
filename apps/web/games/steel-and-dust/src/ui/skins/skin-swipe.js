// a thumb swiped across the screen shows the next skin, as a photo flicks by: right to left for
// the next one; a drag too short, or more up than across, is no swipe, nor is one that starts on
// the bar, the key chooser or a key the player can change
const SWIPE = 40;
const NO_SWIPE = '.layout-bar, .key-chooser, [data-pickable]';

function swipeStep(start, event) {
  const across = event.clientX - start.x;
  const up = Math.abs(event.clientY - start.y);

  if (Math.abs(across) < SWIPE || Math.abs(across) < up * 1.2) {
    return 0;
  }

  return across < 0 ? 1 : -1;
}

export function installSwipe(section, picker) {
  let start = null;

  section.addEventListener('pointerdown', (event) => {
    start = event.target.closest(NO_SWIPE)
      ? null
      : { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
  });
  section.addEventListener('pointerup', (event) => {
    const step = start?.pointerId === event.pointerId ? swipeStep(start, event) : 0;

    start = null;

    if (step) {
      picker.step(step);
    }
  });
  section.addEventListener('pointercancel', () => {
    start = null;
  });
}
