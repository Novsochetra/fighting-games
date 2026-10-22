import { COLORS } from '../../art/colors.js';
import { FX_COLORS } from '../../art/fx-colors.js';
import { DEVIL_FADE, DEVIL_GROW } from '../../sim/hazards/dust-devils.js';
import { drawFxFrame, fxFrameAt } from './fx-sheets.js';

const DEVIL_SPIN_TICKS = 5;
const GREAT_SCALE = 1.5;

export function drawThunderBolt(painter, bolt, sheets) {
  const frame = Math.floor(bolt.time / 3) % 4;
  drawFxFrame(painter, sheets, {
    name: 'zap',
    frame,
    x: bolt.x,
    y: bolt.y,
    facing: bolt.direction,
  });
}

// frames 0-2 raise the funnel, 3-5 spin it while it lives, 6-7 blow it away
function devilFrame(devil) {
  if (devil.time < DEVIL_GROW) {
    return Math.floor(devil.time / (DEVIL_GROW / 3));
  }
  if (devil.time < devil.endAt) {
    return 3 + (Math.floor((devil.time - DEVIL_GROW) / DEVIL_SPIN_TICKS) % 3);
  }
  return Math.min(7, 6 + Math.floor((devil.time - devil.endAt) / (DEVIL_FADE / 2)));
}

export function drawDustDevil(painter, devil, sheets) {
  drawFxFrame(painter, sheets, {
    name: 'tornado',
    frame: devilFrame(devil),
    x: devil.x,
    y: devil.y,
  });
}

// the spot is marked like every boss danger, a red bar on the ground that blinks faster as the
// lightning gathers
export function drawStrikeMark(painter, strike) {
  if (strike.time >= strike.warn) {
    return;
  }
  const fast = strike.warn - strike.time < 16;
  const lit = (strike.time >> (fast ? 1 : 2)) & 1;
  const x = strike.x - strike.half;
  painter
    .alpha(lit ? 0.95 : 0.6)
    .use(COLORS.red)
    .rect(x, strike.y - 1, strike.half * 2, 6);
  painter.use(FX_COLORS.dangerLight).rect(x, strike.y - 1, strike.half * 2, 1);
  painter.alpha(1);
}

export function drawStormStrike(painter, strike, sheets) {
  if (strike.time < strike.warn) {
    return;
  }
  drawFxFrame(painter, sheets, {
    name: 'thunder',
    frame: fxFrameAt('thunder', strike.time - strike.warn),
    x: strike.x,
    y: strike.y,
    scale: strike.great ? GREAT_SCALE : 1,
  });
}
