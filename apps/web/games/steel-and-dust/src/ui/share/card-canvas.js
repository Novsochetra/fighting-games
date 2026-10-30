import { heroById } from '../../data/heroes.js';
import { CARD_SIZE, drawShareCard } from './share-card.js';

const BACKDROP = 'assets/ui/select/bg-landscape.png';

function loadImage(window, src) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();

    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

// the canonical address is the game's one public address, the same wherever the page was opened
export function gameUrl(document) {
  return document.querySelector('link[rel="canonical"]')?.href ?? document.location.href;
}

const siteOf = (url) => new URL(url).host.replace(/^www\./, '');

export async function drawCardCanvas({ window, document, run, rank, name }) {
  const [backdrop, heroArt] = await Promise.all([
    loadImage(window, BACKDROP),
    loadImage(window, heroById(run.hero).cards.middle),
  ]);
  await Promise.all([400, 700].map((weight) => document.fonts?.load(`${weight} 32px Silkscreen`)));
  const canvas = document.createElement('canvas');
  const site = siteOf(gameUrl(document));

  Object.assign(canvas, CARD_SIZE);
  drawShareCard(canvas.getContext('2d'), { run, rank, name, backdrop, heroArt, site });

  return canvas;
}

export const canvasBlob = (canvas, type, quality) =>
  new Promise((resolve) => canvas.toBlob(resolve, type, quality));
