import { replay } from './dom.js';
import { createPiece } from './piece.js';

// the hand-over's own length (--duration-tear), so the copy fades out before it goes
const GONE_AFTER_MS = 540;
const TILTS = [-1.5, 2, -0.5, 1.5];
const FAN_Y = 6;
const MOST_FAN_HEIGHT = 30;
const ROUNDING_SLACK = 2;

function pileOf(document, [value, count], text) {
  const pile = document.createElement('button');

  pile.className = 'pile';
  pile.dataset.value = value;
  pile.style.setProperty('--n', String(count));
  pile.style.setProperty(
    '--fan-y',
    `${Math.min(FAN_Y, MOST_FAN_HEIGHT / Math.max(1, count - 1))}px`,
  );
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

const widthOf = (row, gap) =>
  row.reduce((sum, pile) => sum + pile.offsetWidth, 0) + gap * (row.length - 1);

function closeUp(row, room, gap) {
  const needed = widthOf(row, gap);

  if (row.length < 2 || needed <= room) {
    return;
  }

  // closed to the cloth's width exactly, rounding could still wrap the last pile onto a new row
  const overlap = (needed - room + ROUNDING_SLACK) / (row.length - 1);

  row.slice(1).forEach((pile) => {
    pile.style.marginLeft = `${-overlap}px`;
  });
}

// Piles that do not fit in one row take two where the cloth is tall enough, and only then close
// up: a pile covered past its figure is told from another only by its hue.
function fit(piles) {
  const all = [...piles.children];
  const style = piles.ownerDocument.defaultView.getComputedStyle(piles);
  const gap = parseFloat(style.columnGap) || 0;
  const room = piles.clientWidth;

  if (all.length < 2 || room === 0 || widthOf(all, gap) <= room) {
    return;
  }

  const tallest = Math.max(...all.map((pile) => pile.offsetHeight));
  const half = Math.ceil(all.length / 2);

  if (piles.clientHeight < tallest * 2 + (parseFloat(style.rowGap) || 0)) {
    closeUp(all, room, gap);

    return;
  }

  const rowBreak = piles.ownerDocument.createElement('span');

  rowBreak.className = 'pile-break';
  all[half - 1].after(rowBreak);
  closeUp(all.slice(0, half), room, gap);
  closeUp(all.slice(half), room, gap);
}

const centre = (box) => ({ x: box.left + box.width / 2, y: box.top + box.height / 2 });

export function createClothView({ piles, text, window }) {
  const document = piles.ownerDocument;

  return {
    show(cloth) {
      piles.replaceChildren(...largestFirst(cloth).map((entry) => pileOf(document, entry, text)));
      fit(piles);
    },

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

    hop: () => piles.querySelectorAll('.pile').forEach((pile) => replay(pile, 'is-refused')),
  };
}
