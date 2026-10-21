import { describe, expect, it } from 'vitest';
import { HERO_SPRITES, ONE_ROW_STRIPS } from '../../../src/data/hero-sprites.js';
import { HEROES } from '../../../src/data/heroes.js';
import { WEAPON_IDS } from '../../../src/data/weapons/index.js';
import { readPngAlpha } from '../../support/png-alpha.js';

// Bug: some of the Angkor Warrior's effects ran off their frame and were drawn cut straight across:
// the rising dragon's arc at the top, the thrust's blade and its glint at the right, the meteor
// slash's arc at the bottom. A frame may touch its edges with a few pixels at most, a spear's butt on
// the ground or the last specks of a fading arc
const MOST_ON_AN_EDGE = 3;
const GAME = new URL('../../../', import.meta.url);
const ANGKOR = HEROES.find(({ id }) => id === 'angkor');
const { frameWidth } = HERO_SPRITES;

function stripImage(strip) {
  const path = ONE_ROW_STRIPS.has(strip) ? ANGKOR.ultStrip : `${ANGKOR.directory}hero_${strip}.png`;
  const image = readPngAlpha(new URL(path, GAME));
  const rows = ONE_ROW_STRIPS.has(strip) ? 1 : WEAPON_IDS.length;
  return { image, rows, height: image.height / rows };
}

function onEdges({ image, height }, { left, top }) {
  const filled = (x, y) => (image.alpha(left + x, top + y) > 0 ? 1 : 0);
  const edges = { top: 0, bottom: 0, left: 0, right: 0 };
  for (let x = 0; x < frameWidth; x++) {
    edges.top += filled(x, 0);
    edges.bottom += filled(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    edges.left += filled(0, y);
    edges.right += filled(frameWidth - 1, y);
  }
  return edges;
}

function cutFrames(strip) {
  const sheet = stripImage(strip);
  const cut = [];
  for (let row = 0; row < sheet.rows; row++) {
    for (let frame = 0; frame < HERO_SPRITES.frames[strip]; frame++) {
      const edges = onEdges(sheet, { left: frame * frameWidth, top: row * sheet.height });
      if (Object.values(edges).some((count) => count > MOST_ON_AN_EDGE)) {
        cut.push({ row, frame, edges });
      }
    }
  }
  return cut;
}

describe("the Angkor Warrior's frames", () => {
  it.each(Object.keys(HERO_SPRITES.frames))('keep every %s effect inside its frame', (strip) => {
    expect(cutFrames(strip)).toEqual([]);
  });
});
