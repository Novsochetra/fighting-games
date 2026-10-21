// a few pixels of wobble in a tap must not move the button
const DRAG_THRESHOLD = 6;

function startDrag(editor, button, event) {
  const action = button.dataset.action;
  const centre = editor.view.centreOnScreen(action);
  return {
    pointerId: event.pointerId,
    action,
    button,
    start: { x: event.clientX, y: event.clientY },
    offset: { x: centre.x - event.clientX, y: centre.y - event.clientY },
    moving: false,
  };
}

// the button keeps the same distance from the finger as where it was grabbed, so it never jumps
function follow(drag, event, editor) {
  const point = { x: event.clientX, y: event.clientY };
  const travel = Math.hypot(point.x - drag.start.x, point.y - drag.start.y);
  if (!drag.moving && travel < DRAG_THRESHOLD) {
    return;
  }
  drag.moving = true;
  drag.button.classList.add('dragging');
  editor.moveTo(drag.action, { x: point.x + drag.offset.x, y: point.y + drag.offset.y });
}

// a press picks a button and a drag moves it, with a finger or the mouse; one button at a time
export function installLayoutDrag(preview, editor) {
  let drag = null;
  preview.addEventListener('pointerdown', (event) => {
    const button = event.target.closest('.tb[data-action]');
    if (!button || drag) {
      return;
    }
    event.preventDefault();
    button.setPointerCapture?.(event.pointerId);
    drag = startDrag(editor, button, event);
    editor.pick(drag.action);
  });
  preview.addEventListener('pointermove', (event) => {
    if (drag?.pointerId === event.pointerId) {
      follow(drag, event, editor);
    }
  });
  const end = (event) => {
    if (drag?.pointerId === event.pointerId) {
      drag.button.classList.remove('dragging');
      drag = null;
    }
  };
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    preview.addEventListener(type, end);
  }
}
