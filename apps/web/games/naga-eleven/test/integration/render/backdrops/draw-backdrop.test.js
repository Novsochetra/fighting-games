import { afterEach, describe, expect, it } from 'vitest';
import { VIEW } from '../../../../src/config.js';
import {
  BACKDROP_IDS,
  drawBackdrop,
  setBackdropCanvasFactory,
} from '../../../../src/render/backdrops/index.js';
import { createPixelCanvas } from '../../../support/pixel-canvas.js';

const README_IDS = [
  'village-dawn',
  'village-dusk',
  'home-night',
  'school-yard',
  'city-street',
  'high-school',
  'temple-dawn',
  'training-ground',
  'dressing-room',
  'federation-office',
  'airport',
  'hotel-night',
  'stadium-tunnel',
  'village-tv',
  'trophy-stage',
  'angkor-sunrise',
  'black',
];

// the scenes with something moving every few ticks: mist, lamps, fireflies, flags, flashes
const ANIMATED = README_IDS.filter((id) => !['high-school', 'black'].includes(id));

function drawn(id, tick = 0) {
  const canvas = createPixelCanvas(VIEW.width, VIEW.height);

  drawBackdrop(canvas.getContext('2d'), id, { tick });

  return canvas.data;
}

const sameImage = (first, second) => first.every((value, i) => value === second[i]);

afterEach(() => setBackdropCanvasFactory(null));

describe('the story backdrops', () => {
  setBackdropCanvasFactory(null);

  it('has a painting for every backdrop the story names', () => {
    expect([...BACKDROP_IDS].sort()).toEqual([...README_IDS].sort());
  });

  it.each(README_IDS)('%s fills the whole view with opaque pixels', (id) => {
    const data = drawn(id);

    expect(data.filter((_, i) => i % 4 === 3).every((alpha) => alpha === 255)).toBe(true);
  });

  it('paints every place differently', () => {
    const images = README_IDS.map((id) => drawn(id));

    images.forEach((image, i) => {
      images.slice(i + 1).forEach((other) => expect(sameImage(image, other)).toBe(false));
    });
  });

  it('draws black for black and for an id it does not know', () => {
    [drawn('black'), drawn('not-a-place')].forEach((data) => {
      expect(data.filter((_, i) => i % 4 !== 3).every((value) => value === 0)).toBe(true);
    });
  });

  it('draws the same frame the same way twice, with no randomness', () => {
    expect(sameImage(drawn('village-dusk', 77), drawn('village-dusk', 77))).toBe(true);
  });

  it.each(ANIMATED)('%s moves as the ticks go by', (id) => {
    const first = drawn(id, 0);
    const later = [31, 97, 211, 307, 419].map((tick) => drawn(id, tick));

    expect(later.some((image) => !sameImage(first, image))).toBe(true);
  });

  it('keeps a still scene still', () => {
    expect(sameImage(drawn('high-school', 0), drawn('high-school', 500))).toBe(true);
  });
});

describe('the backdrop cache', () => {
  it('paints a scene once into a canvas of the factory and draws the same picture', () => {
    const made = [];

    setBackdropCanvasFactory((width, height) => {
      made.push([width, height]);

      return createPixelCanvas(width, height);
    });

    const cached = [drawn('trophy-stage', 5), drawn('trophy-stage', 5)];

    setBackdropCanvasFactory(null);

    expect(made).toEqual([[384, 216]]);
    expect(sameImage(cached[0], drawn('trophy-stage', 5))).toBe(true);
    expect(sameImage(cached[0], cached[1])).toBe(true);
  });
});
