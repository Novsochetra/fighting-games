import { CARD } from '../../../art/training/cards.js';
import { FLAG, METAL } from '../../../art/training/ground.js';
import { DRILLS } from '../../../data/training.js';
import { isLate, TARGETS } from '../../../training/target-shot/targets.js';
import { faded, noise, oval, paint, ring } from '../pixels.js';
import { toArt } from './view.js';

const TUNING = DRILLS['target-shot'].tuning;
const RADIUS = Math.round(TUNING.targetRadius / 2);
const BURST_TICKS = 26;

// twelve bulbs round a lit target count its light down
const BULBS = [
  [0, -10],
  [5, -9],
  [9, -5],
  [10, 0],
  [9, 5],
  [5, 9],
  [0, 10],
  [-5, 9],
  [-9, 5],
  [-10, 0],
  [-9, -5],
  [-5, -9],
];

function drawBoard(context, { x, y }) {
  oval(context, FLAG.redShade, { x: x + 1, y: y + 1, radiusX: RADIUS });
  oval(context, FLAG.red, { x, y, radiusX: RADIUS });
  ring(context, FLAG.white, { x, y, radius: RADIUS - 3, width: 2 });
  oval(context, FLAG.red, { x, y, radiusX: RADIUS - 6 });
  oval(context, FLAG.white, { x: x - 1, y: y - 1, radiusX: 1 });
  ring(context, FLAG.redShade, { x, y, radius: RADIUS + 1, width: 1 });
}

function drawMount(context, { x, y }, high) {
  if (high) {
    paint(context, METAL[2], [x - 6, 47, 1, y - RADIUS - 47]);
    paint(context, METAL[2], [x + 6, 47, 1, y - RADIUS - 47]);

    return;
  }

  paint(context, METAL[1], [x - 1, y + RADIUS, 3, 124 - y - RADIUS]);
  paint(context, METAL[1], [x - 6, 122, 13, 2]);
}

function drawLight(context, { x, y }, { target, tick }) {
  const late = isLate(target, TUNING);
  const flash = late && Math.floor(tick / 4) % 2 === 0;
  const glow = flash ? CARD.ribbon : CARD.gold;
  const lit = Math.ceil((target.left / target.total) * BULBS.length);

  faded(context, 0.35, () => oval(context, CARD.gold, { x, y, radiusX: RADIUS + 5 }));
  ring(context, glow, { x, y, radius: RADIUS + 3, width: 2 });

  BULBS.forEach(([dx, dy], i) => {
    const color = i < lit ? glow : CARD.shadow;

    paint(context, color, [x + Math.round(dx * 1.6) - 1, y + Math.round(dy * 1.6) - 1, 2, 2]);
  });
}

function drawBurst(context, { x, y }, since) {
  const share = since / BURST_TICKS;

  faded(context, 1 - share, () => {
    ring(context, CARD.gold, { x, y, radius: RADIUS + Math.round(share * 18), width: 2 });

    for (let i = 0; i < 14; i += 1) {
      const angle = (i / 14) * Math.PI * 2;
      const reach = 6 + share * (16 + noise(i) * 14);
      const color = i % 2 === 0 ? FLAG.red : FLAG.white;

      paint(context, color, [
        x + Math.cos(angle) * reach,
        y + Math.sin(angle) * reach + share * share * 10,
        2,
        2,
      ]);
    }
  });
}

function lastHitOf(state) {
  return state.marks.findLast((mark) => mark.kind === 'hit' || mark.kind === 'lateHit') ?? null;
}

export function drawTargets(context, state) {
  const { target } = state.run;
  const hit = lastHitOf(state);
  const bursting = hit !== null && state.tick - hit.at <= BURST_TICKS;

  TARGETS.forEach((spot, i) => {
    const place = toArt(spot);
    const lit = target.index === i && target.left > 0;

    drawMount(context, place, spot.y > 80);

    if (bursting && target.index === i) {
      drawBurst(context, place, state.tick - hit.at);

      return;
    }

    if (lit) {
      drawLight(context, place, { target, tick: state.tick });
    }

    drawBoard(context, place);

    if (!lit) {
      faded(context, 0.45, () => oval(context, CARD.shadow, { ...place, radiusX: RADIUS + 1 }));
    }
  });
}
