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

const keyFor = (keypad, code) => {
  const figure = DIGIT_CODE.exec(code)?.[1];

  return figure === undefined ? null : keypad.querySelector(`.key[data-key="${figure}"]`);
};

// a key sunk from the keyboard comes up as the key is let go, or as the window loses the keys
function liftKeys(keypad) {
  const window = keypad.ownerDocument.defaultView;
  const liftAll = () =>
    keypad.querySelectorAll('.is-pressed').forEach((key) => key.classList.remove('is-pressed'));

  window.addEventListener('keyup', (event) =>
    keyFor(keypad, event.code)?.classList.remove('is-pressed'),
  );
  window.addEventListener('blur', liftAll);
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
  liftKeys(keypad);
}

// a figure typed on the keyboard, 0 to 9 on either row of keys, and the pad's key for it sinks
export function typedFigure(event, keypad) {
  const key = keyFor(keypad, event.code);

  if (key) {
    replay(key, 'is-pressed');
  }

  return DIGIT_CODE.exec(event.code)?.[1];
}
