import { describe, expect, it } from 'vitest';
import { HEROES } from '../../../src/data/heroes.js';
import { HERO_SPRITES } from '../../../src/data/hero-sprites.js';
import { WEAPON_IDS } from '../../../src/data/weapons/index.js';
import { readPngAlpha } from '../../support/png-alpha.js';

// Bug: the Angkor Warrior grew when he dashed and when he landed from a jump. Each of his sheets was
// scaled so his figure stood 61 px tall, so the leaning dash and the crouch of the landing came out
// a fifth bigger than the stance he fights in. A bigger figure covers more of its frame, whatever
// the pose: every Shade's movement frames stay within this much of its idle's cover
const MOST_COVER = 1.4;
const MOVEMENT_STRIPS = ['walk', 'dash', 'land', 'jump'];
const GAME = new URL('../../../', import.meta.url);
const { frameWidth } = HERO_SPRITES;

function coverOf(image, { left, top, height }) {
  let cover = 0;
  for (let y = top; y < top + height; y++) {
    for (let x = left; x < left + frameWidth; x++) {
      cover += image.alpha(x, y) > 0 ? 1 : 0;
    }
  }
  return cover;
}

function frameCovers(hero, strip) {
  const image = readPngAlpha(new URL(`${hero.directory}hero_${strip}.png`, GAME));
  const height = image.height / WEAPON_IDS.length;
  const covers = [];
  for (let row = 0; row < WEAPON_IDS.length; row++) {
    for (let frame = 0; frame < HERO_SPRITES.frames[strip]; frame++) {
      const cover = coverOf(image, { left: frame * frameWidth, top: row * height, height });
      covers.push({ row, frame, cover });
    }
  }
  return covers;
}

function idleCover(hero) {
  const swordRow = frameCovers(hero, 'idle').filter(({ row }) => row === 0);
  return swordRow.reduce((sum, { cover }) => sum + cover, 0) / swordRow.length;
}

describe.each(HEROES.map((hero) => [hero.name, hero]))('%s', (_name, hero) => {
  it.each(MOVEMENT_STRIPS)('is drawn at its idle size in every %s frame', (strip) => {
    const most = idleCover(hero) * MOST_COVER;
    const grown = frameCovers(hero, strip).filter(({ cover }) => cover > most);
    expect(grown).toEqual([]);
  });
});
