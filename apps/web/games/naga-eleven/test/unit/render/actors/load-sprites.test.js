import { describe, expect, it } from 'vitest';
import { loadSprites } from '../../../../src/render/actors/load-sprites.js';
import { FAKE_SPRITES, fakeImageLoader } from '../../../support/fake-sprites.js';

describe('loading the sprite sheets', () => {
  it('loads every sheet the manifest names, once each', async () => {
    const { loadImage, asked } = fakeImageLoader();
    const shared = {
      ...FAKE_SPRITES,
      animations: { ...FAKE_SPRITES.animations, celebrate: { ...FAKE_SPRITES.animations.idle } },
    };
    const sprites = await loadSprites(shared, { loadImage });

    expect(asked.sort()).toEqual(['fake/idle.png', 'fake/kick.png', 'fake/run.png']);
    expect(Object.keys(sprites.images).sort()).toEqual(['celebrate', 'idle', 'kick', 'run']);
    expect(sprites.images.celebrate).toBe(sprites.images.idle);
  });

  it('leaves out an animation whose sheet fails, so the player falls back from it', async () => {
    const { loadImage } = fakeImageLoader({ failing: ['fake/kick.png'] });
    const sprites = await loadSprites(FAKE_SPRITES, { loadImage });

    expect(Object.keys(sprites.manifest.animations).sort()).toEqual(['idle', 'run']);
  });

  it('gives no sprites with no manifest, or with neither a run nor an idle', async () => {
    const { loadImage } = fakeImageLoader({ failing: ['fake/idle.png', 'fake/run.png'] });

    expect(await loadSprites(null, { loadImage })).toBeNull();
    expect(await loadSprites(FAKE_SPRITES, { loadImage })).toBeNull();
  });
});
