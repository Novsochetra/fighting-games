import { CARD } from '../../art/training/cards.js';
import { VIEW } from '../../config.js';
import { DRILLS } from '../../data/training.js';
import { numberIn, textOf, wrapText } from '../text.js';
import { drawGlyph } from './glyphs.js';
import { drawIcon, HOW_TO_ICONS } from './icons.js';
import { LABELS } from './labels.js';
import { drawKey, drawPanel, say, textWidth } from './panel.js';
import { faded, paint, pulse } from './pixels.js';

export const INTRO_CARD = { x: 124, y: 56, width: 520, height: 320 };

const LINE = 18;
const STEP = 40;

function drawHeader(context, { drill, level, lang }) {
  const middle = VIEW.width / 2;
  const top = INTRO_CARD.y;

  say(
    context,
    `${textOf(LABELS.training, lang)} · ${textOf(LABELS.level, lang)} ${numberIn(level, lang)}`,
    {
      x: middle,
      y: top + 18,
      color: CARD.gold,
      align: 'center',
    },
  );
  say(context, drill.name, {
    lang,
    x: middle,
    y: top + 42,
    color: CARD.text,
    size: 24,
    align: 'center',
  });

  const emblem = HOW_TO_ICONS[drill.id][1];

  drawIcon(context, { name: emblem, x: INTRO_CARD.x + 36, y: top + 38 });
  drawIcon(context, { name: emblem, x: INTRO_CARD.x + INTRO_CARD.width - 60, y: top + 38 });
  paint(context, CARD.edge, [INTRO_CARD.x + 24, top + 78, INTRO_CARD.width - 48, 2]);
}

function drawHowTo(context, { drill, lang }) {
  const left = INTRO_CARD.x + 32;

  drill.howTo.forEach((line, i) => {
    const top = INTRO_CARD.y + 94 + i * STEP;
    const rows = wrapText(context, textOf(line, lang), {
      maxWidth: INTRO_CARD.width - 112,
      size: 16,
    });

    drawIcon(context, { name: HOW_TO_ICONS[drill.id][i], x: left, y: top + 2 });
    rows.slice(0, 2).forEach((row, j) => {
      say(context, row, {
        x: left + 44,
        y: top + j * LINE + (rows.length > 1 ? 0 : 6),
        color: CARD.text,
      });
    });
  });
}

function drawFooter(context, { state, drill, lang, tick }) {
  const middle = VIEW.width / 2;
  const top = INTRO_CARD.y + 220;
  const trains = `${textOf(LABELS.trains, lang)}: ${textOf(drill.reward, lang)}`;

  say(context, trains, { x: middle, y: top, color: CARD.muted, align: 'center' });

  if (state.best) {
    say(context, `${textOf(LABELS.best, lang)} ${numberIn(state.best.score, lang)}`, {
      x: middle - 12,
      y: top + 24,
      color: CARD.gold,
      align: 'center',
    });
    drawGlyph(context, { letter: state.best.grade, x: middle + 60, y: top + 24, scale: 2 });
  }

  const prompt = textOf(LABELS.start, lang);
  const width = textWidth(context, prompt, 16) + 20;

  faded(context, 0.55 + pulse(tick, 60) * 0.45, () =>
    drawKey(context, {
      x: Math.round(middle - width / 2),
      y: top + 56,
      key: 'pass',
      label: prompt,
    }),
  );
}

export function drawIntroCard(context, state, { lang, tick }) {
  const drill = DRILLS[state.drill];

  faded(context, 0.55, () => paint(context, CARD.dim, [0, 0, VIEW.width, VIEW.height]));
  drawPanel(context, INTRO_CARD);
  drawHeader(context, { drill, level: state.level, lang });
  drawHowTo(context, { drill, lang });
  drawFooter(context, { state, drill, lang, tick });
}
