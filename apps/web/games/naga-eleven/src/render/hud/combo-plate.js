import { HUD } from '../../art/hud.js';
import { contrastRatio } from '../actors/number-colours.js';

// the counter stands on a plate of the HUD's own, as the score and the player card do, so it reads
// over a crowd in the side's own colours as well as over the grass
export const PLATE_PAD = { x: 4, y: 2 };

// the contrast a big digit's middle shade needs on the plate (the web's guidelines ask 3 of large
// type), with a little more for the pixels a phone shrinks
const READS_AT = 3.5;
const LIFT_STEP = 0.1;

const channelsOf = (hex) => [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16));

const hexOf = (channels) =>
  `#${channels.map((value) => Math.round(value).toString(16).padStart(2, '0')).join('')}`;

function lightened(hex, share) {
  const light = channelsOf(HUD.text);

  return hexOf(channelsOf(hex).map((value, i) => value + (light[i] - value) * share));
}

function liftedRamp(ramp, plate) {
  for (let share = 0; share < 1; share += LIFT_STEP) {
    const lifted = share === 0 ? ramp : ramp.map((hex) => lightened(hex, share));

    if (contrastRatio(lifted[2], plate) >= READS_AT) {
      return lifted;
    }
  }

  return ramp.map((hex) => lightened(hex, 1));
}

const kept = new WeakMap();

// a navy, black or deep purple shirt would sink into the plate: its ramp is lifted toward the HUD's
// text, its hue kept, just far enough that it reads
export function readableRamp(ramp) {
  if (!kept.has(ramp)) {
    kept.set(ramp, liftedRamp(ramp, HUD.panel[1]));
  }

  return kept.get(ramp);
}

// the other side's plate, its drop shadow too, stops short of the pause button a phone shows
export function plateRect(box, { width, height }) {
  const outer = { width: width + PLATE_PAD.x * 2, height: height + PLATE_PAD.y * 2 };
  const x = box.side === 'right' ? box.x + box.width - outer.width - 2 : box.x;

  return { x, y: box.y, ...outer };
}
