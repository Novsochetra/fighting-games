import { escapeHtml } from './escape-html.js';
import { prefersReducedMotion, readDuration } from './motion-tokens.js';

function findElements(document) {
  const byId = (id) => document.getElementById(id);
  return {
    dialog: byId('details'),
    art: byId('details-art'),
    title: byId('details-title'),
    meta: byId('details-meta'),
    description: byId('details-description'),
    controls: byId('details-controls'),
    controlsLabel: byId('details-controls-label'),
    play: byId('details-play'),
    close: byId('details-close'),
  };
}

function fill(elements, card) {
  elements.art.parentElement.hidden = card.bannerSrc === '';
  if (card.bannerSrc !== '') {
    elements.art.setAttribute('src', card.bannerSrc);
  }
  elements.title.textContent = card.title;
  elements.meta.textContent = card.meta;
  elements.description.textContent = card.description;
  elements.controls.innerHTML = card.controls
    .map((control) => `<li class="sheet__chip">${escapeHtml(control)}</li>`)
    .join('');
  elements.controls.hidden = card.controls.length === 0;
  elements.controlsLabel.hidden = card.controls.length === 0;
  elements.play.setAttribute('href', card.href);
  elements.play.setAttribute('aria-label', `Play ${card.title}`);
}

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
function wireClosing({ dialog, close: closeButton }, { close, signal }) {
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
export function createDetailsSheet({ document, sound, signal }) {
  const elements = findElements(document);
  const { dialog } = elements;
  let closing = null;

  function finish() {
    clearTimeout(closing);
    closing = null;
    dialog.classList.remove('is-closing');
    if (dialog.open) {
      hideDialog(dialog);
    }
  }

  function open(card) {
    if (!card) {
      return;
    }
    finish();
    fill(elements, card);
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

  wireClosing(elements, { close, signal });
  return { open, close, finish, isOpen: () => dialog.open, elements };
}
