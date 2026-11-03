import { DRILLS } from '../../../data/training.js';
import { dummyActive } from '../../../training/target-shot/motion.js';
import { ART, inArt } from '../pixels.js';
import { drawBackdrop } from './backdrop.js';
import { drawAim, drawFlight } from './flight.js';
import { drawGoal, drawRail } from './goal.js';
import { drawKeeperDummy } from './keeper.js';
import { drawShooter } from './shooter.js';
import { drawTargets } from './targets.js';
import { toArt } from './view.js';

const TUNING = DRILLS['target-shot'].tuning;

export function drawShotScene(context, state, { actors }) {
  const run = state.run;
  const keeper = dummyActive(state, TUNING);

  inArt(context, () => {
    drawBackdrop(context, { tick: state.tick });
    drawGoal(context);
    drawTargets(context, state);

    if (keeper) {
      drawRail(context);
      drawKeeperDummy(context, run.dummy);
    }

    drawFlight(context, run);
    drawAim(context, run);
    drawShooter(context, state, actors);
  });
}

export function shotMarkPlace(_, mark) {
  const point = toArt(mark);

  return { x: point.x * ART, y: (point.y - 18) * ART };
}
