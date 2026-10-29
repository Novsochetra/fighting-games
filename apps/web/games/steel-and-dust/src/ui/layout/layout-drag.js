// a few pixels of wobble in a tap must not move the control
const DRAG_THRESHOLD = 6;

function startDrag(editor, element, event) {
  const control = element.dataset.control;
  const centre = editor.controls.centreOnScreen(control);
  return {
    pointerId: event.pointerId,
    control,
    element,
    start: { x: event.clientX, y: event.clientY },
    offset: { x: centre.x - event.clientX, y: centre.y - event.clientY },
    moving: false,
  };
}

// the control keeps the same distance from the finger as where it was grabbed, so it never jumps
function follow(drag, event, editor) {
  const point = { x: event.clientX, y: event.clientY };
  const travel = Math.hypot(point.x - drag.start.x, point.y - drag.start.y);
  if (!drag.moving && travel < DRAG_THRESHOLD) {
    return;
  }
  drag.moving = true;
  drag.element.classList.add('dragging');
  editor.moveTo(drag.control, { x: point.x + drag.offset.x, y: point.y + drag.offset.y });
}

// a press picks a control and a drag moves it, with a finger or the mouse; one at a time
export function installLayoutDrag(preview, editor) {
  let drag = null;
  preview.addEventListener('pointerdown', (event) => {
    const element = event.target.closest('[data-control]');
    if (!element || drag) {
      return;
    }
    event.preventDefault();
    element.setPointerCapture?.(event.pointerId);
    drag = startDrag(editor, element, event);
    editor.pick(drag.control);
  });
  preview.addEventListener('pointermove', (event) => {
    if (drag?.pointerId === event.pointerId) {
      follow(drag, event, editor);
    }
  });
  const end = (event) => {
    if (drag?.pointerId === event.pointerId) {
      drag.element.classList.remove('dragging');
      drag = null;
    }
  };
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    preview.addEventListener(type, end);
  }
}
