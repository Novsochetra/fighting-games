import { minuteOf } from './halves.js';
import { clearPresses } from './input-state.js';
import { updateAim } from './keeper-aim.js';
import { updateDropSpot } from './loose-ball.js';
import { PHASES } from './phases.js';

export function tick(match) {
  match.tick += 1;
  match.phaseTicks += 1;
  PHASES[match.phase](match);
  match.minute = minuteOf(match);
  updateAim(match);
  updateDropSpot(match);
  clearPresses(match.input);
}
