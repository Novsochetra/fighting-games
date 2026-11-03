import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { TRAINING_NUMBER } from '../../../../src/art/shirt-numbers.js';
import { SPRITES } from '../../../../src/data/sprites.js';
import { createActorArt, loadSprites } from '../../../../src/render/actors/index.js';
import { drawFootballer } from '../../../../src/render/training/footballer.js';
import { createPixelCanvas } from '../../../support/pixel-canvas.js';
import { decodePng } from '../../../support/png.js';

const GAME = fileURLToPath(new URL('../../../../', import.meta.url));
const loadImage = async (source) => decodePng(readFileSync(`${GAME}${source}`));
const actors = createActorArt({
  sprites: await loadSprites(SPRITES, { loadImage }),
  createCanvas: createPixelCanvas,
});

const hexAt = (data, at) =>
  `#${[0, 1, 2].map((i) => data[at + i].toString(16).padStart(2, '0')).join('')}`;

function numberPixelsOf(pose) {
  const canvas = createPixelCanvas(120, 100);
  let count = 0;

  drawFootballer(canvas.getContext('2d'), { actors, pose, x: 60, y: 90 });

  for (let at = 0; at < canvas.data.length; at += 4) {
    count += canvas.data[at + 3] > 0 && hexAt(canvas.data, at) === TRAINING_NUMBER ? 1 : 0;
  }

  return count;
}

describe('Sochetra in a drill', () => {
  it('wears his 10 on his back as he lines up a shot, as in a match', () => {
    expect(
      numberPixelsOf({ name: 'idle', direction: 'north', age: 0, loop: true }),
    ).toBeGreaterThan(10);
  });

  it('shows it on his chest facing us, and none side on as he weaves the cones', () => {
    expect(
      numberPixelsOf({ name: 'idle', direction: 'south', age: 0, loop: true }),
    ).toBeGreaterThan(10);
    expect(numberPixelsOf({ name: 'run', direction: 'east', stride: 9, loop: true })).toBe(0);
  });
});
