import { replay } from '../ui/dom.js';

const DIGIT_CODE = /^(?:Digit|Numpad)(\d)$/;

function pressKey(key, actions) {
  if (key === 'erase') {
    actions.erase();
  } else if (key === 'clear') {
    actions.clear();
  } else {
    actions.type(key);
  }
}

// The pad's keys act as they are pressed, as the till's bundles do; a key pressed with Enter on
// a focused key comes only as a click no pointer made (detail 0).
export function installKeypad(keypad, actions) {
  const keyOf = (event) => event.target.closest?.('.key')?.dataset.key;

  keypad.addEventListener('pointerdown', (event) => {
    if (event.button === 0 && keyOf(event)) {
      pressKey(keyOf(event), actions);
    }
  });
  keypad.addEventListener('click', (event) => {
    if (event.detail === 0 && keyOf(event)) {
      pressKey(keyOf(event), actions);
    }
  });
}

// a figure typed on the keyboard, 0 to 9 on either row of keys, and the pad's key for it sinks
export function typedFigure(event, keypad) {
  const figure = DIGIT_CODE.exec(event.code)?.[1];

  if (figure !== undefined) {
    const key = keypad.querySelector(`.key[data-key="${figure}"]`);

    if (key) {
      replay(key, 'is-pressed');
    }
  }

  return figure;
}
