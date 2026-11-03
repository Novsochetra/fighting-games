import { CINE } from '../../../art/cinematics/palette.js';
import { VIEW } from '../../../config.js';
import { LABELS } from '../shared/labels.js';
import { drawBox, drawRampBar } from '../shared/panel.js';
import { drawWords, wordsOf } from '../shared/words.js';
import { motionOf } from './motion.js';
import { CARD_SIZE, drawPortraitCard } from './portrait-card.js';

// tall enough for a Khmer label, name and tag, whose marks reach above and below each line
const STRIP = { y: 292, height: 76, width: 500 };
const TRAVEL = STRIP.width + CARD_SIZE + 40;
const CARD_LAG = 5;

// the strip runs on past the edge it slid in from, so no end of it shows there
function stripRect(mirror, travel) {
  const x = mirror ? -12 - travel : VIEW.width - STRIP.width + travel;

  return { x, y: STRIP.y, width: STRIP.width + 12, height: STRIP.height };
}

function drawLines(context, { rival, lang, x, align }) {
  drawWords(context, wordsOf(LABELS.rivalToWatch, lang), {
    x,
    y: STRIP.y + 14,
    color: CINE.gold[2],
    align,
  });
  drawWords(context, wordsOf(rival.name, lang), {
    x,
    y: STRIP.y + 30,
    size: 24,
    align,
    drop: 1,
  });
  drawWords(context, wordsOf(rival.tag, lang), {
    x,
    y: STRIP.y + 58,
    color: CINE.muted,
    align,
  });
}

function drawNumber(context, { rival, kit, x, mirror }) {
  if (rival.number === null || rival.number === undefined) {
    return;
  }

  drawWords(context, String(rival.number), {
    x,
    y: STRIP.y + 29,
    size: 24,
    color: kit.band[3],
    align: mirror ? 'left' : 'right',
    drop: 1,
  });
}

export function drawRivalCard(context, state, tick) {
  const { rival, lang } = state;
  const strip = rival && motionOf(state, state.beats.rival);
  const card = rival && motionOf(state, state.beats.rival, CARD_LAG);

  if (!strip?.shown) {
    return;
  }

  const mirror = rival.side === 0;
  const kit = state.kits[rival.side];
  const rect = stripRect(mirror, Math.round((1 - strip.enter + strip.leave) * TRAVEL));
  const cardTravel = Math.round((1 - card.enter + card.leave) * TRAVEL * 1.2);
  const cardX = mirror ? 24 - cardTravel : VIEW.width - 24 - CARD_SIZE + cardTravel;
  const textX = mirror ? rect.x + rect.width - 22 : rect.x + 22;

  drawBox(context, rect);
  drawRampBar(context, { ...rect, height: 5 }, kit.band);
  drawLines(context, { rival, lang, x: textX, align: mirror ? 'right' : 'left' });
  drawNumber(context, { rival, kit, x: mirror ? cardX + CARD_SIZE + 14 : cardX - 14, mirror });
  drawPortraitCard(context, {
    x: cardX,
    y: STRIP.y + STRIP.height - CARD_SIZE + 10,
    rival,
    kit,
    tick,
    flip: mirror,
  });
}
