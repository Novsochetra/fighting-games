import { prefersReducedMotion, readDuration } from './motion-tokens.js';
import { createSheet } from './sheet.js';

// The note waits for the button to pop in, says thank you for a while, then steps back into it.
export const COFFEE_NOTE_DELAY_MS = 2400;
export const COFFEE_NOTE_MS = 9000;

function findElements(document) {
  const byId = (id) => document.getElementById(id);
  return {
    button: byId('coffee-open'),
    note: byId('coffee-note'),
    noteOpen: byId('coffee-note-open'),
    noteClose: byId('coffee-note-close'),
    dialog: byId('coffee-sheet'),
    close: byId('coffee-close'),
    khqr: byId('coffee-khqr'),
    card: byId('coffee-bmc'),
  };
}

// Its exit runs on a timer the length of its token, as the sheets' does, since a browser may never
// send animationend for a hidden page.
function createNote({ note, document, signal }) {
  let timer = null;
  const later = (task, delay) => {
    clearTimeout(timer);
    timer = setTimeout(task, delay);
  };
  const settle = () => {
    note.hidden = true;
    note.classList.remove('is-hiding');
  };
  function hide() {
    clearTimeout(timer);
    if (note.hidden || note.classList.contains('is-hiding')) {
      return;
    }
    const reduced = prefersReducedMotion(document.defaultView);
    const duration = reduced ? 0 : readDuration(document, '--duration-fade');
    if (duration <= 0) {
      settle();
      return;
    }
    note.classList.add('is-hiding');
    later(settle, duration);
  }
  function show() {
    note.hidden = false;
    later(hide, COFFEE_NOTE_MS);
  }
  signal.addEventListener('abort', () => clearTimeout(timer));
  return { hide, schedule: () => later(show, COFFEE_NOTE_DELAY_MS) };
}

// The coffee button floats over the arcade like Buy Me a Coffee's own widget, but opens the arcade's
// sheet with both ways to give: KHQR on the supporters page, or a card on Buy Me a Coffee.
export function wireCoffee({ document, sound, signal }) {
  const elements = findElements(document);
  const { dialog, close: closeButton } = elements;
  const sheet = createSheet({ dialog, closeButton, document, sound, signal });
  const note = createNote({ note: elements.note, document, signal });
  const open = () => {
    note.hide();
    sheet.open();
  };
  elements.button.addEventListener('click', open, { signal });
  elements.noteOpen.addEventListener('click', open, { signal });
  elements.noteClose.addEventListener('click', () => note.hide(), { signal });
  // KHQR leaves for the supporters page, so the sheet is gone when the arcade comes back; a card
  // opens in a new tab, so the sheet steps aside behind it.
  elements.khqr.addEventListener('click', () => sheet.finish(), { signal });
  elements.card.addEventListener('click', () => sheet.close(), { signal });
  note.schedule();
  return { sheet, note };
}
