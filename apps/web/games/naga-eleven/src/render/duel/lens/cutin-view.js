import { CUTIN_SHOTS } from '../../../data/shots.js';
import { cutinLength } from '../beats.js';
import { ART, CUTIN_BAND } from '../layout.js';
import { STAGE_TICKS } from '../stages.js';
import { shotView } from './shot-view.js';
import { fullTicks } from './track.js';

const BAND_MIDDLE = CUTIN_BAND.top + CUTIN_BAND.height / 2;

// the side's portrait, a little ahead of it the way the move goes, and the boot of a striker drawn
// whole as he kicks
function cutinTargets(side) {
  const facing = side === 'attack' ? 1 : -1;
  const face = { x: ART.width / 2 - facing * 32, y: BAND_MIDDLE };

  return {
    band: { x: ART.width / 2, y: BAND_MIDDLE },
    face,
    ahead: { x: face.x + facing * 16, y: BAND_MIDDLE },
    boot: { x: 88, y: 72 },
  };
}

export function cutinView(show, { side, strikes }) {
  const ticks = fullTicks(show.stageTicks, { length: cutinLength(show), full: STAGE_TICKS.cutin });
  const shots = strikes ? CUTIN_SHOTS.strike : CUTIN_SHOTS.portrait;

  return shotView(show.cinema, shots, ticks, cutinTargets(side));
}
