import { ditherAt } from './layers.js';
import { HALO_BY_DUSK } from './palette.js';

// rings of ordered dots thinning outward: pixel art has no soft glow
const RINGS = [
  { out: 1.5, share: 0.75, colour: 0 },
  { out: 3.5, share: 0.5, colour: 0 },
  { out: 7, share: 0.22, colour: 1 },
];

const awayFrom = (value, from, to) => Math.max(from - value, 0, value - to);

function ringAt({ x, y }, box, size) {
  const across = awayFrom(x, box.left, box.left + box.width - 1);
  const down = awayFrom(y, box.top, box.top + box.height - 1);
  const reach = Math.sqrt(across * across + down * down) / size;

  return RINGS.find((ring) => reach <= ring.out);
}

export function paintHalo(pen, { box, dusk, size = 1 }) {
  const colours = HALO_BY_DUSK[dusk];
  const margin = Math.ceil(RINGS.at(-1).out * size);

  if (!colours.length) {
    return;
  }

  for (let y = box.top - margin; y < box.top + box.height + margin; y += 1) {
    for (let x = box.left - margin; x < box.left + box.width + margin; x += 1) {
      const ring = ringAt({ x, y }, box, size);

      if (ring && ditherAt(x, y) < ring.share) {
        pen.dot(x, y, colours[ring.colour]);
      }
    }
  }
}

export const haloMargin = (size = 1) => Math.ceil(RINGS.at(-1).out * size);
