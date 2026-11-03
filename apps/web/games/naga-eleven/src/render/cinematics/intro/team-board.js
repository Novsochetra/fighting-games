import { VIEW } from '../../../config.js';
import { motionOf } from './motion.js';
import { PLATE, drawTeamPlate } from './team-plate.js';
import { drawVersus } from './versus.js';

const TOP = 148;
const GAP = 64;
const LEFT = VIEW.width / 2 - GAP / 2 - PLATE.width;
const RIGHT = VIEW.width / 2 + GAP / 2;
const TRAVEL = LEFT + PLATE.width + 40;

export function drawTeamBoard(context, state, tick) {
  const { enter, leave, shown } = motionOf(state, state.beats.teams);

  if (!shown) {
    return;
  }

  const away = Math.round((1 - enter) * TRAVEL + leave * TRAVEL);
  const { teams, kits, lang } = state;

  drawTeamPlate(context, { x: LEFT - away, y: TOP, team: teams[0], kit: kits[0], side: 0, lang });
  drawTeamPlate(context, { x: RIGHT + away, y: TOP, team: teams[1], kit: kits[1], side: 1, lang });
  drawVersus(context, {
    state,
    x: VIEW.width / 2,
    y: TOP + PLATE.height / 2,
    leave,
    tick,
  });
}
