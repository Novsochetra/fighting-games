import { describe, expect, it } from 'vitest';
import { HERO_SPRITES } from '../../../src/data/hero-sprites.js';
import { HEROES } from '../../../src/data/heroes.js';
import { WEAPON_IDS, WEAPONS } from '../../../src/data/weapons/index.js';
import { readPngAlpha } from '../../support/png-alpha.js';

// Bug: with bare fists the Ember Shade still held its sword in most frames: the weapon bake
// (tools/bake_hero_weapons.py) found its wide blade along its lit edge and took only that edge, so
// its dark core, far edge and hilt stayed in his hand, and where it found his cloak or a foot for
// the blade the whole sword stayed. The Antler Spirit Shade's blade burns white at the core, which
// the bake did not count as blade, so it stayed and took the fists' gold.
const GAME = new URL('../../../', import.meta.url);
const { frameWidth } = HERO_SPRITES;
const SHADES = ['moss', 'firefly', 'antler', 'blue', 'ember'];
const SWINGS = new Set([
  'slash1',
  'slash2',
  'spin_slash',
  'thrust',
  'rising_dragon',
  'cleave',
  'air_slash',
  'air_rising_cut',
  'meteor_slash',
  'plunge',
]);
const STILL = Object.keys(HERO_SPRITES.frames).filter(
  (strip) => strip !== 'ult' && !SWINGS.has(strip),
);
// the colors the bake paints a swing in the fists row (`RAMPS['fists']`): a swing's arc, not a blade
const FISTS_SMEAR = new Set(['9a4a1a', 'e8822a', 'ffd23f', 'fff3b0']);
// a blade is a long straight run of pixels, each with open air close by on both sides of it; a
// cloak, a limb or a Shade's own flames never make one this long
const AIR_WITHIN = 3;
const LONGEST_THIN_RUN = 12;
const ANGLE_STEP = 4;
// a blade's white core is near white; the Antler Spirit's lit trim and face are teal
const WHITE_CORE = 190;
// where his hand closes on the hilt a pixel of the core may take the gold
const GOLD_ON_THE_CORE = 2;

function hexAt(image, x, y) {
  return image
    .rgb(x, y)
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('');
}

// the fists row of a strip, each frame with the one drawn with the sword it was baked from; the bake
// shows the second dash frame in place of the first, a full-body smear
function fistsFrames(heroId, strip) {
  const hero = HEROES.find(({ id }) => id === heroId);
  const image = readPngAlpha(new URL(`${hero.directory}hero_${strip}.png`, GAME));
  const drawn = readPngAlpha(new URL(`${hero.directory}../hero_${strip}.png`, GAME));
  const height = image.height / WEAPON_IDS.length;
  const top = WEAPONS.fists.spriteRow * height;
  return Array.from({ length: HERO_SPRITES.frames[strip] }, (_, index) => {
    const drawnIndex = strip === 'dash' && index === 0 ? 1 : index;
    return {
      image,
      left: index * frameWidth,
      top,
      height,
      drawn,
      drawnLeft: drawnIndex * frameWidth,
    };
  });
}

function goldAt(frame, x, y) {
  const { image, left, top } = frame;
  return image.alpha(left + x, top + y) > 0 && FISTS_SMEAR.has(hexAt(image, left + x, top + y));
}

// what is drawn of the hero, a swing's arc aside
function solidMask(frame) {
  const mask = new Uint8Array(frameWidth * frame.height);
  for (let y = 0; y < frame.height; y++) {
    for (let x = 0; x < frameWidth; x++) {
      const drawn = frame.image.alpha(frame.left + x, frame.top + y) > 0;
      mask[y * frameWidth + x] = drawn && !goldAt(frame, x, y) ? 1 : 0;
    }
  }
  return { mask, height: frame.height };
}

function solid({ mask, height }, x, y) {
  const [px, py] = [Math.round(x), Math.round(y)];
  return px >= 0 && py >= 0 && px < frameWidth && py < height && mask[py * frameWidth + px] === 1;
}

function airBeside(shape, { x, y }, across) {
  for (let step = 1; step <= AIR_WITHIN; step++) {
    if (!solid(shape, x + across.x * step, y + across.y * step)) {
      return true;
    }
  }
  return false;
}

function longestRun(positions) {
  const sorted = positions.sort((first, second) => first - second);
  let longest = 0;
  let start = 0;
  for (let i = 1; i <= sorted.length; i++) {
    if (i === sorted.length || sorted[i] - sorted[i - 1] > 1.5) {
      longest = Math.max(longest, sorted[i - 1] - sorted[start]);
      start = i;
    }
  }
  return longest;
}

// the thin pixels along one direction, gathered by the line across it that each lies on
function thinRunAlong(shape, degrees) {
  const along = { x: Math.cos((degrees * Math.PI) / 180), y: Math.sin((degrees * Math.PI) / 180) };
  const across = { x: -along.y, y: along.x };
  const lines = new Map();
  for (let y = 0; y < shape.height; y++) {
    for (let x = 0; x < frameWidth; x++) {
      const back = { x: -across.x, y: -across.y };
      if (
        !solid(shape, x, y) ||
        !airBeside(shape, { x, y }, across) ||
        !airBeside(shape, { x, y }, back)
      ) {
        continue;
      }
      const line = Math.round(x * across.x + y * across.y);
      lines.set(line, [...(lines.get(line) ?? []), x * along.x + y * along.y]);
    }
  }
  return Math.max(0, ...[...lines.values()].map(longestRun));
}

function longestThinRun(frame) {
  const shape = solidMask(frame);
  let longest = 0;
  for (let degrees = 0; degrees < 180; degrees += ANGLE_STEP) {
    longest = Math.max(longest, thinRunAlong(shape, degrees));
  }
  return longest;
}

function goldOnTheCore(frame) {
  const { drawn, drawnLeft } = frame;
  let count = 0;
  for (let y = 0; y < frame.height; y++) {
    for (let x = 0; x < frameWidth; x++) {
      const core =
        drawn.alpha(drawnLeft + x, y) > 0 && Math.min(...drawn.rgb(drawnLeft + x, y)) >= WHITE_CORE;
      count += core && goldAt(frame, x, y) ? 1 : 0;
    }
  }
  return count;
}

describe.each(SHADES)('the %s Shade with bare fists', (heroId) => {
  it.each(STILL)('holds no blade in any %s frame', (strip) => {
    const blades = fistsFrames(heroId, strip)
      .map((frame, index) => ({ index, run: Math.round(longestThinRun(frame)) }))
      .filter(({ run }) => run > LONGEST_THIN_RUN);
    expect(blades).toEqual([]);
  });
});

describe('the Antler Spirit Shade with bare fists', () => {
  it.each(STILL)("leaves none of his blade's white core in gold in any %s frame", (strip) => {
    const ghosts = fistsFrames('antler', strip)
      .map((frame, index) => ({ index, pixels: goldOnTheCore(frame) }))
      .filter(({ pixels }) => pixels > GOLD_ON_THE_CORE);
    expect(ghosts).toEqual([]);
  });
});
