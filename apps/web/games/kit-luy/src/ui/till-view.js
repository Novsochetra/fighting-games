import { RIEL } from '../data/currency.js';
import { replay } from './dom.js';
import { createPiece } from './piece.js';

// the thumb's row is the four everyday values; above each of the last three, ten times as much
const PLACES = [100, 10000, 20000, 50000, 500, 1000, 2000, 5000];
const WAD = 3;

function bundleOf(document, value, text) {
  const bundle = document.createElement('button');
  const key = document.createElement('kbd');
  const wad = document.createElement('span');

  bundle.className = 'bundle is-bare';
  bundle.dataset.value = String(value);
  bundle.setAttribute('aria-label', text.money(value));
  key.textContent = String(RIEL.pieces.indexOf(value) + 1);
  wad.className = 'wad';

  for (let i = WAD - 1; i >= 0; i--) {
    const piece = createPiece(document, value, text);

    piece.style.setProperty('--under', String(i));
    wad.append(piece);
  }

  bundle.append(wad, key);

  return bundle;
}

export function createTillView({ till, text }) {
  const document = till.ownerDocument;
  let held = [];

  function show(pieces) {
    held = pieces;

    for (const bundle of till.children) {
      const bare = !pieces.includes(Number(bundle.dataset.value));

      bundle.classList.toggle('is-bare', bare);
      bundle.tabIndex = bare ? -1 : 0;
    }
  }

  function write() {
    till.replaceChildren(...PLACES.map((value) => bundleOf(document, value, text)));
    show(held);
  }

  write();

  return {
    write,
    show,
    bundle: (value) => till.querySelector(`[data-value="${value}"]`),
    pull: (value) => replay(till.querySelector(`[data-value="${value}"]`), 'is-pulled'),

    snapIn(values) {
      values.forEach((value) => replay(till.querySelector(`[data-value="${value}"]`), 'is-new'));
    },
  };
}
