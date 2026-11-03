import { describe, expect, it } from 'vitest';
import { VILLAGE_FIELD } from '../../../src/art/venues/village-field.js';
import { WORLD_VIEW } from '../../../src/config.js';
import { createCamera, project } from '../../../src/render/camera.js';
import { drawVenue } from '../../../src/render/venues/index.js';
import { puddleOf } from '../../../src/render/venues/village-field/puddle.js';
import { createMatch } from '../../../src/sim/create-match.js';
import { createPixelCanvas } from '../../support/pixel-canvas.js';

// The village puddle's drop rings were baked into the ground with the rest of the field, so they
// stood still on the water all match long. A drop falls now and then, and its rings grow and fade.

const match = createMatch({ seed: 5, format: '7' });
const camera = createCamera(match);
const puddle = puddleOf(match);

camera.along.value = puddle.x + 200;

const centre = project(camera, puddle.drop.x, puddle.drop.y);
const AREA = { x: Math.round(centre.x) - 90, y: Math.round(centre.y) - 18, width: 150, height: 34 };
const canvas = createPixelCanvas(WORLD_VIEW.width, WORLD_VIEW.height);

const hexOf = (data, i) =>
  `#${[0, 1, 2].map((channel) => data[i + channel].toString(16).padStart(2, '0')).join('')}`;

// the puddle's pixels in a frame, each `{ x, y, colour }` from its centre
function puddleAt(tick) {
  drawVenue(canvas.getContext('2d'), camera, match, {
    venue: 'village-field',
    tick,
    createCanvas: createPixelCanvas,
  });

  const pixels = [];

  for (let y = AREA.y; y < AREA.y + AREA.height; y += 1) {
    for (let x = AREA.x; x < AREA.x + AREA.width; x += 1) {
      pixels.push({ x, y, colour: hexOf(canvas.data, (y * canvas.width + x) * 4) });
    }
  }

  return pixels;
}

const keyOf = (pixels) => pixels.map((pixel) => pixel.colour).join('');

describe('the village puddle', () => {
  const frames = Array.from({ length: 66 }, (_, i) => ({ tick: i * 15, pixels: puddleAt(i * 15) }));
  const keys = frames.map((frame) => keyOf(frame.pixels));
  const counts = new Map(keys.map((key) => [key, keys.filter((each) => each === key).length]));
  const stillKey = [...counts.entries()].sort((first, second) => second[1] - first[1])[0][0];
  const still = frames[keys.indexOf(stillKey)].pixels;

  it('lies still between drops, and moves while a drop’s rings are out', () => {
    expect(counts.get(stillKey)).toBeGreaterThan(frames.length * 0.3);
    expect(counts.size).toBeGreaterThan(10);
  });

  it('lights a ring on its far side and shades it on its near one', () => {
    const changed = frames
      .filter((frame, i) => keys[i] !== stillKey)
      .flatMap((frame) => frame.pixels.filter((pixel, i) => pixel.colour !== still[i].colour));
    const lit = changed.filter((pixel) => pixel.colour === VILLAGE_FIELD.water[5]);
    const shaded = changed.filter((pixel) => pixel.colour === VILLAGE_FIELD.water[1]);
    const middle = (pixels) => pixels.reduce((sum, pixel) => sum + pixel.y, 0) / pixels.length;

    expect(lit.length).toBeGreaterThan(60);
    expect(shaded.length).toBeGreaterThan(60);
    expect(middle(lit)).toBeLessThan(middle(shaded));
  });
});
