import { hash } from '../../../../../../src/render/duel/hash.js';
import { CROWD_IN_DARK, CROWD_RAMPS, HAIRS, SEATS, SKINS, crowdTone } from './palette.js';
import { LAMP_EVERY, STAND, isAisle } from './stand-plan.js';

// home colours first: most of the stand is in Cambodia's red and blue
const HUE_WEIGHTS = [0, 0, 0, 0, 1, 1, 1, 2, 3, 4, 5, 5];

const EMPTY = 0.05;

// whole numbers, as hash() rounds what it mixes
const SEEDS = 2 ** 30;

// the roof's lamps light the stand in pools under them, so it reads as lit, not as a pattern
function poolLift(x) {
  const fromLamp = Math.abs(((x - STAND.left - 26 + LAMP_EVERY / 2) % LAMP_EVERY) - LAMP_EVERY / 2);

  return fromLamp < 9 ? 1 : 0;
}

const DARK_LOOKS = {
  upper: { hair: CROWD_IN_DARK.head, skin: CROWD_IN_DARK.body, ...CROWD_IN_DARK },
  lower: { hair: CROWD_IN_DARK.rim, skin: CROWD_IN_DARK.head, ...CROWD_IN_DARK },
};

function darkLook(light) {
  const look = light < 0 ? DARK_LOOKS.upper : DARK_LOOKS.lower;

  return { hair: look.hair, skin: look.skin, shoulders: look.body, shirt: look.body };
}

function lookOf(seed, { step, dusk }) {
  const ramp = CROWD_RAMPS[HUE_WEIGHTS[Math.floor(hash(seed, 1) * HUE_WEIGHTS.length)]];
  const cap = hash(seed, 2) < 0.1;

  if (dusk >= 3) {
    return darkLook(step + dusk);
  }

  return {
    shirt: crowdTone(ramp, step),
    shoulders: crowdTone(ramp, step + 1),
    hair: cap ? crowdTone(ramp, step + 1) : HAIRS[Math.floor(hash(seed, 3) * 4)],
    skin: SKINS[Math.max(0, Math.floor(hash(seed, 4) * 3) - dusk)],
  };
}

function paintArms(pen, { x, top, width, look }) {
  pen.rect([x - 1, top - 1, 1, 3], look.skin);
  pen.rect([x + width, top - 1, 1, 3], look.skin);
}

// two or three pixels across: too small for a face
function paintFan(pen, { x, y, seed, pose, light, width }) {
  const look = lookOf(seed, light);
  const up = pose && hash(seed, 5) < 0.7 ? 1 + Math.floor(hash(seed, 6) * 2) : 0;
  const top = y - up - (hash(seed, 8) < 0.2 ? 1 : 0);

  pen.rect([x, top, width, 1], look.hair);
  pen.rect([x, top + 1, width, 1], look.skin);
  pen.rect([x, top + 2, width, 1], look.shoulders);
  pen.rect([x, top + 3, width, 3 + up], look.shirt);

  if (up && hash(seed, 7) < 0.55) {
    paintArms(pen, { x, top, width, look });
  }
}

function paintRow(pen, { y, row, tier, pose, dusk }) {
  const seat = dusk >= 2 ? SEATS.shade : [SEATS.blue, SEATS.red][row % 2];
  let x = STAND.left + (row % 3);

  pen.rect([STAND.left, y + 2, STAND.right - STAND.left, tier.pitch], seat);

  for (let i = 0; x < STAND.right; i += 1) {
    const seed = Math.floor(hash(i, row, tier.salt, 90) * SEEDS);
    const width = hash(seed, 9) < 0.3 ? 3 : 2;
    const light = { step: tier.light - dusk + (dusk ? 0 : poolLift(x)), dusk };

    if (seed > EMPTY * SEEDS && !isAisle(x) && !isAisle(x + width - 1)) {
      paintFan(pen, { x, y, seed, pose, light, width });
    }

    x += width + (hash(i, row, tier.salt, 92) < 0.25 ? 1 : 0);
  }
}

// back rows first, so each row's heads hide the shirts of the row behind
export function paintTier(pen, { tier, pose, dusk }) {
  const rows = Math.floor((tier.bottom - tier.top - 3) / tier.pitch);

  for (let row = 0; row < rows; row += 1) {
    paintRow(pen, { y: tier.top + 1 + row * tier.pitch, row, tier, pose, dusk });
  }
}
