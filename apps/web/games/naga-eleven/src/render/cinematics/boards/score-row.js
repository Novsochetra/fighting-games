import { SHIRT } from '../../../art/cinematics/icons.js';
import { CINE } from '../../../art/cinematics/palette.js';
import { shirtColours } from '../shared/kits.js';
import { LABELS } from '../shared/labels.js';
import { drawInset, drawRampBar } from '../shared/panel.js';
import { drawPixelMap } from '../shared/pixel-map.js';
import { drawWords, wordsOf } from '../shared/words.js';
import { BOARD, MIDDLE, SCORE_ROW } from './layout.js';

const SCORE_BOX = { width: 124, height: 46 };
const SHIRT_WIDTH = SHIRT[0].length * 2;
const EDGE = 22;

function drawSide(context, { team, kit, side, y, lang }) {
  const mirror = side === 1;
  const outer = mirror ? BOARD.x + BOARD.width - EDGE : BOARD.x + EDGE;
  const textX = mirror ? outer - SHIRT_WIDTH - 10 : outer + SHIRT_WIDTH + 10;
  const align = mirror ? 'right' : 'left';
  const barFrom = mirror ? MIDDLE + SCORE_BOX.width / 2 + 10 : BOARD.x + 16;
  const barWidth = BOARD.width / 2 - SCORE_BOX.width / 2 - 26;

  drawPixelMap(context, SHIRT, {
    x: mirror ? outer - SHIRT_WIDTH : outer,
    y: y + 8,
    colours: shirtColours(kit),
    scale: 2,
  });
  drawWords(context, wordsOf(team.short, lang), { x: textX, y: y + 6, size: 24, align, drop: 1 });
  drawWords(context, wordsOf(team.name, lang), { x: textX, y: y + 33, color: CINE.muted, align });
  drawRampBar(
    context,
    { x: barFrom, y: y + SCORE_ROW.height - 6, width: barWidth, height: 4 },
    kit.band,
  );
}

function drawScore(context, { score, y, penalties }) {
  const top = y + (SCORE_ROW.height - SCORE_BOX.height) / 2 - 3;

  drawInset(context, { x: MIDDLE - SCORE_BOX.width / 2, y: top, ...SCORE_BOX });
  drawWords(context, `${score[0]}-${score[1]}`, {
    x: MIDDLE,
    y: top + 11,
    size: 24,
    color: CINE.gold[2],
    align: 'center',
    drop: 1,
  });

  if (penalties) {
    drawWords(context, `(${penalties.goals[0]}-${penalties.goals[1]})`, {
      x: MIDDLE,
      y: top + SCORE_BOX.height + 4,
      color: CINE.gold[3],
      align: 'center',
    });
  }
}

export function drawScoreRow(context, { teams, kits, score, y, lang, penalties }) {
  const top = y + (SCORE_ROW.y - BOARD.y);

  [0, 1].forEach((side) => {
    drawSide(context, { team: teams[side], kit: kits[side], side, y: top, lang });
  });
  drawScore(context, { score, y: top, penalties });

  if (penalties) {
    drawWords(context, wordsOf(LABELS.penalties, lang), {
      x: MIDDLE,
      y: top - 9,
      color: CINE.muted,
      align: 'center',
      outline: null,
    });
  }
}
