import { createPiece } from './piece.js';

const GONE_AFTER_MS = 420;
const TILTS = [-1.5, 2, -0.5, 1.5];

function pileOf(document, [value, count], text) {
  const pile = document.createElement('button');

  pile.className = 'pile';
  pile.dataset.value = value;
  pile.style.setProperty('--n', String(count));
  pile.setAttribute('aria-label', `${text.money(Number(value))} × ${text.number(count)}`);

  for (let i = 0; i < count; i++) {
    const piece = createPiece(document, Number(value), text);

    piece.style.setProperty('--i', String(i));
    piece.style.setProperty('--tilt', `${TILTS[i % TILTS.length]}deg`);
    pile.append(piece);
  }

  if (count > 1) {
    const tally = document.createElement('b');

    tally.className = 'pile-count';
    tally.textContent = `×${text.number(count)}`;
    pile.append(tally);
  }

  return pile;
}

const largestFirst = (cloth) =>
  Object.entries(cloth)
    .filter(([, count]) => count > 0)
    .sort(([left], [right]) => right - left);

const centre = (box) => ({ x: box.left + box.width / 2, y: box.top + box.height / 2 });

// The cloth is drawn from the run's count each time it changes: a fanned pile a value, largest at
// the left, a tap on a pile taking its top piece back.
export function createClothView({ piles, text, window }) {
  const document = piles.ownerDocument;

  return {
    show(cloth) {
      piles.replaceChildren(...largestFirst(cloth).map((entry) => pileOf(document, entry, text)));
    },

    // the piece just counted flies in from where its bundle lies
    land(value, bundle) {
      const pile = piles.querySelector(`.pile[data-value="${value}"]`);
      const piece = pile?.querySelectorAll('.piece');
      const top = piece?.[piece.length - 1];

      if (!top || !bundle) {
        return;
      }

      const from = centre(bundle.getBoundingClientRect());
      const to = centre(top.getBoundingClientRect());

      top.style.setProperty('--from-x', `${from.x - to.x}px`);
      top.style.setProperty('--from-y', `${from.y - to.y}px`);
      top.classList.add('is-dealt');
    },

    // a copy of the count is carried up into the bill while the cloth is already clear for the next
    handOver(target) {
      const given = piles.cloneNode(true);
      const from = centre(piles.getBoundingClientRect());
      const to = centre(target.getBoundingClientRect());

      given.removeAttribute('id');
      given.style.setProperty('--to-x', `${to.x - from.x}px`);
      given.style.setProperty('--to-y', `${to.y - from.y}px`);
      given.classList.add('is-given');
      piles.after(given);
      piles.replaceChildren();
      window.setTimeout(() => given.remove(), GONE_AFTER_MS);
    },

    hop: () => piles.querySelectorAll('.pile').forEach((pile) => pile.classList.add('is-refused')),
  };
}
