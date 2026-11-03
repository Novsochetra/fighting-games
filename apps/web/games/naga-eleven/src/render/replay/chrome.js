import { CINE } from '../../art/cinematics/palette.js';
import { VIEW } from '../../config.js';
import { easeOut, shareOf } from '../cinematics/shared/ease.js';
import { BAR_HEIGHT, drawProgress, drawReplayTag, drawSlowMarker } from './chrome-parts.js';
import { isSlowMotion, ticksLeft } from './replay.js';
import { drawReplayWipe } from './wipe.js';

const WIPE_TICKS = 16;
const BARS_TICKS = 12;

function drawBars(context, height) {
  const foot = VIEW.height - height;

  if (height < 2) {
    return;
  }

  context.fillStyle = CINE.letterbox;
  context.fillRect(0, 0, VIEW.width, height);
  context.fillRect(0, foot, VIEW.width, height);
  context.fillStyle = CINE.replay[1];
  context.fillRect(0, height - 2, VIEW.width, 1);
  context.fillRect(0, foot + 1, VIEW.width, 1);
  context.fillStyle = CINE.replay[2];
  context.fillRect(0, height - 1, VIEW.width, 1);
  context.fillRect(0, foot, VIEW.width, 1);
}

// how far into the slow stretch it is, in ticks of the tape at its slow rate
const slowAge = (replay) => (replay.position - replay.slowFrom) / replay.slowRate;

// over a replay frame drawn by drawFrame: the letterbox, the REPLAY tag, the slow-motion marker,
// the progress, and the slash that opens and closes it
export function drawReplayChrome(context, replay, { tick = replay.age, lang = 'en' } = {}) {
  const height = Math.round(BAR_HEIGHT * easeOut(shareOf(replay.age, 0, BARS_TICKS)));
  const left = ticksLeft(replay);

  context.imageSmoothingEnabled = false;
  drawBars(context, height);

  if (height >= BAR_HEIGHT - 2) {
    drawReplayTag(context, { tick, lang });
    drawProgress(context, { replay, lang });
  }

  if (isSlowMotion(replay)) {
    drawSlowMarker(context, { lang, tick, slide: easeOut(slowAge(replay) / 10) });
  }

  if (replay.age < WIPE_TICKS) {
    drawReplayWipe(context, { share: replay.age / WIPE_TICKS, leaving: true });
  } else if (left < WIPE_TICKS && !replay.skipped) {
    drawReplayWipe(context, { share: 1 - left / WIPE_TICKS });
  }
}

export { drawReplayWipe };
