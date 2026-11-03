import { CARD_ART } from '../../art/title/cards.js';
import { ART_SCALE } from '../backdrops/raster.js';

// The dark band a card's words are written on, laid over the picture and whatever moves on it.
// It dims what lies under it nearly to night rather than dithering over it, so the words read as
// well over the bright pitch of a night stadium as over the dawn paddies; only its edges let the
// picture show through a little.
export const CARD_BAND = { y: 136, height: 50 };

const DIM = { edge: 0.74, middle: 0.93, rows: 6 };

const dimOf = (row, { y, height }) => {
  const inward = Math.min(1, Math.min(row - y, y + height - 1 - row) / DIM.rows);

  return DIM.edge + (DIM.middle - DIM.edge) * inward;
};

function artRow(context, { row, color, width }) {
  context.fillStyle = color;
  context.fillRect(0, row * ART_SCALE, width, ART_SCALE);
}

export function drawCardBand(context, { band = CARD_BAND, width }) {
  const [shade, gold, deep] = CARD_ART.band;

  context.save();

  for (let row = band.y; row < band.y + band.height; row += 1) {
    context.globalAlpha = dimOf(row, band);
    artRow(context, { row, color: shade, width });
  }

  context.globalAlpha = 1;
  [band.y - 1, band.y + band.height].forEach((row) => artRow(context, { row, color: gold, width }));
  [band.y - 2, band.y + band.height + 1].forEach((row) =>
    artRow(context, { row, color: deep, width }),
  );
  context.restore();
}
