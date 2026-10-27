import { describe, expect, it } from 'vitest';
import { HERO_SPRITES } from '../../../src/data/hero-sprites.js';
import { heroById } from '../../../src/data/heroes.js';
import { WEAPON_IDS } from '../../../src/data/weapons/index.js';
import { readPngAlpha } from '../../support/png-alpha.js';

// Bug: the Angkor Warrior's head was cut off in the first two frames of his dash. His sheet's cell
// sliced it down a straight line at this column, taking his brow, nose and chin with it and leaving
// a flat edge where his face should be; those frames now carry the head drawn whole in the next one
const CUT_COLUMN = 102;
const HEAD_ROWS = { top: 56, bottom: 84 };
// his profile reaches a few pixels past the cut, down most of his face
const FACE_PAST_CUT = 12;
const CUT_FRAMES = [0, 1];
const ANGKOR = heroById('angkor');
const GAME = new URL('../../../', import.meta.url);
const { frameWidth } = HERO_SPRITES;

function facePastCut(image, { row, frame }) {
  const height = image.height / WEAPON_IDS.length;
  let painted = 0;

  for (let y = row * height + HEAD_ROWS.top; y <= row * height + HEAD_ROWS.bottom; y++) {
    for (let x = frame * frameWidth + CUT_COLUMN + 1; x < (frame + 1) * frameWidth; x++) {
      painted += image.alpha(x, y) > 0 ? 1 : 0;
    }
  }

  return painted;
}

describe("the Angkor Warrior's dash", () => {
  const image = readPngAlpha(new URL(`${ANGKOR.directory}hero_dash.png`, GAME));

  it.each(WEAPON_IDS.map((weapon, row) => [weapon, row]))(
    'shows his whole face in its first frames with the %s',
    (_weapon, row) => {
      const cut = CUT_FRAMES.filter((frame) => facePastCut(image, { row, frame }) < FACE_PAST_CUT);

      expect(cut).toEqual([]);
    },
  );
});
