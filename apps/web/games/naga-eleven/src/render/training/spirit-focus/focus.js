import { FOCUS } from '../../../art/training/temple.js';
import { faded, paint, ring } from '../pixels.js';

// the golden mark round his heart, and the rings closing on it, one for each beat to come
export const MARK_RADIUS = 24;
const SPREAD = 66;
const FLASH_TICKS = 18;
const CLOSE = 10;

function drawMark(context, { x, y }) {
  ring(context, FOCUS.markShade, { x: x + 1, y: y + 1, radius: MARK_RADIUS, width: 2 });
  ring(context, FOCUS.mark, { x, y, radius: MARK_RADIUS, width: 2 });

  for (const [dx, dy] of [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
  ]) {
    const petalX = x + dx * MARK_RADIUS;
    const petalY = y + dy * MARK_RADIUS;

    paint(context, FOCUS.lotusShade, [petalX - 2, petalY - 2, 5, 5]);
    paint(context, FOCUS.lotus, [petalX - 1, petalY - 2, 3, 4]);
  }
}

function drawClosing(context, centre, { beat, clock, approach }) {
  const ahead = beat.at - clock;
  const radius = MARK_RADIUS + (ahead / approach) * SPREAD;
  const close = ahead <= CLOSE;

  faded(context, 0.35 + 0.65 * (1 - ahead / approach), () =>
    ring(context, close ? FOCUS.ring : FOCUS.ringFar, { ...centre, radius, width: close ? 3 : 2 }),
  );
}

function drawFlash(context, centre, { beat, clock }) {
  const since = clock - beat.judgedAt;
  const share = since / FLASH_TICKS;

  if (beat.rating === 'miss') {
    faded(context, 1 - share, () =>
      ring(context, FOCUS.miss, { ...centre, radius: MARK_RADIUS - 2 - since / 3, width: 1 }),
    );

    return;
  }

  const reach = beat.rating === 'perfect' ? 26 : 14;

  faded(context, 1 - share, () =>
    ring(context, FOCUS.ring, { ...centre, radius: MARK_RADIUS + share * reach, width: 2 }),
  );
}

export function drawFocus(context, run, centre) {
  drawMark(context, centre);

  for (const beat of run.beats) {
    const ahead = beat.at - run.clock;

    if (beat.rating === null && ahead >= -CLOSE && ahead <= run.approach) {
      drawClosing(context, centre, { beat, clock: run.clock, approach: run.approach });
    } else if (beat.judgedAt !== null && run.clock - beat.judgedAt < FLASH_TICKS) {
      drawFlash(context, centre, { beat, clock: run.clock });
    }
  }
}
