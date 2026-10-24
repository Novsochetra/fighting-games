import { prefersReducedMotion, readDuration } from './motion-tokens.js';

// A modal dialog leaves the page behind it scrollable: a finger on the dimmed backdrop in iOS Safari,
// or a mouse wheel, scrolled the arcade under the sheet. It holds still while the sheet is up, as
// under a native sheet.
function holdPage(dialog, isHeld) {
  dialog.ownerDocument.documentElement.classList.toggle('has-open-sheet', isHeld);
}

function showDialog(dialog) {
  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
  } else {
    dialog.setAttribute('open', '');
  }
  holdPage(dialog, true);
  // The sheet takes the focus itself; Safari otherwise ringed the close button on a tap.
  dialog.focus({ preventScroll: true });
}

function hideDialog(dialog) {
  if (typeof dialog.close === 'function') {
    dialog.close();
  } else {
    dialog.removeAttribute('open');
  }
  holdPage(dialog, false);
}

const isOutside = (rect, { clientX, clientY }) =>
  clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom;

// Escape and a click on the dimmed page close the sheet with its animation, like the close button.
function wireClosing({ dialog, closeButton }, { close, signal }) {
  closeButton.addEventListener('click', close, { signal });
  dialog.addEventListener('close', () => holdPage(dialog, false), { signal });
  dialog.addEventListener(
    'cancel',
    (event) => {
      event.preventDefault();
      close();
    },
    { signal },
  );
  dialog.addEventListener(
    'click',
    (event) => {
      if (event.target === dialog && isOutside(dialog.getBoundingClientRect(), event)) {
        close();
      }
    },
    { signal },
  );
}

// The close animation runs on a timer the length of its token, not on animationend, which a browser
// skips when the sheet is hidden or the animation is cut short.
export function createSheet({ dialog, closeButton, document, sound, signal }) {
  let closing = null;

  function finish() {
    clearTimeout(closing);
    closing = null;
    dialog.classList.remove('is-closing');
    if (dialog.open) {
      hideDialog(dialog);
    }
  }

  function open() {
    finish();
    showDialog(dialog);
    sound.play('sheetOpen');
  }

  function close() {
    if (!dialog.open || closing) {
      return;
    }
    sound.play('sheetClose');
    const duration = readDuration(document, '--duration-fade');
    if (duration <= 0 || prefersReducedMotion(document.defaultView)) {
      finish();
      return;
    }
    dialog.classList.add('is-closing');
    closing = setTimeout(finish, duration);
  }

  wireClosing({ dialog, closeButton }, { close, signal });
  return { open, close, finish, isOpen: () => dialog.open };
}
