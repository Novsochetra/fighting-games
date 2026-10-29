import { itemOf } from './pad-markup.js';

// a button presses every input the skin maps it to, so one button can press a combo, and lets
// them all go together
export function pressButton(button, handler, event) {
  event.preventDefault();

  for (const input of itemOf(button).inputs) {
    handler.press(input);
  }

  button.classList.add('on');
  button.setPointerCapture?.(event.pointerId);
}

export function releaseButton(button, handler) {
  if (!button.classList.contains('on')) {
    return;
  }

  for (const input of itemOf(button).inputs) {
    handler.release(input);
  }

  button.classList.remove('on');
}
