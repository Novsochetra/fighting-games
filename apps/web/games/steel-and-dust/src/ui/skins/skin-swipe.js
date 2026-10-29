// a thumb swiped across the screen shows the next skin, as a photo flicks by: right to left for
// the next one; a drag too short, or more up than across, is no swipe. One that starts on the bar
// or a control is not beside the controls at all, as a control pressed is picked and dragged
const SWIPE = 40;
const NOT_BESIDE = '.layout-bar, .skin-preview [data-control]';

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
    start = event.target.closest(NOT_BESIDE)
      ? null
      : { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
  });
  section.addEventListener('pointerup', (event) => {
    const beside = start?.pointerId === event.pointerId;
    const step = beside ? swipeStep(start, event) : 0;

    start = null;

    if (beside) {
      picker.beside(step);
    }
  });
  section.addEventListener('pointercancel', () => {
    start = null;
  });
}
