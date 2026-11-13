import { hash } from '../../../../../../src/render/duel/hash.js';
import { FRAY_FROM } from './body.js';
import { ENERGY } from './pixels.js';

const { emerald, gold, flash } = ENERGY;

const LIFTED = new Map([
  [emerald[1], emerald[2]],
  [emerald[2], emerald[3]],
  [emerald[3], emerald[4]],
  [emerald[4], flash],
  [gold[1], gold[2]],
  [gold[2], gold[3]],
  [gold[3], flash],
]);

const fraction = (value) => value - Math.floor(value);

function plate({ down, across }) {
  if (across < -0.86 || fraction(down / 4) < 0.25) {
    return gold[1];
  }

  return across > -0.66 ? gold[3] : gold[2];
}

// Two rows of scales, each a chevron of light pointing down the body, the upper row in the light
// off the back; few and bold, so they read at speed and swim with the body.
function scale({ down, across, along }) {
  const upper = across > 0.15;
  const across01 = upper ? (across - 0.15) / 0.58 : (across + 0.56) / 0.71;
  const width = 4 + Math.round(3 * (1 - along));
  const around = fraction((down + (upper ? width / 2 : 0)) / width);
  const chevron = 0.75 - 0.4 * Math.abs(2 * across01 - 1);

  if (Math.abs(around - chevron) < 0.6 / width) {
    return upper ? emerald[4] : emerald[3];
  }

  return upper ? emerald[3] : emerald[2];
}

function wisp({ across, x, y }, frame) {
  if (Math.abs(across) < 0.4) {
    return hash(x, y, Math.floor(frame / 2)) < 0.3 ? flash : emerald[4];
  }

  return emerald[3];
}

function base(place, frame) {
  if (place.along > FRAY_FROM) {
    return wisp(place, frame);
  }

  if (place.across > 0.73) {
    return hash(place.x, place.y, Math.floor(frame / 2), 3) < 0.18 ? flash : emerald[4];
  }

  return place.across < -0.56 ? plate(place) : scale(place);
}

const pulseAt = (frame) => fraction(frame / 40) * 1.3 - 0.15;

export function skinOf(frame) {
  const pulse = pulseAt(frame);

  return (place) => {
    const color = base(place, frame);

    return Math.abs(place.along - pulse) < 0.05 ? (LIFTED.get(color) ?? color) : color;
  };
}
