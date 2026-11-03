import { RECORD_DOT, SLOW } from '../../art/cinematics/icons.js';
import { CINE } from '../../art/cinematics/palette.js';
import { VIEW } from '../../config.js';
import { khmerRoom } from '../text.js';
import { LABELS } from '../cinematics/shared/labels.js';
import { drawBox, drawInset } from '../cinematics/shared/panel.js';
import { drawPixelMap } from '../cinematics/shared/pixel-map.js';
import { drawWords, widthOf, wordsOf } from '../cinematics/shared/words.js';

export const BAR_HEIGHT = 30;

const TAG = { x: 12, y: 6, height: 18 };
const PROGRESS = { x: 604, width: 150, height: 5 };

// the tag blinks off for a moment each beat, as a broadcast's REPLAY does; its dot faster
export function drawReplayTag(context, { tick, lang }) {
  if (tick % 50 >= 40) {
    return;
  }

  const words = wordsOf(LABELS.replay, lang);
  const width = widthOf(context, words, 16) + 26;
  const room = khmerRoom(words);

  drawBox(context, { x: TAG.x, y: TAG.y, width, height: TAG.height + room }, CINE.replay);

  if (tick % 24 < 16) {
    drawPixelMap(context, RECORD_DOT.rows, {
      x: TAG.x + 6,
      y: TAG.y + 7 + room / 2,
      colours: RECORD_DOT.colours,
    });
  }

  drawWords(context, words, {
    x: TAG.x + 17,
    y: TAG.y + 2 + room / 2,
    size: 16,
    color: CINE.white,
  });
}

export function drawSlowMarker(context, { lang, tick, slide }) {
  const x = 14 - Math.round((1 - slide) * 12);
  const y = VIEW.height - BAR_HEIGHT + 10;
  const lit = tick % 32 < 20;

  drawPixelMap(context, SLOW.rows, {
    x,
    y: y + 1,
    colours: lit ? SLOW.colours : { W: CINE.muted, G: CINE.panel[3] },
  });
  drawWords(context, wordsOf(LABELS.slowMotion, lang), {
    x: x + 16,
    y,
    color: lit ? CINE.gold[3] : CINE.gold[2],
  });
}

export function drawProgress(context, { replay, lang }) {
  const last = Math.max(1, replay.frames.length - 1);
  const y = VIEW.height - BAR_HEIGHT + 12;
  const at = (index) => PROGRESS.x + Math.round((Math.max(0, index) / last) * PROGRESS.width);
  const hint = wordsOf(LABELS.skip, lang);

  drawWords(context, hint, {
    x: PROGRESS.x - 10,
    y: y - 2,
    color: CINE.muted,
    align: 'right',
    outline: null,
  });
  drawInset(context, { x: PROGRESS.x - 1, y: y - 1, width: PROGRESS.width + 2, height: 7 });
  context.fillStyle = CINE.replay[0];
  context.fillRect(
    at(replay.slowFrom),
    y,
    at(replay.goalAt) - at(replay.slowFrom),
    PROGRESS.height,
  );
  context.fillStyle = CINE.gold[2];
  context.fillRect(PROGRESS.x, y, at(replay.position) - PROGRESS.x, PROGRESS.height);
  context.fillStyle = CINE.gold[3];
  context.fillRect(PROGRESS.x, y, at(replay.position) - PROGRESS.x, 1);
  context.fillStyle = CINE.white;
  context.fillRect(at(replay.goalAt) - 1, y - 2, 2, PROGRESS.height + 4);
}
