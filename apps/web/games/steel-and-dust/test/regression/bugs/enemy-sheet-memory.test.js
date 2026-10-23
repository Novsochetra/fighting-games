import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadEnemySprites } from '../../../src/render/fighters/enemy-sprites.js';
import { paintedPixels, readPngAlpha } from '../../support/png-alpha.js';
import { TrackedImage } from '../../support/tracked-image.js';

// Bug: the enemy sheets took 251 MB once the browser had unpacked them to draw, 42 MB for the Naga
// Raja alone, and every one of them loaded at the start. A boss's sheet is a grid of cells each as
// big as the boss's widest move, so 88 to 96 percent of it was empty, and the empty pixels cost as
// much memory as painted ones: too much for a phone.
const GAME_ROOT = join(import.meta.dirname, '../../../');
const MEGABYTE = 1024 * 1024;
const MOST_MEGABYTES = 64;
const LEAST_PAINTED = 0.25;

function loadedSheets() {
  const sheets = loadEnemySprites({
    createImage: () => new TrackedImage(),
    createCanvas: () => null,
    baseUrl: '',
  });
  return Object.values(sheets.images);
}

function paintedShare(path) {
  const image = readPngAlpha(join(GAME_ROOT, path));
  return paintedPixels(image) / (image.width * image.height);
}

describe('the enemy sheets the game loads', () => {
  it('take a few dozen megabytes unpacked, not hundreds', () => {
    const bytes = loadedSheets().reduce((sum, image) => sum + image.width * image.height * 4, 0);
    expect(bytes / MEGABYTE).toBeLessThan(MOST_MEGABYTES);
  });

  it('are mostly painted, with the empty space round each frame cut away', () => {
    for (const image of loadedSheets()) {
      expect(paintedShare(image.path), image.path).toBeGreaterThan(LEAST_PAINTED);
    }
  });
});
