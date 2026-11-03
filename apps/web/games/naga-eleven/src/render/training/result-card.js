import { CARD, GRADE_COLORS } from '../../art/training/cards.js';
import { VIEW } from '../../config.js';
import { DRILLS } from '../../data/training.js';
import { RESULT_LOCK_TICKS } from '../../training/index.js';
import { numberIn, textOf } from '../text.js';
import { drawGlyph, GLYPH_SIZE } from './glyphs.js';
import { INTRO_CARD } from './intro-card.js';
import { LABELS } from './labels.js';
import { drawButton, drawPanel, say } from './panel.js';
import { faded, paint, pulse, ring } from './pixels.js';
import { statsOf } from './stats.js';

const CARD_BOX = INTRO_CARD;
const STAMP = { x: CARD_BOX.x + 340, y: CARD_BOX.y + 70, width: 148, height: 150 };
const SLAM_TICKS = 14;

export const RESULT_BUTTONS = {
  pass: { x: CARD_BOX.x + 24, y: CARD_BOX.y + 256, width: 228, height: 40 },
  shoot: { x: CARD_BOX.x + 268, y: CARD_BOX.y + 256, width: 228, height: 40 },
};

function drawStats(context, state, lang) {
  const left = CARD_BOX.x + 32;

  statsOf(state).forEach((stat, i) => {
    const top = CARD_BOX.y + 78 + i * 34;

    say(context, stat.label, { lang, x: left, y: top, color: CARD.muted });
    say(context, stat.value, {
      lang,
      x: left + 290,
      y: top,
      color: stat.gold ? CARD.gold : CARD.text,
      align: 'right',
    });
    paint(context, CARD.inner, [left, top + 24, 290, 2]);
  });
}

// the grade lands like a stamp: big, then down to size with a ring thrown off
function drawStamp(context, state) {
  const since = state.phase === 'result' ? state.phaseTicks : SLAM_TICKS;
  const landing = Math.min(1, since / SLAM_TICKS);
  const scale = Math.round(20 - 6 * landing);
  const colors = GRADE_COLORS[state.grade];
  const middle = { x: STAMP.x + STAMP.width / 2, y: STAMP.y + STAMP.height / 2 };

  paint(context, colors.ink, [STAMP.x, STAMP.y, STAMP.width, STAMP.height]);
  paint(context, colors.shade, [STAMP.x + 4, STAMP.y + 4, STAMP.width - 8, STAMP.height - 8]);
  paint(context, colors.ink, [STAMP.x + 8, STAMP.y + 8, STAMP.width - 16, STAMP.height - 16]);
  drawGlyph(context, {
    letter: state.grade,
    x: Math.round(middle.x - (GLYPH_SIZE.width * scale) / 2),
    y: Math.round(middle.y - (GLYPH_SIZE.height * scale) / 2),
    scale,
  });

  if (landing >= 1 && since < SLAM_TICKS + 20) {
    faded(context, 1 - (since - SLAM_TICKS) / 20, () =>
      ring(context, colors.light, { ...middle, radius: 80 + (since - SLAM_TICKS) * 3, width: 3 }),
    );
  }
}

// an S throws four stars off its corners, each twinkling in turn
function drawSparkles(context, state) {
  if (state.grade !== 'S') {
    return;
  }

  const corners = [
    [STAMP.x - 6, STAMP.y - 6],
    [STAMP.x + STAMP.width + 4, STAMP.y + 18],
    [STAMP.x + STAMP.width - 10, STAMP.y + STAMP.height + 2],
    [STAMP.x - 2, STAMP.y + STAMP.height - 30],
  ];

  corners.forEach(([x, y], i) => {
    const size = 2 + Math.round(pulse(state.tick + i * 15, 60) * 3) * 2;

    paint(context, CARD.gold, [x - size, y - 1, size * 2 + 2, 2]);
    paint(context, CARD.gold, [x - 1, y - size, 2, size * 2 + 2]);
    paint(context, CARD.text, [x - 1, y - 1, 2, 2]);
  });
}

function drawBest(context, state, lang) {
  if (state.attempt < 2 || !state.best) {
    return;
  }

  const words = state.newBest
    ? textOf(LABELS.newBest, lang)
    : `${textOf(LABELS.best, lang)} ${numberIn(state.best.score, lang)}`;
  const width = STAMP.width + 16;

  paint(context, CARD.ribbonShade, [STAMP.x - 8, STAMP.y + STAMP.height - 6, width, 28]);
  paint(context, CARD.ribbon, [STAMP.x - 8, STAMP.y + STAMP.height - 8, width, 26]);
  say(context, words, {
    x: STAMP.x + STAMP.width / 2,
    y: STAMP.y + STAMP.height - 3,
    color: CARD.text,
    align: 'center',
  });
}

export function drawResultCard(context, state, { lang }) {
  const ready = state.phase === 'result' && state.phaseTicks >= RESULT_LOCK_TICKS;

  faded(context, 0.55, () => paint(context, CARD.dim, [0, 0, VIEW.width, VIEW.height]));
  drawPanel(context, CARD_BOX);
  say(context, DRILLS[state.drill].name, {
    lang,
    x: VIEW.width / 2,
    y: CARD_BOX.y + 22,
    color: CARD.text,
    size: 24,
    align: 'center',
  });
  drawStats(context, state, lang);
  say(context, LABELS.grade, {
    lang,
    x: STAMP.x + STAMP.width / 2,
    y: STAMP.y - 24,
    color: CARD.muted,
    align: 'center',
  });
  drawStamp(context, state);
  drawSparkles(context, state);
  drawBest(context, state, lang);
  drawButton(context, {
    box: RESULT_BUTTONS.pass,
    key: 'pass',
    label: LABELS.continue,
    lang,
    ready,
  });
  drawButton(context, {
    box: RESULT_BUTTONS.shoot,
    key: 'shoot',
    label: LABELS.retry,
    lang,
    ready,
  });
}
