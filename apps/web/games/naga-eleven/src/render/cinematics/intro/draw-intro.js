import { easeIn, easeOut, shareOf } from '../shared/ease.js';
import { dimView } from '../shared/panel.js';
import { drawCupBand } from './cup-band.js';
import { drawKickOff } from './kick-off.js';
import { drawRivalCard } from './rival-card.js';
import { drawTeamBoard } from './team-board.js';

const DIM = 0.38;

// the live venue shows through; it is only dimmed a little while the graphics are up, so they read
function dimFor(state) {
  const enter = easeOut(shareOf(state.tick, 0, 12));
  const leave = easeIn(shareOf(state.tick, state.beats.out, 14));

  return DIM * enter * (1 - leave);
}

// drawn over the frame of the venue before kick off; `tick` moves what glints and shines
export function drawIntro(context, state, { tick = state.tick } = {}) {
  context.imageSmoothingEnabled = false;
  dimView(context, dimFor(state));
  drawCupBand(context, state);
  drawTeamBoard(context, state, tick);
  drawRivalCard(context, state, tick);
  drawKickOff(context, state);
}
