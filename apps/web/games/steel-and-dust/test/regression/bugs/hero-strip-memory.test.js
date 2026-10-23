import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { HEROES } from '../../../src/data/heroes.js';
import { createView } from '../../../src/render/create-view.js';
import { loadHeroSprites } from '../../../src/render/fighters/hero-sprites.js';
import { sceneLoaded } from '../../../src/render/scene-loaded.js';
import { RecordingCanvas } from '../../support/recording-canvas.js';
import { paintedPixels, readPngAlpha } from '../../support/png-alpha.js';
import { TrackedImage } from '../../support/tracked-image.js';

// Bug: the seven Shades' strips took 142 MB once the browser had unpacked them to draw, all of them
// loaded at the start, though a run only ever draws the Shade picked. A strip is a grid of cells
// each as big as the Shade's widest blow, so 85 to 88 percent of it was empty, and the empty pixels
// cost as much memory as painted ones.
const GAME_ROOT = join(import.meta.dirname, '../../../');
const MEGABYTE = 1024 * 1024;
const MOST_MEGABYTES = 64;
const LEAST_PAINTED = 0.25;
const MOST_MEGABYTES_HELD = 10;

function loadedStrips(hero) {
  const sheet = loadHeroSprites({
    createImage: () => new TrackedImage(),
    createCanvas: () => null,
    baseUrl: '',
    hero,
  });
  return Object.values(sheet.images);
}

describe("the Shades' strips the game loads", () => {
  it('take a few dozen megabytes unpacked, not more than a hundred', () => {
    const strips = HEROES.flatMap(loadedStrips);
    const bytes = strips.reduce((sum, image) => sum + image.width * image.height * 4, 0);
    expect(bytes / MEGABYTE).toBeLessThan(MOST_MEGABYTES);
  });

  it('are mostly painted, with the empty space round each frame cut away', () => {
    for (const hero of HEROES) {
      const images = loadedStrips(hero).map((strip) => readPngAlpha(join(GAME_ROOT, strip.path)));
      const painted = images.reduce((sum, image) => sum + paintedPixels(image), 0);
      const area = images.reduce((sum, image) => sum + image.width * image.height, 0);
      expect(painted / area, hero.id).toBeGreaterThan(LEAST_PAINTED);
    }
  });

  it("are one Shade's at a time through a run, whichever is picked", () => {
    const createCanvas = (width, height) => Object.assign(new RecordingCanvas(), { width, height });
    const view = createView({
      context: createCanvas(768, 432).getContext('2d'),
      createCanvas,
      createImage: () => new TrackedImage(),
      baseUrl: '',
    });
    for (const hero of HEROES) {
      sceneLoaded(view, { missionIndex: 0, settings: { hero: hero.id }, mode: 'play' });
      const held = Object.values(view.heroSheets).flatMap((sheet) => Object.values(sheet.images));
      const bytes = held.reduce((sum, image) => sum + image.width * image.height * 4, 0);
      expect(Object.keys(view.heroSheets), hero.id).toEqual([hero.id]);
      expect(bytes / MEGABYTE, hero.id).toBeLessThan(MOST_MEGABYTES_HELD);
    }
  });
});
