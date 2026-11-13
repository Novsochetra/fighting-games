import { setText } from './dom.js';

const KEYS = [
  ['7', '8', '9', 'erase'],
  ['4', '5', '6', 'clear'],
  ['1', '2', '3', '00'],
  ['0', '000'],
];
const MARKS = { erase: '⌫', clear: 'C' };

function keyOf(document, key, text) {
  const button = document.createElement('button');
  const isDigits = /^\d+$/.test(key);

  button.className = 'key';
  button.classList.toggle('key-wide', key === '0' || key === '000');
  button.classList.toggle('key-mend', !isDigits);
  button.dataset.key = key;
  button.textContent = isDigits ? text.digits(key) : MARKS[key];

  if (!isDigits) {
    button.setAttribute('aria-label', key === 'erase' ? 'Backspace' : 'Clear');
  }

  return button;
}

export function createKeypadView({ keypad, total }, text) {
  const document = keypad.ownerDocument;

  return {
    write() {
      keypad.replaceChildren(...KEYS.flat().map((key) => keyOf(document, key, text)));
    },

    show(typed) {
      setText(total, typed === '' ? '' : text.number(Number(typed)));
    },
  };
}
