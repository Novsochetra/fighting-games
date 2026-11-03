import { BAR, CARD } from '../../art/training/cards.js';
import { TICKS_PER_SECOND, VIEW } from '../../config.js';
import { DRILLS } from '../../data/training.js';
import { liveGrade } from '../../training/index.js';
import { runTime } from '../../training/cone-dribble/index.js';
import { SPIRIT_MAX } from '../../training/spirit-focus/judge.js';
import { numberIn, textOf } from '../text.js';
import { drawGlyph } from './glyphs.js';
import { LABELS } from './labels.js';
import { drawPanel, say } from './panel.js';
import { paint } from './pixels.js';

const PANEL = { y: 10, width: 200, height: 56 };
const BAR_WIDTH = PANEL.width - 32;

// the touch pad's pause key stands in the top right corner; held upright, the stage is so narrow
// that the key reaches about 110 px into it, so the HUD ends short of that
const PAUSE_ROOM = 120;

export const BADGE = {
  x: VIEW.width - PAUSE_ROOM - 52,
  y: PANEL.y,
  size: 52,
  height: PANEL.height,
};
const RIGHT = BADGE.x - 8 - PANEL.width;
const NAME_X = Math.round((12 + PANEL.width + RIGHT) / 2);

// the panels' bottom edge, which the marks rising from play stay under
export const HUD_BOTTOM = PANEL.y + PANEL.height;

export const seconds = (ticks) => (Math.max(0, ticks) / TICKS_PER_SECOND).toFixed(1);

// the drill's own clock: time on the course, shots taken, or beats played
const CLOCKS = {
  'cone-dribble': (run) => ({
    label: LABELS.time,
    value: `${seconds(runTime(run))}/${seconds(run.limit)}`,
    bar: null,
  }),
  'target-shot': (run) => ({
    label: LABELS.shots,
    value: `${Math.min(run.shot + 1, DRILLS['target-shot'].tuning.shots)}/${DRILLS['target-shot'].tuning.shots}`,
    bar: run.target.left / run.target.total,
  }),
  'spirit-focus': (run) => ({
    label: LABELS.beats,
    value: `${run.beats.filter((beat) => beat.rating !== null).length}/${run.beats.length}`,
    bar: run.spirit / SPIRIT_MAX,
  }),
};

function drawBar(context, { x, y, share }) {
  const inner = BAR_WIDTH - 4;

  paint(context, CARD.shadow, [x, y, BAR_WIDTH, 8]);
  paint(context, BAR.back, [x + 2, y + 2, inner, 4]);
  paint(context, BAR.fill, [x + 2, y + 2, Math.round(inner * Math.max(0, Math.min(1, share))), 4]);
}

function drawClock(context, state, lang) {
  const clock = CLOCKS[state.drill](state.run);

  drawPanel(context, { x: 12, y: PANEL.y, width: PANEL.width, height: PANEL.height });
  say(context, clock.label, { lang, x: 26, y: PANEL.y + 10, color: CARD.muted });
  say(context, clock.value, {
    lang,
    x: 26 + PANEL.width - 28,
    y: PANEL.y + 10,
    color: CARD.text,
    align: 'right',
  });

  if (clock.bar !== null) {
    drawBar(context, { x: 26, y: PANEL.y + 36, share: clock.bar });
  } else if (state.run.penalty > 0) {
    say(context, `${textOf(LABELS.penalty, lang)} +${numberIn(seconds(state.run.penalty), lang)}`, {
      x: 26,
      y: PANEL.y + 32,
      color: CARD.ribbon,
    });
  }
}

function drawScore(context, state, lang) {
  const comboLabel = state.drill === 'spirit-focus' ? LABELS.streak : LABELS.combo;
  const right = RIGHT + PANEL.width - 14;

  drawPanel(context, { x: RIGHT, y: PANEL.y, width: PANEL.width, height: PANEL.height });
  say(context, LABELS.score, { lang, x: RIGHT + 14, y: PANEL.y + 10, color: CARD.muted });
  say(context, String(state.score), {
    x: right,
    y: PANEL.y + 10,
    color: CARD.gold,
    align: 'right',
  });
  say(context, comboLabel, { lang, x: RIGHT + 14, y: PANEL.y + 32, color: CARD.muted });
  say(context, `x${state.combo}`, { x: right, y: PANEL.y + 32, color: CARD.text, align: 'right' });
}

// nothing played yet, nothing graded: a dash waits in the badge
function drawGradeBadge(context, state) {
  const grade = liveGrade(state);

  drawPanel(context, { x: BADGE.x, y: PANEL.y, width: BADGE.size, height: PANEL.height });

  if (grade) {
    drawGlyph(context, { letter: grade, x: BADGE.x + 14, y: PANEL.y + 14, scale: 4 });
  } else {
    paint(context, CARD.muted, [BADGE.x + 18, PANEL.y + 26, 16, 4]);
  }
}

export function drawHud(context, state, { lang }) {
  drawClock(context, state, lang);
  drawScore(context, state, lang);
  drawGradeBadge(context, state);
  say(context, DRILLS[state.drill].name, {
    lang,
    x: NAME_X,
    y: PANEL.y + 4,
    color: CARD.text,
    align: 'center',
  });
}
