import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { SPRITES } from '../../../../src/data/sprites.js';
import { DIRECTIONS, rowFor } from '../../../../src/render/actors/directions.js';
import { loadSprites } from '../../../../src/render/actors/load-sprites.js';
import { anchorFor, numberAnchorsOf } from '../../../../src/render/actors/number-anchors.js';
import { STAMP } from '../../../../src/render/actors/number-stamp.js';
import { createActorArt } from '../../../../src/render/actors/sheets.js';
import { createPixelCanvas } from '../../../support/pixel-canvas.js';
import { decodePng } from '../../../support/png.js';

const GAME = fileURLToPath(new URL('../../../../', import.meta.url));
const loadImage = async (source) => decodePng(readFileSync(`${GAME}${source}`));
const sprites = await loadSprites(SPRITES, { loadImage });
const art = createActorArt({ sprites, createCanvas: createPixelCanvas });
const anchors = numberAnchorsOf(art);

const UPRIGHT = ['idle', 'run', 'kick', 'throw', 'celebrate'];
const LYING = ['slide', 'fall', 'dive'];
const facesAway = (way) => way.startsWith('north');
const facesUs = (way) => way.startsWith('south');

// every frame of an animation as drawActor finds it for each way, kept by the way its row was
// drawn facing (a sheet drawn fewer ways stands in with the nearest)
function framesOf(name, keep) {
  const animation = art.manifest.animations[name];

  return DIRECTIONS.flatMap((direction) => {
    const { row, mirror, drawn } = rowFor(animation.rows, direction);

    if (!keep(drawn)) {
      return [];
    }

    return Array.from({ length: animation.frames }, (_, frame) => ({
      at: { name, row, mirror, frame },
      size: animation.frame ?? art.manifest.frame,
    }));
  });
}

const digitsCovered = (mask) => {
  for (let y = 1; y < STAMP.height - 1; y += 1) {
    for (let x = 1; x < STAMP.width - 1; x += 1) {
      if (!mask[y * STAMP.width + x]) {
        return false;
      }
    }
  }

  return true;
};

describe('the shirt numbers on the real sheets', () => {
  it.each(UPRIGHT)('have a place on every %s frame seen from behind or in front', (name) => {
    const frames = framesOf(name, (way) => facesAway(way) || facesUs(way));

    for (const { at, size } of frames) {
      const anchor = anchorFor(anchors, at);

      expect(anchor, `${name} ${JSON.stringify(at)}`).not.toBeNull();
      expect(anchor.x).toBeGreaterThanOrEqual(0);
      expect(anchor.y).toBeGreaterThanOrEqual(0);
      expect(anchor.x + STAMP.width).toBeLessThanOrEqual(size.width);
      expect(anchor.y + STAMP.height).toBeLessThanOrEqual(size.height);
    }
  });

  it('put the digits wholly on the shirt in every frame of a run away and of standing', () => {
    const frames = [
      ...framesOf('run', (way) => way === 'north'),
      ...framesOf('idle', (way) => way === 'north' || way === 'south'),
    ];

    for (const { at } of frames) {
      expect(digitsCovered(anchors.variants[anchorFor(anchors, at).variant].mask)).toBe(true);
    }
  });

  it('keep to the torso as he runs away: the number moves no more than he does', () => {
    const places = framesOf('run', (way) => way === 'north').map(({ at }) =>
      anchorFor(anchors, at),
    );
    const across = places.map(({ x }) => x);
    const down = places.map(({ y }) => y);

    expect(Math.max(...across) - Math.min(...across)).toBeLessThanOrEqual(2);
    expect(Math.max(...down) - Math.min(...down)).toBeLessThanOrEqual(2);
  });

  it('show none side on, nor lying, sliding or diving', () => {
    const sideOn = UPRIGHT.flatMap((name) =>
      framesOf(name, (way) => !facesAway(way) && !facesUs(way)),
    );
    const lying = LYING.flatMap((name) => framesOf(name, () => true));

    for (const { at } of [...sideOn, ...lying]) {
      expect(anchorFor(anchors, at)).toBeNull();
    }
  });

  it('are clipped once for each shape of shirt under them, not once a frame', () => {
    const anchored = UPRIGHT.flatMap((name) => framesOf(name, () => true)).filter(({ at }) =>
      anchorFor(anchors, at),
    );

    expect(anchors.variants.length).toBeLessThan(anchored.length / 2);
  });

  it('are found once for the art, and not at all for art with no sheets or no canvas', () => {
    expect(numberAnchorsOf(art)).toBe(anchors);
    expect(numberAnchorsOf(createActorArt({ createCanvas: createPixelCanvas }))).toBeNull();
    expect(numberAnchorsOf(createActorArt({ sprites, createCanvas: null }))).toBeNull();
  });
});
