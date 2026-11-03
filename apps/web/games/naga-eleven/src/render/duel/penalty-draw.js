import { DUEL_UI, WORD_RAMPS } from '../../art/duel/palette.js';
import { textOf } from '../text.js';
import { drawBars, drawCaption } from './bars.js';
import { overshoot, phaseOf } from './hash.js';
import { ART, UNIT } from './layout.js';
import {
  ballAt,
  drawPenaltyBall,
  drawPenaltyKeeper,
  drawPenaltyShooter,
  PENALTY_STRIKE,
} from './penalty-actors.js';
import { drawAimMarks, drawDiveMarks, drawPowerGauge, drawScoreboard } from './penalty-hud.js';
import { drawPenaltyGoal, drawPenaltyGround } from './penalty-scene.js';
import { createPen } from './pen.js';
import { drawPixelWord } from './pixel-word.js';
import { humanPart } from './penalty-show.js';

const WORDS = { scored: ['GOAL!', 'gold'], saved: ['SAVED!', 'ice'], missed: ['MISSED!', 'ember'] };

const HINTS = {
  aim: { en: 'UP DOWN: AIM   PASS: OK', km: 'ឡើង ចុះ: តម្រង់   PASS: យល់ព្រម' },
  power: { en: 'PASS: SHOOT', km: 'PASS: ទាត់' },
  dive: { en: 'UP DOWN: DIVE   PASS: OK', km: 'ឡើង ចុះ: លោត   PASS: យល់ព្រម' },
};

const TITLE = { en: 'PENALTIES', km: 'ទាត់ប៉េណាល់ទី' };

function names(show) {
  return [0, 1].map((team) => show.match?.teams?.[team]?.short ?? (team === 0 ? 'HOM' : 'AWY'));
}

function kickOf(show) {
  return ['kick', 'result'].includes(show.stage) ? show.kick : null;
}

function action(pen, show, tick) {
  const kick = kickOf(show);
  const ticks = show.stage === 'result' ? 99 : show.stageTicks;
  const ball = ballAt(kick, ticks);
  const scored = kick?.result === 'scored' && ticks > PENALTY_STRIKE;

  drawPenaltyGoal(pen, { bulge: scored ? { ...ball, size: 6 } : undefined });
  drawPenaltyKeeper(pen, { kick, ticks, tick });
  drawPenaltyBall(pen, ball);
  drawPenaltyShooter(pen, { kick, ticks });
}

function word(pen, show) {
  const [text, ramp] = WORDS[show.kick?.result] ?? [];

  if (show.stage === 'result' && text) {
    const size = Math.round(6 * overshoot(phaseOf(show.stageTicks, 0, 10)));

    drawPixelWord(pen, {
      text,
      x: ART.width / 2,
      y: 60 - size * 3.5,
      size: Math.max(2, size),
      ramp: WORD_RAMPS[ramp],
    });
  }
}

function winner(pen, show, lang) {
  if (show.stage !== 'over') {
    return;
  }

  const team = show.shootout.kicks.at(-1)?.team ?? 0;
  const won = show.match?.teams?.[team]?.name ?? names(show)[team];

  drawPixelWord(pen, {
    text: textOf(won, 'en').slice(0, 14),
    x: ART.width / 2,
    y: 52,
    size: 3,
    ramp: WORD_RAMPS.gold,
  });
  drawPixelWord(pen, { text: 'WIN!', x: ART.width / 2, y: 78, size: 5, ramp: WORD_RAMPS.gold });

  if (lang === 'km') {
    drawCaption(pen.context, { text: 'ឈ្នះ!', bottom: true });
  }
}

function overlays(pen, show, tick) {
  if (show.stage === 'aim') {
    drawAimMarks(pen, { cursor: show.cursor, tick });
  } else if (show.stage === 'power') {
    drawAimMarks(pen, { cursor: show.cursor, tick });
    drawPowerGauge(pen, { power: show.power });
  } else if (show.stage === 'dive') {
    drawDiveMarks(pen, { cursor: show.cursor, tick });
  }
}

export function drawPenaltyShow(context, show, { lang = 'en', tick = show.ticks } = {}) {
  const pen = createPen(context, { unit: UNIT });

  context.imageSmoothingEnabled = false;
  drawPenaltyGround(pen, tick);
  action(pen, show, tick);
  overlays(pen, show, tick);
  drawScoreboard(pen, { shootout: show.shootout, names: names(show) });
  word(pen, show);
  winner(pen, show, lang);
  drawBars(pen, 1);
  drawCaption(context, { text: textOf(TITLE, lang) });

  const hint = HINTS[show.stage];

  if (hint && humanPart(show)) {
    drawCaption(context, { text: textOf(hint, lang), bottom: true, color: DUEL_UI.muted });
  }
}
