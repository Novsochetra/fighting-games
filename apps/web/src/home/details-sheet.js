import { escapeHtml } from './escape-html.js';
import { createSheet } from './sheet.js';

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
  elements.art.parentElement.hidden = card.artSrc === '';
  if (card.artSrc !== '') {
    elements.art.setAttribute('src', card.artSrc);
  }
  elements.art.classList.toggle('is-smooth', Boolean(card.smoothArt));
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

export function createDetailsSheet({ document, sound, signal }) {
  const elements = findElements(document);
  const sheet = createSheet({
    dialog: elements.dialog,
    closeButton: elements.close,
    document,
    sound,
    signal,
  });

  function open(card) {
    if (!card) {
      return;
    }
    sheet.finish();
    fill(elements, card);
    sheet.open();
  }

  return { ...sheet, open, elements };
}
