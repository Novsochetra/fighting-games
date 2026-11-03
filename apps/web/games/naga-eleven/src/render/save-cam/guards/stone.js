import { DUEL_INK } from '../../../art/duel/palette.js';
import { debris, dust } from '../../duel/looks/barrier.js';
import { disc, polygon } from '../../duel/shapes.js';
import { easeOut } from '../../duel/hash.js';
import { DEPTH, FRAME, project } from '../view.js';
import { pointsOf } from '../../duel/points.js';

const GROUND = Math.round(project({ x: 0, y: 0, z: DEPTH.keeper }).y);

// where a barrier rises: under the ball where it will meet him, within the frame
const standing = (contact) => Math.min(FRAME.right - 30, Math.max(FRAME.left + 30, contact.x));

// a sandstone wall seen from in front: courses of blocks lit along their tops, a band of carved
// rosettes, three towers on it
function wallFace(pen, { left, top, width, bottom, ramp }) {
  pen.rect([left - 1, top - 1, width + 2, bottom - top + 2], DUEL_INK);
  pen.rect([left, top, width, bottom - top], ramp[2]);

  for (let y = top + 2; y < bottom; y += 6) {
    const shift = ((y - top) / 6) % 2 ? 0 : 5;

    pen.rect([left, y, width, 1], ramp[3]);
    pen.rect([left, y + 5, width, 1], ramp[1]);

    for (let x = left + shift; x < left + width; x += 10) {
      pen.rect([x, y + 1, 1, 4], ramp[1]);
    }
  }

  for (let x = left + 5; x < left + width - 2; x += 8) {
    disc(pen, { x, y: top + 3, radius: 2, color: ramp[3] });
    pen.dot(x, top + 3, ramp[0]);
  }
}

function tower(pen, { x, base, size, ramp }) {
  for (let tier = 0; tier < 3; tier += 1) {
    const half = Math.round(size * (1 - tier * 0.25));
    const top = Math.round(base - (tier + 1) * size * 0.7);

    pen.rect([x - half - 1, top - 1, half * 2 + 2, Math.ceil(size * 0.7) + 2], DUEL_INK);
    pen.rect([x - half, top, half * 2, Math.ceil(size * 0.7)], ramp[2]);
    pen.rect([x - half, top, half, Math.ceil(size * 0.7)], ramp[3]);
  }

  polygon(
    pen,
    [
      [x - 2, base - size * 2.1],
      [x, base - size * 3],
      [x + 2, base - size * 2.1],
    ],
    ramp[4],
  );
}

// Angkor Wall: the temple's sandstone rises from the grass in front of the keeper; he stands big
// behind it and the ball comes back off it; beaten, it falls in pieces
export function angkorFront(pen, { art, flight, since, holds, contact }) {
  const ramp = art.body;
  const rise = since >= 0 ? 1 : easeOut((flight - 0.25) / 0.6);
  const width = 64;
  const left = Math.round(standing(contact) - width / 2);
  const bottom = GROUND + 2;
  const top = bottom - Math.round(30 * rise);

  if (!holds && since > 0) {
    debris(pen, {
      scene: { sinceHit: since },
      box: { x: left, y: top, width, height: bottom - top },
      colors: ramp,
    });

    return;
  }

  if (rise > 0.1) {
    [left + 8, left + width / 2, left + width - 8].forEach((x, i) =>
      tower(pen, { x, base: top, size: i === 1 ? 7 : 5, ramp }),
    );
    wallFace(pen, { left, top, width, bottom, ramp });
  }

  if (since >= 0) {
    dust(pen, { scene: { sinceHit: since }, x: left, width, color: ramp[3] });
  }
}

// the peak's faces as shares across (of its half width) and up (of its height): its shadow, the
// lit face to the left, a ridge and the snow on its crown
const PEAK_FACES = [
  { shade: 1, corners: '-1,0 -0.12,1 1,0' },
  { shade: 2, corners: '-1,0 -0.12,1 -0.24,0' },
  { shade: 3, corners: '-0.6,0.45 -0.12,1 -0.32,0.4' },
  { shade: 4, corners: '-0.28,0.82 -0.12,1 0.04,0.82' },
];

// Mountain Guard: a peak of rock heaves up behind the keeper and his fist punches the ball away
export function mountainBack(pen, { art, flight, since, holds, contact }) {
  const rise = since >= 0 ? 1 : easeOut((flight - 0.2) / 0.6);
  const foot = GROUND - 2;
  const height = Math.round(64 * rise);
  const middle = standing(contact);
  const at = ([across, up]) => [middle + across * 50, foot - up * height];

  if ((!holds && since > 0) || height < 4) {
    return;
  }

  polygon(pen, pointsOf('-1.04,0 -0.12,1.02 1.04,0').map(at), DUEL_INK);
  PEAK_FACES.forEach((face) => polygon(pen, pointsOf(face.corners).map(at), art.body[face.shade]));
}
