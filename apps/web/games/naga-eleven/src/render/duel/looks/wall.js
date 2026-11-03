import { DUEL_INK } from '../../../art/duel/palette.js';
import { GROUND } from '../paths.js';
import { disc } from '../shapes.js';
import { debris, dust, holds, riseOf } from './barrier.js';

const WIDTH = 36;
const HEIGHT = 50;

// a tower of Angkor: tiers narrowing up to a lotus bud
function tower(pen, { x, base, size, ramp }) {
  for (let tier = 0; tier < 4; tier += 1) {
    const half = size * (1 - tier * 0.2);
    const top = base - (tier + 1) * size * 0.75;
    const height = Math.ceil(size * 0.75);

    pen.rect([x - half - 1, top - 1, half * 2 + 2, height + 2], DUEL_INK);
    pen.rect([x - half, top, half * 2, height], ramp[2]);
    pen.rect([x - half, top, half, height], ramp[3]);
    pen.rect([x - half, top + height - 1, half * 2, 1], ramp[1]);
  }

  const bud = base - size * 3.4;

  disc(pen, { x, y: bud, radius: size * 0.45 + 1, color: DUEL_INK });
  disc(pen, { x, y: bud, radius: size * 0.45, color: ramp[3] });
  pen.rect([x - 1, bud - size * 0.9, 2, size * 0.6], ramp[4]);
}

// courses of sandstone, each block lit along its top, and a carved band of rosettes
function courses(pen, { left, top, height, ramp }) {
  pen.rect([left - 1, top - 1, WIDTH + 2, height + 1], DUEL_INK);
  pen.rect([left, top, WIDTH, height], ramp[2]);
  pen.rect([left, top, 3, height], ramp[3]);

  for (let y = top + 3; y < top + height; y += 7) {
    const shift = ((y - top) / 7) % 2 ? 0 : 6;

    pen.rect([left, y, WIDTH, 1], ramp[1]);
    pen.rect([left, y + 1, WIDTH, 1], ramp[3]);

    for (let x = left + shift; x < left + WIDTH; x += 12) {
      pen.rect([x, y + 1, 1, 6], ramp[1]);
    }
  }

  const band = top + Math.round(height * 0.38);

  pen.rect([left, band, WIDTH, 6], ramp[1]);

  for (let x = left + 4; x < left + WIDTH - 2; x += 7) {
    disc(pen, { x, y: band + 3, radius: 2, color: ramp[3] });
    pen.dot(x, band + 3, ramp[0]);
  }
}

// Angkor Wall: sandstone rises from the grass before the keeper, crowned with its towers
function guard(pen, scene) {
  const ramp = scene.guardArt.body;
  const left = scene.impact.x - 10;
  const height = Math.round(HEIGHT * riseOf(scene));
  const top = GROUND - height;

  if (!holds(scene)) {
    debris(pen, { scene, box: { x: left, y: top, width: WIDTH, height }, colors: ramp.slice(1) });

    return;
  }

  if (height > 6) {
    tower(pen, { x: left + 7, base: top, size: 6, ramp });
    tower(pen, { x: left + WIDTH - 7, base: top, size: 6, ramp });
    tower(pen, { x: left + WIDTH / 2, base: top, size: 9, ramp });
    courses(pen, { left, top, height, ramp });
  }

  dust(pen, { scene, x: left, width: WIDTH, color: ramp[3] });
}

export const WALL = { guard };
