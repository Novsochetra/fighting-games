import { unpack } from '../../../../../../src/render/venues/kit/colour.js';
import { edgeOf } from './head.js';
import { ENERGY } from './pixels.js';

const lightnesses = new Map();

function lightnessOf(word) {
  if (!lightnesses.has(word)) {
    const [red, green, blue] = unpack(word);

    lightnesses.set(word, red * 0.3 + green * 0.59 + blue * 0.11);
  }

  return lightnesses.get(word);
}

const LIGHT = [ENERGY.emerald[2], ENERGY.emerald[3], ENERGY.emerald[4], ENERGY.flash];

const stepOf = (word) => [40, 110, 190].filter((bound) => lightnessOf(word) >= bound).length;

const GOLD_LIFTED = new Map(
  ENERGY.gold.map((word, i) => [word, ENERGY.gold[i + 1] ?? ENERGY.flash]),
);

// a step lighter, gold staying gold, so its ornaments still glint gold as it comes apart
export const lightened = (word) => GOLD_LIFTED.get(word) ?? LIGHT[stepOf(word)];

export const isGold = (word) => GOLD_LIFTED.has(word);

export const whiteHot = (word) => (lightnessOf(word) > 100 ? ENERGY.white : ENERGY.flash);

// the head as light alone, as it is when it pours into the ball (naga/pour.js), so it comes
// back out of the ball the way it went in
export const asLight = (head) => (word, x, y) =>
  edgeOf(head, x, y) ? ENERGY.white : lightened(word);
