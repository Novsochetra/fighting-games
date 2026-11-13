import { hash } from '../../../../../../src/render/duel/hash.js';
import { band } from '../../../../../../src/render/duel/shapes.js';
import { ENERGY_HEX } from './pixels.js';

const { emerald, flash } = ENERGY_HEX;

// Streaks of wind torn off the body: each runs along its edge from a beat of the flight on,
// slips back down the body as it ages and peels away from it at its back end, as the air does off
// a thing going fast. Beats, never chance, so a frame comes out the same however it is reached.
const WIND = { every: 0.004, life: 0.035, count: 2, joints: 7 };

const COLORS = [flash, emerald[4], emerald[3]];

function streakAt(serpent, { slot, count }) {
  const age = (serpent.flight - slot * WIND.every) / WIND.life;
  const seed = (salt) => hash(slot, count, salt, 29);

  if (age < 0 || age >= 1) {
    return null;
  }

  return {
    age,
    from: 0.06 + 0.4 * seed(1) + age * 0.3,
    side: seed(2) < 0.5 ? -1 : 1,
    gap: 1 + 3 * seed(3) + age * 5,
    joints: Math.round(WIND.joints * (0.6 + 0.8 * seed(4))),
  };
}

function pointsOf(frames, streak) {
  const start = Math.round(streak.from * (frames.length - 1));

  return Array.from({ length: streak.joints }, (_, i) => {
    const at = frames[Math.max(0, frames.length - 1 - start - i)];
    const out = (at.radius + streak.gap + (i / streak.joints) ** 2 * 5) * streak.side;

    return { x: at.x + at.back.x * out, y: at.y + at.back.y * out };
  });
}

function drawStreak(sheet, frames, streak) {
  const color = COLORS[Math.min(COLORS.length - 1, Math.floor(streak.age * COLORS.length))];
  const points = pointsOf(frames, streak);

  points.slice(1).forEach((to, i) => {
    if (streak.age < 0.6 || i % 2 === 0) {
      band(sheet, { from: points[i], to, width: 1, color });
    }
  });
}

export function drawWind(sheet, { serpent, frames }) {
  const last = Math.floor(serpent.flight / WIND.every);
  const first = Math.max(0, Math.floor((serpent.flight - WIND.life) / WIND.every));

  for (let slot = first; slot <= last; slot += 1) {
    for (let count = 0; count < WIND.count; count += 1) {
      const streak = streakAt(serpent, { slot, count });

      if (streak) {
        drawStreak(sheet, frames, streak);
      }
    }
  }
}
