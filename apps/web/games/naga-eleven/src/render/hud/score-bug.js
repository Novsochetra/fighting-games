import { HUD } from '../../art/hud.js';
import { drawText, measureText, textOf } from '../text.js';
import { halfOf, minuteText } from './clock.js';
import { drawKitIcon, ICON_SIZE } from './kit-icon.js';
import { BAR_HEIGHT, SCORE_BUG } from './layout.js';
import { drawInset, drawPanel } from './panel.js';

const PAD = 5;
const SMALL = { size: 8 };
const BIG = { size: 16 };

const shortOf = (team, side) => textOf(team?.short ?? ['HOM', 'AWY'][side]).toUpperCase();

function drawMinute(context, match, x) {
  const words = minuteText(match);
  const width = Math.ceil(measureText(context, words, SMALL)) + PAD * 2;
  const y = SCORE_BUG.y;

  drawPanel(context, { x, y, width, height: BAR_HEIGHT }, HUD.gold);
  drawText(context, words, {
    x: x + width / 2,
    y: y + 7,
    color: HUD.ink,
    align: 'center',
    baseline: 'middle',
    ...SMALL,
  });

  for (let half = 1; half <= 2; half += 1) {
    context.fillStyle = half <= halfOf(match) ? HUD.ink : HUD.gold[1];
    context.fillRect(Math.round(x + width / 2 - 3 + (half - 1) * 4), y + 13, 2, 2);
  }

  return x + width + 2;
}

function measureBug(context, match) {
  const shorts = [0, 1].map((side) => shortOf(match.teams?.[side], side));
  const score = `${match.score[0]}-${match.score[1]}`;
  const nameWidth = Math.max(
    ...shorts.map((words) => Math.ceil(measureText(context, words, SMALL))),
  );
  const scoreWidth = Math.ceil(measureText(context, score, BIG)) + PAD * 2;

  return { shorts, score, nameWidth, scoreWidth };
}

function drawSide(context, { kit, words, x, width, iconFirst }) {
  const middle = SCORE_BUG.y + BAR_HEIGHT / 2;
  const iconX = iconFirst ? x : x + width - ICON_SIZE.width;
  const textX = iconFirst ? x + ICON_SIZE.width + 4 : x;

  drawKitIcon(context, kit, { x: iconX, y: Math.round(middle - ICON_SIZE.height / 2) });
  drawText(context, words, { x: textX, y: middle, color: HUD.text, baseline: 'middle', ...SMALL });
}

export function drawScoreBug(context, match, kits) {
  const left = drawMinute(context, match, SCORE_BUG.x);
  const { shorts, score, nameWidth, scoreWidth } = measureBug(context, match);
  const sideWidth = ICON_SIZE.width + 4 + nameWidth;
  const width = PAD + sideWidth + 4 + scoreWidth + 4 + sideWidth + PAD;
  const scoreX = left + PAD + sideWidth + 4;
  const y = SCORE_BUG.y;

  drawPanel(context, { x: left, y, width, height: BAR_HEIGHT });
  drawSide(context, {
    kit: kits[0].outfield,
    words: shorts[0],
    x: left + PAD,
    width: sideWidth,
    iconFirst: true,
  });
  drawInset(context, { x: scoreX, y: y + 2, width: scoreWidth, height: BAR_HEIGHT - 4 });
  drawText(context, score, {
    x: scoreX + scoreWidth / 2,
    y: y + BAR_HEIGHT / 2,
    color: HUD.gold[2],
    align: 'center',
    baseline: 'middle',
    ...BIG,
  });
  drawSide(context, {
    kit: kits[1].outfield,
    words: shorts[1],
    x: scoreX + scoreWidth + 4,
    width: sideWidth,
    iconFirst: false,
  });

  return { x: SCORE_BUG.x, y, width: left + width - SCORE_BUG.x, height: BAR_HEIGHT };
}
