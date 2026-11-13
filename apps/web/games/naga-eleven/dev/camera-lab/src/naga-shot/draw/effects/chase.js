import { flightPoint } from '../../tracks/flight.js';
import { drawAlert } from './alert.js';
import { drawBlownDust } from './dust.js';
import { drawPressureLines } from './pressure.js';
import { drawSpeedLines } from './speed.js';

function headingOf({ ending, flight }) {
  const from = flightPoint(ending, Math.max(0, (flight ?? 0) - 0.02));
  const to = flightPoint(ending, Math.min(1, (flight ?? 0) + 0.02));

  return Math.atan2(to.y - from.y, to.x - from.x);
}

function drawPressure(pen, { keeper, clock }) {
  drawPressureLines(pen, {
    centre: { x: keeper.x - 6, y: keeper.y - 30 },
    inner: 44 - clock.share * 14,
    tick: clock.frame,
    strength: 0.3 + clock.share * 0.5,
  });
}

export function drawChaseBehind(pen, moment) {
  const { clock, camera, ball, keeper } = moment;
  const heading = headingOf(moment);

  if (clock.stage === 'flight') {
    drawSpeedLines(pen, {
      camera,
      tick: clock.frame,
      heading: heading + Math.PI,
      count: 11,
      clear: ball,
    });

    return;
  }

  drawPressure(pen, { keeper, clock });
  drawSpeedLines(pen, { camera, tick: clock.frame, heading: 0, count: 5, clear: ball, salt: 3 });
  drawBlownDust(pen, { from: keeper.x - 150, reach: 120, tick: clock.frame, count: 7 });
}

export function drawChaseFront(pen, moment) {
  const { clock, camera, ball } = moment;

  if (clock.stage === 'flight') {
    const heading = headingOf(moment) + Math.PI;

    drawSpeedLines(pen, { camera, tick: clock.frame, heading, count: 4, clear: ball, salt: 7 });

    return;
  }

  drawAlert(pen, moment);
}
