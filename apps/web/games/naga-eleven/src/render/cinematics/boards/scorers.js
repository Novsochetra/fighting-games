import { BALL } from '../../../art/cinematics/icons.js';
import { CINE } from '../../../art/cinematics/palette.js';
import { textOf } from '../../text.js';
import { easeOut, shareOf } from '../shared/ease.js';
import { LABELS } from '../shared/labels.js';
import { drawPixelMap } from '../shared/pixel-map.js';
import { drawWords, wordsOf } from '../shared/words.js';
import { BOARD, BOARD_MOTION, MIDDLE, SCORERS } from './layout.js';
import { goalsOf } from './stats.js';

const EDGE = 26;
const BALL_SIZE = BALL.rows[0].length;

function nameOf(goal, lang) {
  if (goal.scorer === null) {
    return wordsOf(LABELS.ownGoal, lang);
  }

  return goal.name ? textOf(goal.name, lang).toUpperCase() : `#${goal.number ?? '?'}`;
}

// a player who scored twice shows once, with both minutes; each own goal shows on its own
export function scorerLines(goals, lang = 'en') {
  const groups = [];

  for (const goal of goals) {
    const same = goal.scorer !== null && groups.find((group) => group.scorer === goal.scorer);

    if (same) {
      same.minutes.push(goal.minute);
    } else {
      groups.push({ scorer: goal.scorer, words: nameOf(goal, lang), minutes: [goal.minute] });
    }
  }

  return groups.map(
    ({ words, minutes }) => `${words} ${minutes.map((minute) => `${minute}'`).join(' ')}`,
  );
}

function fitted(lines, lang) {
  if (lines.length <= SCORERS.most) {
    return lines;
  }

  const kept = lines.slice(0, SCORERS.most - 1);

  return [...kept, `+${lines.length - kept.length} ${wordsOf(LABELS.more, lang)}`];
}

function drawLine(context, { words, side, y, slide }) {
  const mirror = side === 1;
  const outer = mirror ? BOARD.x + BOARD.width - EDGE : BOARD.x + EDGE;
  const shift = Math.round((1 - slide) * 12) * (mirror ? 1 : -1);
  const ballX = mirror ? outer - BALL_SIZE : outer;
  const textX = mirror ? ballX - 5 : ballX + BALL_SIZE + 5;

  drawPixelMap(context, BALL.rows, { x: ballX + shift, y, colours: BALL.colours });
  drawWords(context, words, {
    x: textX + shift,
    y,
    color: CINE.text,
    align: mirror ? 'right' : 'left',
  });
}

function drawNoGoals(context, { top, age, lang }) {
  if (age >= BOARD_MOTION.scorer) {
    drawWords(context, wordsOf(LABELS.noGoals, lang), {
      x: MIDDLE,
      y: top + SCORERS.line,
      color: CINE.muted,
      align: 'center',
      outline: null,
    });
  }
}

export function drawScorers(context, { stats, y, age, lang }) {
  const top = y + (SCORERS.y - BOARD.y);

  if (stats.goals.length === 0) {
    drawNoGoals(context, { top, age, lang });

    return;
  }

  [0, 1].forEach((side) => {
    fitted(scorerLines(goalsOf(stats, side), lang), lang).forEach((words, i) => {
      const slide = easeOut(shareOf(age, BOARD_MOTION.scorer + i * BOARD_MOTION.scorerStep, 8));

      if (slide > 0) {
        drawLine(context, { words, side, y: top + i * SCORERS.line, slide });
      }
    });
  });
}
