import { heroById } from '../../data/heroes.js';
import { CARD_SIZE, drawShareCard } from './share-card.js';
import { SHARE_TITLE, shareText } from './share-text.js';

const BACKDROP = 'assets/ui/select/bg-landscape.png';
const FILE_NAME = 'steel-and-dust-run.png';
// the card is drawn once the over screen has come in, so drawing it never stutters the menu's entry
const PREPARE_DELAY_MS = 600;

function loadImage(window, src) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();

    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

// the canonical address is the game's one public address, the same wherever the page was opened
function gameUrl(document) {
  return document.querySelector('link[rel="canonical"]')?.href ?? document.location.href;
}

const siteOf = (url) => new URL(url).host.replace(/^www\./, '');

async function drawCardFile({ window, document, run, rank }) {
  const [backdrop, heroArt] = await Promise.all([
    loadImage(window, BACKDROP),
    loadImage(window, heroById(run.hero).cards.middle),
  ]);
  await Promise.all([400, 700].map((weight) => document.fonts?.load(`${weight} 32px Silkscreen`)));
  const canvas = document.createElement('canvas');

  Object.assign(canvas, CARD_SIZE);
  drawShareCard(canvas.getContext('2d'), {
    run,
    rank,
    backdrop,
    heroArt,
    site: siteOf(gameUrl(document)),
  });
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));

  return blob ? new window.File([blob], FILE_NAME, { type: 'image/png' }) : null;
}

function download({ window, document, file }) {
  const link = document.createElement('a');

  link.href = window.URL.createObjectURL(file);
  link.download = file.name;
  link.click();
  window.setTimeout(() => window.URL.revokeObjectURL(link.href), 10_000);
}

// the phone's share sheet takes the card and the words; a browser that shares only words shares
// those, and one that cannot share at all saves the card
async function deliver({ window, document, file, text }) {
  const { navigator } = window;
  const url = gameUrl(document);

  if (file && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: SHARE_TITLE, text: `${text}\n${url}` });
  } else if (navigator.share) {
    await navigator.share({ title: SHARE_TITLE, text, url });
  } else if (file) {
    download({ window, document, file });
  }
}

// a share sheet only opens straight from a tap, so the card is drawn ahead, as the run's end shows
export function createShare({ window, document }) {
  let prepared = null;
  const keyOf = (run, rank) => `${run.at}:${run.score}:${rank?.week ?? ''}`;

  function prepare(run, rank) {
    const key = keyOf(run, rank);

    if (prepared?.key !== key) {
      const entry = { key, file: null };

      entry.card = new Promise((resolve) => window.setTimeout(resolve, PREPARE_DELAY_MS))
        .then(() => drawCardFile({ window, document, run, rank }))
        .catch(() => null)
        .then((file) => (entry.file = file));
      prepared = entry;
    }

    return prepared.card;
  }

  async function share(run, rank) {
    const ready = prepared?.key === keyOf(run, rank) ? prepared.file : null;
    const file = ready ?? (await drawCardFile({ window, document, run, rank }).catch(() => null));

    try {
      await deliver({ window, document, file, text: shareText(run, rank) });
    } catch {
      // the player closed the share sheet, or the browser let it go
    }
  }

  return Object.assign(share, { prepare });
}
