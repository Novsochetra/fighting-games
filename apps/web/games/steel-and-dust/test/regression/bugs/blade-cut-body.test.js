import { expect, it } from 'vitest';
import { HERO_SPRITES, stripPath } from '../../../src/data/hero-sprites.js';
import { HEROES } from '../../../src/data/heroes.js';
import { WEAPON_IDS, WEAPONS } from '../../../src/data/weapons/index.js';
import { readPngAlpha } from '../../support/png-alpha.js';

// Bug: taking a Shade's sword out of its hands for its other weapons (tools/bake_hero_weapons.py) cut
// away the body the blade lay across with it, so in the fists, spear and axe rows the Blue Shade's
// cape came apart from his body, and his back and his boot's sole were sliced open as he flinched,
// and the Antler Spirit Shade's chest was as he landed. Each line runs across the body where the
// blade lay, and stays unbroken in every weapon row
const GAME = new URL('../../../', import.meta.url);
const { frameWidth } = HERO_SPRITES;
const ACROSS_THE_BLADE = [
  {
    hero: 'blue',
    strip: 'hurt',
    frame: 1,
    part: 'cape',
    lines: [
      { y: 52, from: 50, to: 57 },
      { y: 56, from: 45, to: 56 },
    ],
  },
  {
    hero: 'blue',
    strip: 'hurt',
    frame: 2,
    part: 'back',
    lines: [
      { y: 42, from: 54, to: 62 },
      { y: 45, from: 53, to: 63 },
    ],
  },
  { hero: 'blue', strip: 'hurt', frame: 2, part: 'boot', lines: [{ y: 75, from: 57, to: 66 }] },
  {
    hero: 'antler',
    strip: 'land',
    frame: 2,
    part: 'chest',
    lines: [
      { y: 52, from: 60, to: 79 },
      { y: 54, from: 60, to: 71 },
    ],
  },
];

function gapsAlong(image, { left, top }, { y, from, to }) {
  const gaps = [];
  for (let x = from; x <= to; x++) {
    if (image.alpha(left + x, top + y) === 0) {
      gaps.push(x);
    }
  }
  return gaps;
}

function stripImage(heroId, strip) {
  const hero = HEROES.find(({ id }) => id === heroId);
  return readPngAlpha(new URL(stripPath(hero, strip), GAME));
}

function gapsIn({ hero, strip, frame, lines }) {
  const image = stripImage(hero, strip);
  const height = image.height / WEAPON_IDS.length;
  return ['fists', 'spear', 'axe'].flatMap((weapon) => {
    const corner = { left: frame * frameWidth, top: WEAPONS[weapon].spriteRow * height };
    return lines
      .map((line) => ({ weapon, y: line.y, gaps: gapsAlong(image, corner, line) }))
      .filter(({ gaps }) => gaps.length > 0);
  });
}

it.each(ACROSS_THE_BLADE)(
  "keeps the $hero Shade's $part whole in every weapon row of $strip frame $frame",
  (sight) => {
    expect(gapsIn(sight)).toEqual([]);
  },
);
