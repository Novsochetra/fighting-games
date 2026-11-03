import { DUEL_SIDES, DUEL_UI } from '../../art/duel/palette.js';
import { hash } from './hash.js';
import { ART, INNER } from './layout.js';
import { polygon } from './shapes.js';

// the seam between the two halves leans like a blade: x where it crosses a row
const SEAM = { top: 142, bottom: 114 };

export const seamAt = (y) =>
  SEAM.top + ((SEAM.bottom - SEAM.top) * (y - INNER.top)) / (INNER.bottom - INNER.top);

function half(pen, side, tick) {
  const ramp = DUEL_SIDES[side];
  const left = side === 'attack';
  const top = seamAt(INNER.top);
  const bottom = seamAt(INNER.bottom);
  const outer = left ? 0 : ART.width;

  polygon(
    pen,
    [
      [outer, INNER.top],
      [top, INNER.top],
      [bottom, INNER.bottom],
      [outer, INNER.bottom],
    ],
    ramp[1],
  );
  streaks(pen, { ramp, left, tick });
}

// streaks run toward the seam on each side, the two halves rushing at each other
function streaks(pen, { ramp, left, tick }) {
  for (let i = 0; i < 26; i += 1) {
    const y = INNER.top + 2 + Math.floor(hash(i, 3) * (INNER.bottom - INNER.top - 4));
    const length = 8 + Math.floor(hash(i, 5) * 34);
    const speed = 3 + hash(i, 7) * 4;
    const travel = (tick * speed + hash(i, 9) * 300) % 300;
    const seam = seamAt(y);
    const from = left ? travel - 60 : ART.width - travel + 60 - length;
    const start = left ? Math.max(0, from) : Math.max(seam + 2, from);
    const end = left ? Math.min(seam - 2, from + length) : Math.min(ART.width, from + length);
    const color = hash(i, 11) < 0.3 ? ramp[3] : ramp[2];

    pen.rect([start, y, end - start, 1], color);
  }
}

// the seam itself, white hot, flickering along its length
function drawSeam(pen, tick) {
  for (let y = INNER.top; y < INNER.bottom; y += 1) {
    const x = Math.round(seamAt(y));
    const flare = hash(y >> 2, tick >> 1) < 0.25 ? 1 : 0;

    pen.rect([x - 2 - flare, y, 1 + flare, 1], DUEL_SIDES.attack[4]);
    pen.rect([x - 1, y, 2, 1], DUEL_UI.white);
    pen.rect([x + 1, y, 1 + flare, 1], DUEL_SIDES.defend[4]);
  }
}

export function drawSplashGround(pen, tick) {
  pen.rect([0, INNER.top, ART.width, INNER.bottom - INNER.top], DUEL_SIDES.attack[0]);
  half(pen, 'attack', tick);
  half(pen, 'defend', tick);
  drawSeam(pen, tick);
}
