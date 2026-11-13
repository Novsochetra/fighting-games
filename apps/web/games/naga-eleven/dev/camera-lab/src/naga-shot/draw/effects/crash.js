import { CONTACTS, GROUND } from '../../world.js';
import { movedSinceCrash, sinceCrash } from './beats.js';
import { drawCoreFlash, drawFlamePetals } from './blast.js';
import { drawAirRing, drawGroundRing, drawStarBurst } from './burst.js';
import { drawBarSparks, drawScatter } from './debris.js';
import { drawEmbers } from './motes.js';

// in front only for the first ticks, so the keeper, the ball and the goal show through after
const FRONT_TICKS = 3;

export function drawCrashBehind(pen, { clock, ending }) {
  const at = CONTACTS[ending];
  const since = sinceCrash(clock);

  if (since < 0) {
    return;
  }

  drawGroundRing(pen, { at, ground: GROUND, hit: since - 2, life: 26, reach: 120 });
  drawFlamePetals(pen, { at, since });
  drawAirRing(pen, { at, hit: since - 5, life: 20, reach: 92 });
  drawStarBurst(pen, { at, hit: since - 1, ahead: 0 });
  drawCoreFlash(pen, { at, since, from: FRONT_TICKS });
}

function drawSettling(pen, { clock, ending }) {
  const at = CONTACTS[ending];

  drawEmbers(pen, {
    area: { x: at.x, y: at.y + 14, width: 80, height: 40 },
    tick: clock.ticks,
    count: 30,
    life: 64,
    once: true,
  });
}

export function drawCrashFront(pen, moment) {
  const { clock, ending } = moment;
  const at = CONTACTS[ending];
  const since = sinceCrash(clock);
  const moved = movedSinceCrash(clock);

  if (clock.stage === 'aftermath') {
    drawSettling(pen, moment);
  }

  if (since < FRONT_TICKS) {
    drawCoreFlash(pen, { at, since });
  }

  drawAirRing(pen, { at, hit: since, life: 14, reach: 62 });
  drawScatter(pen, { at, moved });

  if (ending === 'post') {
    drawBarSparks(pen, { at, since, moved });
  }
}
