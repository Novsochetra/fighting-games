import { KBACH_CORNER } from '../../../art/cinematics/icons.js';
import { CINE } from '../../../art/cinematics/palette.js';
import { VIEW } from '../../../config.js';
import { easeOut, shareOf } from '../shared/ease.js';
import { drawPixelMap } from '../shared/pixel-map.js';
import { drawWords, widthOf, wordsOf } from '../shared/words.js';
import { motionOf } from './motion.js';

// the band sits over the score and the minimap, which have nothing to say before kick off
const BAND = { y: 6, height: 52 };
const MIDDLE = VIEW.width / 2;
const EDGES = [
  [0, CINE.gold[3]],
  [1, CINE.gold[2]],
  [2, CINE.gold[1]],
  [BAND.height - 3, CINE.gold[1]],
  [BAND.height - 2, CINE.gold[2]],
  [BAND.height - 1, CINE.ink],
];

function drawSlash(context, { y, reach }) {
  for (let row = 0; row < BAND.height; row += 1) {
    const at = reach - Math.round(row / 2);

    if (at < VIEW.width) {
      context.fillStyle = row % 3 === 0 ? CINE.gold[3] : CINE.gold[2];
      context.fillRect(at, y + row, Math.min(3, VIEW.width - at), 1);
    }
  }
}

// the band wipes in from the left, `reach` pixels across so far
function drawBody(context, { y, reach }) {
  const width = Math.min(VIEW.width, reach);

  context.fillStyle = CINE.panel[1];
  context.fillRect(0, y, width, BAND.height);
  context.fillStyle = CINE.panel[2];

  for (let x = Math.abs(y % 2); x < width; x += 2) {
    context.fillRect(x, y + 3, 1, 1);
  }

  for (const [row, colour] of EDGES) {
    context.fillStyle = colour;
    context.fillRect(0, y + row, width, 1);
  }

  drawSlash(context, { y, reach });
}

const CORNER_GAP = 13;
const CORNER_REACH = CORNER_GAP + KBACH_CORNER.rows[0].length;

function drawCorners(context, { x, y, halfWidth }) {
  const colours = KBACH_CORNER.colours;

  drawPixelMap(context, KBACH_CORNER.rows, { x: x - halfWidth - CORNER_REACH, y, colours });
  drawPixelMap(context, KBACH_CORNER.rows, {
    x: x + halfWidth + CORNER_GAP,
    y,
    colours,
    flip: true,
  });
}

function drawSubLine(context, state, { x, y }) {
  const round = wordsOf(state.round, state.lang);
  const venue = wordsOf(state.venueName, state.lang);
  const gap = round && venue ? 18 : 0;
  const left = x - (widthOf(context, round) + gap + widthOf(context, venue)) / 2;

  drawWords(context, round, { x: left, y, color: CINE.text });
  drawWords(context, venue, { x: left + widthOf(context, round) + gap, y, color: CINE.muted });

  if (gap) {
    const middle = Math.round(left + widthOf(context, round) + gap / 2);

    context.fillStyle = CINE.gold[2];
    context.fillRect(middle - 1, y + 2, 3, 3);
    context.fillRect(middle, y + 1, 1, 5);
  }
}

export function drawCupBand(context, state) {
  const { enter, leave, shown } = motionOf(state, state.beats.cup);

  if (!shown) {
    return;
  }

  const y = BAND.y - Math.round(leave * (BAND.y + BAND.height + 10));
  const words = wordsOf(state.cup, state.lang);
  const slide = Math.round((1 - easeOut(shareOf(state.tick, state.beats.cup + 6, 20))) * -160);
  const x = MIDDLE + slide;
  const reach = Math.round((VIEW.width + 30) * enter);
  const halfWidth = widthOf(context, words, 16) / 2;

  drawBody(context, { y, reach });

  // the words ride in on the band: before its wipe has passed them they would stand on bare sky
  if (reach < x + halfWidth + CORNER_REACH) {
    return;
  }

  drawWords(context, words, { x, y: y + 10, size: 16, color: CINE.gold[3], align: 'center' });
  drawCorners(context, { x, y: y + 8, halfWidth });
  drawSubLine(context, state, { x, y: y + 33 });
}
