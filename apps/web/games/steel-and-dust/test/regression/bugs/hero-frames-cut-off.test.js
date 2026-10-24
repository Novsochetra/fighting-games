import { describe, expect, it } from 'vitest';
import {
  HERO_SPRITES,
  ONE_ROW_STRIPS,
  stripPath,
  stripsOf,
} from '../../../src/data/hero-sprites.js';
import { HEROES } from '../../../src/data/heroes.js';
import { WEAPON_IDS } from '../../../src/data/weapons/index.js';
import { readPngAlpha } from '../../support/png-alpha.js';

// Bug: effects ran off the bottom or top of their frame and were drawn cut straight across: the
// Moss Shade's rising dragon fire and meteor arc, the Firefly and Antler Spirit Shades' meteor arcs,
// the Ember Shade's blade as it is juggled and its spear's arcs, the Antler Spirit Shade's spear butt
// as it gets up and Bokator's sword as he falls. A frame may touch its edges with a few pixels at
// most, a spear's butt on the ground or the last specks of a fading arc
const MOST_ON_AN_EDGE = 3;
const GAME = new URL('../../../', import.meta.url);
const { frameWidth } = HERO_SPRITES;

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

function cutFrames(hero, strip) {
  const image = readPngAlpha(new URL(stripPath(hero, strip), GAME));
  const rows = ONE_ROW_STRIPS.has(strip) ? 1 : WEAPON_IDS.length;
  const sheet = { image, height: image.height / rows };
  const cut = [];
  for (let row = 0; row < rows; row++) {
    for (let frame = 0; frame < HERO_SPRITES.frames[strip]; frame++) {
      const edges = onEdges(sheet, { left: frame * frameWidth, top: row * sheet.height });
      if (Object.values(edges).some((count) => count > MOST_ON_AN_EDGE)) {
        cut.push({ row, frame, edges });
      }
    }
  }
  return cut;
}

describe.each(HEROES.map((hero) => [hero.name, hero]))("%s's frames", (_, hero) => {
  it.each(stripsOf(hero))('keep every %s effect inside its frame', (strip) => {
    expect(cutFrames(hero, strip)).toEqual([]);
  });
});
