import { POSTER_SIZES } from '../../online/poster-sizes.js';
import { canvasBlob, drawCardCanvas } from './card-canvas.js';

const JPEG_QUALITY = 0.8;

function scaledTo(document, card, size) {
  if (size.width === card.width) {
    return card;
  }

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  Object.assign(canvas, { width: size.width, height: size.height });
  context.imageSmoothingQuality = 'high';
  context.drawImage(card, 0, 0, size.width, size.height);

  return canvas;
}

function base64Of(window, blob) {
  return new Promise((resolve, reject) => {
    const reader = new window.FileReader();

    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// the card of a run posted online, as the board keeps it: naming who played, in every size it shows
export function createBoardPoster({ window, document }) {
  return async (run, name) => {
    const card = await drawCardCanvas({ window, document, run, rank: null, name });
    const encode = async (size) => {
      const blob = await canvasBlob(scaledTo(document, card, size), size.type, JPEG_QUALITY);

      return [size.name, await base64Of(window, blob)];
    };

    return Object.fromEntries(await Promise.all(POSTER_SIZES.map(encode)));
  };
}
