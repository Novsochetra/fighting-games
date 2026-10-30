import { canvasBlob, drawCardCanvas, gameUrl } from './card-canvas.js';
import { SHARE_TITLE, shareText } from './share-text.js';

const FILE_NAME = 'steel-and-dust-run.png';
// the card is drawn once the over screen has come in, so drawing it never stutters the menu's entry
const PREPARE_DELAY_MS = 600;

async function drawCardFile({ window, document, run, rank }) {
  const blob = await canvasBlob(await drawCardCanvas({ window, document, run, rank }), 'image/png');

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
