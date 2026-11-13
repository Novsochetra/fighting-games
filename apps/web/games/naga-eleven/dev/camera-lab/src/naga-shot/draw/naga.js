import { GROUND } from '../world.js';
import { drawLurkingEyes } from './naga/lurk.js';
import { drawPour } from './naga/pour.js';
import { drawRisen } from './naga/risen.js';
import { warmUp } from './naga/warm.js';

// it rises from a little behind his feet, so the grass he stands on stays in front of it
const FLOOR = GROUND - 3;

export function drawSummonedNaga(pen, { naga }) {
  if (!naga.shown || naga.eyesOnly) {
    warmUp();
  }

  if (!naga.shown) {
    return;
  }

  if (naga.eyesOnly) {
    drawLurkingEyes(pen, naga);
  } else if (naga.compress > 0) {
    drawPour(pen, naga);
  } else {
    drawRisen(pen, naga, { floor: FLOOR });
  }
}
