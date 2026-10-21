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
// His attacks and ultimate too: the cleave's wind-up stood nearly a third bigger than his stance,
// the rising dragon and the ultimate a fifth. The glow of his dav and its arcs and his flying cape are no part of his size, so
// only the rest of him is weighed, the arms flung out on a strike allowed a little more
const MOST_BODY = 1.2;
const ANGKOR_ATTACKS = ['slash1', 'slash2', 'spin_slash', 'thrust', 'rising_dragon', 'cleave'];
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

function isBody([red, green, blue]) {
  const most = Math.max(red, green, blue);
  const saturation = most ? ((most - Math.min(red, green, blue)) * 255) / most : 0;
  const glow = most > 215 && (saturation < 150 || hueOf(red, green, blue) > 40);
  const cape = red > green * 1.6 && red > blue * 1.4 && green < 90;
  return !glow && !cape;
}

const ANGKOR = HEROES.find(({ id }) => id === 'angkor');

// his sword row, the one every other weapon's row is baked from, or the one row of his ultimate
function bodySizes(strip) {
  const ult = strip === 'ult';
  const path = ult ? ANGKOR.ultStrip : `${ANGKOR.directory}hero_${strip}.png`;
  const image = readPngAlpha(new URL(path, GAME));
  const height = ult ? image.height : image.height / WEAPON_IDS.length;
  return Array.from({ length: HERO_SPRITES.frames[strip] }, (_, frame) => {
    let body = 0;
    for (let y = 0; y < height; y++) {
      for (let x = frame * frameWidth; x < (frame + 1) * frameWidth; x++) {
        body += image.alpha(x, y) > 0 && isBody(image.rgb(x, y)) ? 1 : 0;
      }
    }
    return { frame, body };
  });
}

describe("the Angkor Warrior's attacks and ultimate", () => {
  const idle = bodySizes('idle');
  const stance = idle.reduce((sum, { body }) => sum + body, 0) / idle.length;

  it.each([...ANGKOR_ATTACKS, 'ult'])(
    'keep him at his idle size through every %s frame',
    (strip) => {
      const grown = bodySizes(strip).filter(({ body }) => body > stance * MOST_BODY);
      expect(grown).toEqual([]);
    },
  );
});
