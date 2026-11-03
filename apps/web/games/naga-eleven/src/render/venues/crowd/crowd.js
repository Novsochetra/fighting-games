import { hash2, noise2 } from '../kit/hash.js';
import { drawFan, fanHeight } from './fan.js';

// a fan's look and how they move are fixed by their seat, so every drawing of the crowd is the
// same crowd, only bobbing, standing or waving
// fans who came together sit together, so shirts run in patches of a colour with a few odd ones
function shirtOf(palette, seat) {
  const own = hash2(seat.column, seat.row, 1);
  const patch = noise2(seat.column, seat.row * 6, { cell: 28, salt: 17 });
  const share = own < 0.3 ? own / 0.3 : Math.min(0.999, Math.max(0, (patch - 0.2) * 1.6));

  return palette.shirts[Math.floor(share * palette.shirts.length)];
}

function lookOf(palette, seat) {
  const pick = (list, salt) => list[Math.floor(hash2(seat.column, seat.row, salt) * list.length)];
  const capped = hash2(seat.column, seat.row, 7) < (palette.caps ? 0.18 : 0);
  const hair = capped ? pick(palette.caps, 8) : pick(palette.hairs, 3);

  const skin = Math.floor(hash2(seat.column, seat.row, 2) * palette.skins.length);

  return {
    shirt: shirtOf(palette, seat),
    skin: palette.skins[skin],
    skinLight: palette.skins[Math.min(palette.skins.length - 1, skin + 1)],
    hair,
    hairLight: capped ? hair : palette.hairLight,
  };
}

function poseOf(seat, frame) {
  const restless = hash2(seat.column, seat.row, 5);

  if (frame >= 2) {
    const up = (frame === 2) === restless < 0.5;

    return { lift: up ? 3 : 1, arms: restless < 0.8 ? 'up' : 'wave' };
  }

  const bob = (frame === 1) === restless < 0.5 ? 1 : 0;
  const waving = restless > 0.94 && frame === 1;

  return { lift: bob, arms: waving ? 'wave' : null };
}

// the crowd fills `area` row by row from the back, so the heads of each row hide the shirts of the
// row behind; `filled(column, row)` says whether a seat has someone in it
export function paintCrowd(raster, { area, size, rowPitch, palette, frame, filled }) {
  const pitch = size + 1;
  const rows = Math.floor((area.height - fanHeight(size)) / rowPitch) + 1;

  for (let row = rows - 1; row >= 0; row -= 1) {
    const y = area.y + area.height - fanHeight(size) - row * rowPitch;
    const stagger = row % 2 === 0 ? 0 : Math.floor(pitch / 2);

    for (let x = area.x + stagger; x + size <= area.x + area.width; x += pitch) {
      const seat = { column: x, row };

      if (filled(x, row)) {
        drawFan(raster, { x, y, size, ...poseOf(seat, frame) }, lookOf(palette, seat));
      }
    }
  }
}
