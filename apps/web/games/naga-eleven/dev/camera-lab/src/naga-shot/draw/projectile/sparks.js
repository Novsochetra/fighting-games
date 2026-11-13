import { hash } from '../../../../../../src/render/duel/hash.js';
import { pathAt, SERPENT } from '../../tracks/serpent.js';
import { ENERGY_HEX } from './pixels.js';

const { emerald, flash } = ENERGY_HEX;

// Sparks are born off the body at fixed beats of the flight, never by chance, so a frame comes out
// the same however it is reached; each stays where it was shed while the Naga swims on, so they
// fall behind it, and as the flight slows at the keeper they hang in the air. `along` is where on
// the body a beat sheds them: the shed ones mostly off the tail, the tail's own off its tip.
const SHEDDING = [
  { every: 0.0035, life: 0.07, count: 3, along: (seed) => 0.2 + 0.8 * Math.sqrt(seed), drift: 10 },
  { every: 0.0016, life: 0.05, count: 2, along: () => 1, drift: 5 },
];

function sparkAt(serpent, { shed, slot, count }) {
  const born = slot * shed.every;
  const seed = (salt) => hash(slot, count, salt, shed.every * 1e4);
  const along = shed.along(seed(1));
  const share = born - along * SERPENT.length;
  const age = (serpent.flight - born) / shed.life;

  if (share < 0 || age < 0 || age >= 1 || seed(2) < 0.15) {
    return null;
  }

  const path = pathAt(serpent.ending, share);
  const side = seed(3) < 0.5 ? -1 : 1;
  const out = side * (SERPENT.neck * SERPENT.size * (1 - along) * 0.8 + 6 * seed(4));
  const away = out + side * age * shed.drift * (0.5 + seed(5));

  return {
    x: path.x + path.normal.x * away + path.ahead.x * age * 6,
    y: path.y + path.normal.y * away + path.ahead.y * age * 6 - age * 8 * seed(6),
    age,
  };
}

function drawSpark(sheet, { x, y, age }, twinkle) {
  if (age < 0.25) {
    sheet.rect([x - 1, y, 3, 1], emerald[4]);
    sheet.rect([x, y - 1, 1, 3], emerald[4]);
    sheet.dot(x, y, flash);

    return;
  }

  if (age < 0.55) {
    sheet.dot(x, y, twinkle ? flash : emerald[4]);
  } else if (twinkle || age < 0.8) {
    sheet.dot(x, y, age < 0.8 ? emerald[3] : emerald[2]);
  }
}

export function drawSparks(sheet, { serpent, frame }) {
  SHEDDING.forEach((shed) => {
    const last = Math.floor(serpent.flight / shed.every);
    const first = Math.max(0, Math.floor((serpent.flight - shed.life) / shed.every));

    for (let slot = first; slot <= last; slot += 1) {
      for (let count = 0; count < shed.count; count += 1) {
        const spark = sparkAt(serpent, { shed, slot, count });

        if (spark) {
          drawSpark(sheet, spark, hash(slot, count, Math.floor(frame / 2)) < 0.4);
        }
      }
    }
  });
}
