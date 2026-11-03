import { burstShare } from '../../../training/spirit-focus/index.js';
import { ART, inArt } from '../pixels.js';
import { drawAura, drawBurst, drawDrift } from './aura.js';
import { drawFocus } from './focus.js';
import { chestOf, drawIncense, drawLotus, drawMeditator } from './meditator.js';
import { drawDawn } from './sky.js';
import { drawSteps, PLATFORM } from './steps.js';

const SEAT = { x: 192, seat: PLATFORM.seat };
const CHEST = chestOf(SEAT);

function drawSpirit(context, state) {
  const run = state.run;

  if (state.phase === 'finish') {
    drawBurst(context, { ...CHEST, share: burstShare(state), since: state.phaseTicks });

    return;
  }

  if (state.phase === 'result' || state.phase === 'done') {
    drawAura(context, { ...CHEST, spirit: 30 + burstShare(state) * 70, tick: state.tick });

    return;
  }

  drawAura(context, { ...CHEST, spirit: run.spirit, tick: state.tick });
}

export function drawSpiritScene(context, state) {
  const playing = state.phase === 'play' || state.phase === 'ready';

  inArt(context, () => {
    drawDawn(context, { tick: state.tick });
    drawSteps(context);
    drawSpirit(context, state);
    drawIncense(context, { x: 150, y: PLATFORM.seat, tick: state.tick });
    drawLotus(context, { x: 234, y: PLATFORM.seat });
    drawMeditator(context, { ...SEAT, tick: state.tick });

    if (playing) {
      drawFocus(context, state.run, CHEST);
    }

    drawDrift(context, { tick: state.tick });
  });
}

// every mark of the beat pops up over his head
export function spiritMarkPlace() {
  return { x: CHEST.x * ART, y: (CHEST.y - 48) * ART };
}
