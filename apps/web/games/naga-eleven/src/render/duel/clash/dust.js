import { CLASH_DUST } from '../../../art/duel/clash.js';
import { hash } from '../hash.js';
import { GROUND } from '../paths.js';
import { disc } from '../shapes.js';

const LIFE = 30;
const PER_END = 4;
const GRAINS = 10;

const swellOf = (since) => Math.min(1, since / 5) * Math.min(1, (LIFE - since) / 14);

function puff(pen, { end, rank, x, since }) {
  const reach = 20 + rank * 4;
  const speed = 0.3 + rank * 0.22 + hash(rank, end, 141) * 0.2;
  const radius = (4.4 - rank * 0.5 + hash(rank, end, 142) * 1.4) * swellOf(since);
  const at = {
    x: x + end * (reach + speed * since * (1 - since / (2 * LIFE))),
    y: GROUND - 2 - rank * 1.2 - since * (0.06 + rank * 0.03),
  };

  if (radius < 1) {
    return;
  }

  disc(pen, { x: at.x, y: at.y + 1, radius, color: CLASH_DUST[0] });
  disc(pen, { x: at.x, y: at.y, radius: radius * 0.85, color: CLASH_DUST[1] });
  disc(pen, { x: at.x - end * 0.6, y: at.y - 0.8, radius: radius * 0.5, color: CLASH_DUST[2] });
}

function grains(pen, { x, since }) {
  for (let i = 0; i < GRAINS; i += 1) {
    const vx = (hash(i, 143) - 0.5) * 2.4;
    const vy = -0.8 - hash(i, 144) * 1.2;
    const y = GROUND - 3 + vy * since + 0.09 * since * since;

    if (y < GROUND) {
      pen.rect(
        [Math.round(x + (hash(i, 145) - 0.5) * 50 + vx * since), Math.round(y), 1, 1],
        CLASH_DUST[3],
      );
    }
  }
}

// drawn behind him, so it seems to roll out from under him
export function drawLandingDust(pen, { x, since }) {
  if (since < 0 || since > LIFE) {
    return;
  }

  for (const end of [-1, 1]) {
    for (let rank = 0; rank < PER_END; rank += 1) {
      puff(pen, { end, rank, x, since });
    }
  }

  grains(pen, { x, since });
}
