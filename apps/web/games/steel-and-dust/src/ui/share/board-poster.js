import { POSTER_SIZES } from '../../online/poster-sizes.js';
import { canvasBlob, drawCardCanvas } from './card-canvas.js';
import { CARD_SIZE, HERO_SPOT } from './share-card.js';

const JPEG_QUALITY = 0.8;
const WHOLE_CARD = { x: 0, y: 0, width: CARD_SIZE.width, height: CARD_SIZE.height };
const AVATAR = { x: HERO_SPOT.x, y: HERO_SPOT.y, width: HERO_SPOT.size, height: HERO_SPOT.size };

function drawnAt(document, card, size) {
  if (size.width === card.width) {
    return card;
  }

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const from = size.name === 'avatar' ? AVATAR : WHOLE_CARD;

  Object.assign(canvas, { width: size.width, height: size.height });
  context.imageSmoothingQuality = 'high';
  context.drawImage(card, from.x, from.y, from.width, from.height, 0, 0, size.width, size.height);

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

// the card of a run posted online, as the board keeps it: naming who played, in every size it shows,
// and the hero cut out of it as the run's avatar
export function createBoardPoster({ window, document }) {
  return async (run, name) => {
    const card = await drawCardCanvas({ window, document, run, rank: null, name });
    const encode = async (size) => {
      const blob = await canvasBlob(drawnAt(document, card, size), size.type, JPEG_QUALITY);

      return [size.name, await base64Of(window, blob)];
    };

    return Object.fromEntries(await Promise.all(POSTER_SIZES.map(encode)));
  };
}
