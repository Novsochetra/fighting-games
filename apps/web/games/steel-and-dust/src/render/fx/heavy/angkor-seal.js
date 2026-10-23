import { easeOutCubic } from '../../../lib/math.js';
import { SEAL, sealPetalAngle } from '../../../sim/fx/heavy/angkor-seal.js';
import { PIXEL, fillRows, ringRows } from '../fine-pixels.js';
import { fineDiamond } from './angkor-pixels.js';

// after the strike the seal bursts outward for a few ticks and is gone
const STRIKE_TICKS = 6;
const AIR_SCALE = 0.7;
const { flat: FLAT, petals: PETALS } = SEAL;
// petals light one by one as the power gathers, from the back of the seal round to the front
const PETAL_ORDER = [0, 1, 7, 2, 6, 3, 5, 4];

function windupSeal(art, { startup, time }) {
  const share = Math.min(1, (time + 1) / startup);
  let color = art.lotusDeep;
  if (time >= startup - 2) {
    color = art.hot;
  } else if (time * 2 >= startup) {
    color = art.lotus;
  }
  const lit = Math.ceil(share * PETALS);
  return {
    rx: 8 + (SEAL.rx - 8) * easeOutCubic(share),
    alpha: 0.75 + 0.25 * share,
    color,
    lit,
    turn: 0,
  };
}

// where the lotus seal under his feet stands this tick, or null once it has burst; in the air it
// opens smaller, a foothold of light
export function sealOf(art, { fighter, move, time }) {
  const seal = sealAt(art, { move, time });
  if (seal && fighter.airborne) {
    seal.rx *= AIR_SCALE;
  }
  return seal;
}

function sealAt(art, { move, time }) {
  const { startup } = move;
  if (time < startup) {
    return windupSeal(art, { startup, time });
  }
  const since = time - startup;
  if (since >= STRIKE_TICKS) {
    return null;
  }
  const color = since < 2 ? art.white : art.hot;
  return {
    rx: SEAL.rx + since * 5,
    alpha: 1 - since / STRIKE_TICKS,
    color,
    lit: PETALS,
    turn: since * 0.1,
  };
}

const inHalf = (dy, front) => (front ? dy >= 0 : dy < 0);

function ring(context, { x, y, rx, front, width }) {
  const rows = ringRows(rx, rx * FLAT, width).filter((row) => inHalf(row.dy, front));
  fillRows(context, { x, y, rows });
}

function petals(context, { x, y, rx, lit, turn, front }) {
  for (let order = 0; order < lit; order++) {
    const angle = sealPetalAngle(PETAL_ORDER[order]) + turn;
    const dy = Math.sin(angle) * rx * FLAT;
    if (inHalf(dy, front)) {
      fineDiamond(context, { x: x + Math.cos(angle) * rx, y: y + dy, radius: 2 });
    }
  }
}

function paint(context, { color, alpha }, draw) {
  context.globalAlpha = alpha;
  context.fillStyle = color;
  draw();
}

// half the seal, carved into the ground with a shadow under its rim: the back half lies under him
// and the front half over his feet, so it rings him
export function drawSealHalf(painter, { seal, art, x, y, front }) {
  const { context } = painter;
  const shape = { x, y, front, turn: seal.turn, lit: seal.lit, rx: seal.rx };
  const { alpha } = seal;
  paint(context, { color: art.stoneShade, alpha: alpha * 0.6 }, () =>
    ring(context, { ...shape, y: y + PIXEL * 2, width: 2 }),
  );
  paint(context, { color: seal.color, alpha }, () => ring(context, { ...shape, width: 2 }));
  paint(context, { color: art.gold, alpha: alpha * 0.8 }, () =>
    ring(context, { ...shape, rx: seal.rx * 0.55, width: 1 }),
  );
  paint(context, { color: art.lotusDim, alpha }, () => petals(context, { ...shape, y: y + PIXEL }));
  paint(context, { color: seal.color === art.lotusDeep ? art.lotus : art.hot, alpha }, () =>
    petals(context, shape),
  );
  context.globalAlpha = 1;
}
