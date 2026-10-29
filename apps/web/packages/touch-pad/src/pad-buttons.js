import { itemOf } from './pad-markup.js';

// a button presses every input the skin maps it to, so one button can press a combo, and lets
// them all go together. Each press flips its `data-pulse` between a and b, so a skin can play an
// animation of its own (a ring popping out) afresh on every press, even when a quick tap ends it
// sooner, or the next press comes before it is over
export function pressButton(button, handler, event) {
  event.preventDefault();

  for (const input of itemOf(button).inputs) {
    handler.press(input);
  }

  button.classList.add('on');
  button.dataset.pulse = button.dataset.pulse === 'a' ? 'b' : 'a';
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
