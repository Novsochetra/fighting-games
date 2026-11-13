import { flightPoint, launchPoint } from '../../tracks/flight.js';
import { GROUND } from '../../world.js';
import { movedSinceHit, pourOf, sinceHit } from './beats.js';
import { drawBuildBehind, drawBuildFront } from './build.js';
import { drawAirRing, drawGroundRing, drawStarBurst } from './burst.js';
import { drawPuff } from './dust.js';
import { drawConvergingStreaks } from './inpull.js';
import { drawClods, drawShards } from './shards.js';

function aheadOf(ending) {
  const from = launchPoint();
  const to = flightPoint(ending, 0.08);

  return Math.atan2(to.y - from.y, to.x - from.x);
}

const RING_DUST = 10;

// small puffs kicked up where the ring runs over the grass, already thinning as they rise
function drawRingDust(pen, { at, hit }) {
  for (let i = 0; i < RING_DUST; i += 1) {
    const angle = ((i + 0.5) / RING_DUST) * Math.PI * 2;
    const born = 2 + (i % 3) * 2;
    const reach = 10 + born * 5;
    const x = at.x + Math.cos(angle) * reach * 1.6;
    const y = GROUND + 1 + Math.sin(angle) * reach * 0.3;

    if (hit >= born) {
      drawPuff(pen, { x, y, age: hit - born + 14, life: 28, spread: 0.9, salt: 120 + i });
    }
  }
}

export function drawStrikeBehind(pen, moment) {
  const { clock } = moment;
  const hit = sinceHit(clock);
  const at = launchPoint();

  drawBuildBehind(pen, moment);

  if (hit < 0) {
    return;
  }

  drawGroundRing(pen, { at, ground: GROUND, hit });
  drawRingDust(pen, { at, hit });
}

export function drawStrikeFront(pen, moment) {
  const { clock, ball, ending } = moment;
  const hit = sinceHit(clock);
  const moved = movedSinceHit(clock);
  const at = launchPoint();
  const ahead = aheadOf(ending);

  drawBuildFront(pen, moment);

  if (hit < 0) {
    drawConvergingStreaks(pen, { ball, pour: pourOf(clock) });

    return;
  }

  drawClods(pen, { at: { x: at.x - 4, y: GROUND }, ground: GROUND, moved });
  drawAirRing(pen, { at, hit });
  drawShards(pen, { at, moved, ahead });
  drawStarBurst(pen, { at, hit, ahead });
}
