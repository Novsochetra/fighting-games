import { describe, expect, it } from 'vitest';
import { HERO_SPRITES } from '../../../src/data/hero-sprites.js';
import { heroById } from '../../../src/data/heroes.js';
import { WEAPON_IDS, WEAPONS } from '../../../src/data/weapons/index.js';
import { readPngAlpha } from '../../support/png-alpha.js';

// Bug: the Angkor Warrior stood, walked and ran with empty hands. His own weapon was his fists, so
// every strip was drawn from its fists row, where the bake takes his dav away, though his card and
// his ultimate hold it. Where his strips did hold it, as he ran and dashed, it hung at his hip with
// no hand on it; heroes/angkor/sword/ now draws it gripped in his trailing fist
const ANGKOR = heroById('angkor');
const MOVEMENT_STRIPS = ['idle', 'walk', 'run', 'jump', 'land', 'dash'];
const HAND_DRAWN = ['run', 'dash'];
// the dav's gold glows in at least this many pixels of a frame; the fists row, with it taken away,
// keeps under a dozen (his armlets and the gold of his sash)
const DAV_GLOW = 40;
const GAME = new URL('../../../', import.meta.url);
const { frameWidth } = HERO_SPRITES;

function hueOf(red, green, blue) {
  const most = Math.max(red, green, blue);
  const spread = most - Math.min(red, green, blue);

  if (!spread) {
    return 0;
  }

  if (most === red) {
    return (((green - blue) / spread) * 60 + 360) % 360;
  }

  return most === green ? ((blue - red) / spread + 2) * 60 : ((red - green) / spread + 4) * 60;
}

// bright and pale, or bright and yellower than his skin, as the bake finds his blade
function glows([red, green, blue]) {
  const most = Math.max(red, green, blue);
  const saturation = most ? ((most - Math.min(red, green, blue)) * 255) / most : 0;

  return most > 215 && (saturation < 150 || hueOf(red, green, blue) > 40);
}

function frameGlow(image, { frame, top, height }) {
  let glow = 0;

  for (let y = top; y < top + height; y++) {
    for (let x = frame * frameWidth; x < (frame + 1) * frameWidth; x++) {
      glow += image.alpha(x, y) > 0 && glows(image.rgb(x, y)) ? 1 : 0;
    }
  }

  return glow;
}

// what each frame of the row his own weapon is drawn from glows with
function ownRowGlow(strip) {
  const image = readPngAlpha(new URL(`${ANGKOR.directory}hero_${strip}.png`, GAME));
  const height = image.height / WEAPON_IDS.length;
  const top = WEAPONS[ANGKOR.weapon].spriteRow * height;

  return Array.from({ length: HERO_SPRITES.frames[strip] }, (_, frame) => ({
    frame,
    glow: frameGlow(image, { frame, top, height }),
  }));
}

function rowColors(path, row, rows) {
  const image = readPngAlpha(path);
  const height = image.height / rows;
  const colors = [];

  for (let y = row * height; y < (row + 1) * height; y++) {
    for (let x = 0; x < image.width; x++) {
      colors.push(image.alpha(x, y) ? image.colorKey(x, y) : -1);
    }
  }

  return colors;
}

describe('the Angkor Warrior', () => {
  it.each(MOVEMENT_STRIPS)('holds his dav in every %s frame', (strip) => {
    const bare = ownRowGlow(strip).filter(({ glow }) => glow < DAV_GLOW);

    expect(bare).toEqual([]);
  });

  // a bake that lost the hand-drawn row would hang the dav back at his hip with no hand on it
  it.each(HAND_DRAWN)('draws his %s from the row drawn with the dav in his fist', (strip) => {
    const drawn = rowColors(
      new URL(`assets/sprites/heroes/angkor/sword/hero_${strip}.png`, GAME),
      0,
      1,
    );
    const baked = rowColors(
      new URL(`${ANGKOR.directory}hero_${strip}.png`, GAME),
      WEAPONS.sword.spriteRow,
      WEAPON_IDS.length,
    );
    const changed = baked.filter((color, i) => color !== drawn[i]).length;

    expect(baked.length).toBe(drawn.length);
    expect(changed).toBe(0);
  });
});
