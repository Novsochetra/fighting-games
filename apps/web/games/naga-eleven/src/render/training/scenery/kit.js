import { COACH_MAP } from '../../../art/training/coach.js';
import { BAG, BOTTLE, FLAG, METAL, WOOD } from '../../../art/training/ground.js';
import { drawBall } from '../ball.js';
import { drawCoach, drawShadow } from '../people.js';
import { paint } from '../pixels.js';
import { drawCone } from './obstacles.js';

// the training ground's kit, at the boy's scale: the bench with the coach on it, balls, bottles,
// spare cones, flags
const BENCH = { half: 32, seat: COACH_MAP.seat, backs: [29, 22], coach: -10 };

function plank(context, { x, top, width }) {
  paint(context, WOOD[0], [x, top, width, 4]);
  paint(context, WOOD[2], [x, top, width, 3]);
  paint(context, WOOD[3], [x, top, width, 1]);
  paint(context, WOOD[1], [x, top + 2, width, 1]);
}

function drawFrame(context, { x, y }) {
  for (const end of [x - BENCH.half + 2, x + BENCH.half - 4]) {
    paint(context, METAL[0], [end, y - BENCH.backs[0] - 1, 3, BENCH.backs[0] + 1]);
    paint(context, METAL[2], [end, y - BENCH.backs[0] - 1, 1, BENCH.backs[0] + 1]);
  }

  for (const back of BENCH.backs) {
    plank(context, { x: x - BENCH.half, top: y - back, width: BENCH.half * 2 });
  }
}

// the seat seen a little from above: its lit top and its front edge, the coach's legs before it
function drawSeat(context, { x, y }) {
  const left = x - BENCH.half;
  const top = y - BENCH.seat - 1;

  paint(context, WOOD[4], [left, top, BENCH.half * 2, 1]);
  paint(context, WOOD[3], [left, top + 1, BENCH.half * 2, 1]);
  paint(context, WOOD[2], [left, top + 2, BENCH.half * 2, 2]);
  paint(context, WOOD[0], [left, top + 4, BENCH.half * 2, 1]);
}

export function drawBench(context, { x, y, tick = 0 }) {
  drawShadow(context, { x: x + 3, y: y + 1, width: BENCH.half + 4, alpha: 0.3 });
  drawFrame(context, { x, y });
  drawSeat(context, { x, y });
  drawCoach(context, { x: x + BENCH.coach, y, tick });
}

export function drawBag(context, { x, y }) {
  drawShadow(context, { x: x + 2, y, width: 11, alpha: 0.3 });
  drawBall(context, { x: x - 4, y: y - 5, radius: 4, travel: 0 });
  drawBall(context, { x: x + 5, y: y - 5, radius: 4, travel: 4 });
  drawBall(context, { x: x + 1, y: y - 12, radius: 4, travel: 8 });
  paint(context, BAG.net, [x - 9, y - 9, 1, 8]);
  paint(context, BAG.net, [x + 10, y - 9, 1, 8]);
  paint(context, BAG.net, [x - 1, y - 18, 4, 2]);
  paint(context, BAG.net, [x, y - 21, 2, 3]);
}

export function drawBottles(context, { x, y }) {
  drawShadow(context, { x: x + 8, y, width: 9, alpha: 0.3 });

  for (const dx of [0, 6, 12]) {
    paint(context, BOTTLE.shade, [x + dx, y - 10, 4, 10]);
    paint(context, BOTTLE.body, [x + dx, y - 10, 3, 10]);
    paint(context, BOTTLE.shade, [x + dx, y - 6, 4, 1]);
    paint(context, BOTTLE.cap, [x + dx, y - 13, 4, 3]);
  }
}

export function drawStack(context, { x, y }) {
  drawCone(context, { x, y });
  drawCone(context, { x, y: y - 3 });
  drawCone(context, { x: x + 12, y });
}

const FLAG_POLE = 46;

// a checkered flag on a pole marks each end of the finish line
export function drawFinishFlag(context, { x, y, tick }) {
  const wave = Math.floor(tick / 12) % 2;
  const top = y - FLAG_POLE;

  paint(context, METAL[0], [x, top, 2, FLAG_POLE]);
  paint(context, METAL[3], [x, top, 1, FLAG_POLE]);

  for (let i = 0; i < 5; i += 1) {
    for (let j = 0; j < 3; j += 1) {
      const color = (i + j) % 2 === 0 ? FLAG.black : FLAG.white;

      paint(context, color, [x + 2 + i * 3, top + j * 3 + (i % 2) * wave, 3, 3]);
    }
  }
}
