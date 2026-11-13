import { DUEL_UI } from '../../art/duel/palette.js';
import { textOf } from '../text.js';
import { drawBars, drawCaption } from './bars.js';
import { drawChase } from './chase/draw-chase.js';
import { drawClash } from './clash.js';
import { drawCutin } from './cutin.js';
import { drawFinale } from './finale.js';
import { drawFocusLines } from './focus-lines.js';
import { hash, phaseOf } from './hash.js';
import { ART, duelMenu, ROOMY_MENU, UNIT } from './layout.js';
import { drawMenu } from './menu-draw.js';
import { createPen, shiftedPen } from './pen.js';
import { drawResult } from './result.js';
import { drawSaveCamOn } from '../save-cam/index.js';
import { shownRound } from './show.js';
import { STAGE_TICKS } from './stages.js';
import { drawVersus } from './versus.js';

const CAPTIONS = {
  field: { en: 'ONE ON ONE', km: 'មួយទល់មួយ' },
  keeper: { en: 'SHOT ON GOAL', km: 'ទាត់ចូលទី' },
};

const HINT = { en: 'UP DOWN   PASS: GO', km: 'ឡើង ចុះ   PASS: យល់ព្រម' };

// the match darkens and lines rush in on the two players as the duel is called
function intro(pen, show, { tick }) {
  const share = phaseOf(show.stageTicks, 0, STAGE_TICKS.intro);

  drawFocusLines(pen, {
    centre: { x: ART.width / 2, y: ART.height / 2 },
    inner: 70 - share * 40,
    color: DUEL_UI.white,
    tick,
    strength: share * 0.8,
  });
}

const SCENES = {
  intro,
  versus: drawVersus,
  menu: (pen, show, options) => {
    drawVersus(pen, show, options);
    drawMenu(pen, show, options);
  },
  wait: drawVersus,
  cutin: drawCutin,
  clash: drawClash,
  chase: drawChase,
  saveCam: (pen, show, options) => drawSaveCamOn(pen, show.saveCam, options),
  finale: drawFinale,
  result: drawResult,
  outro: drawResult,
  done: () => {},
};

// the bars slide in over the match, stay through the show and slide away at its end
function barsAmount(show) {
  if (show.stage === 'intro') {
    return phaseOf(show.stageTicks, 0, 12);
  }

  return show.stage === 'outro' ? 1 - phaseOf(show.stageTicks, 0, STAGE_TICKS.outro) : 1;
}

function sceneAlpha(show) {
  if (show.stage === 'outro') {
    return 1 - phaseOf(show.stageTicks, 0, STAGE_TICKS.outro - 4);
  }

  return 1;
}

function dimMatch(context, show) {
  const share = show.stage === 'intro' ? phaseOf(show.stageTicks, 0, STAGE_TICKS.intro) * 0.7 : 0;

  if (share > 0) {
    context.save();
    context.globalAlpha = share;
    context.fillStyle = DUEL_UI.dim;
    context.fillRect(0, 0, ART.width * UNIT, ART.height * UNIT);
    context.restore();
  }
}

// the shake in whole art pixels, the same for a frame drawn twice
export function shakeOffset(show) {
  if (show.shake <= 0) {
    return { x: 0, y: 0 };
  }

  const power = Math.ceil(show.shake / 4);

  return {
    x: Math.round((hash(show.ticks, 1) - 0.5) * 2 * power),
    y: Math.round((hash(show.ticks, 2) - 0.5) * 2 * power),
  };
}

function flash(context, show) {
  if (show.flash <= 0) {
    return;
  }

  context.save();
  context.globalAlpha = Math.min(1, show.flash / 5);
  context.fillStyle = DUEL_UI.flash;
  context.fillRect(0, 0, ART.width * UNIT, ART.height * UNIT);
  context.restore();
}

function captions(context, show, lang) {
  const round = shownRound(show);

  if (show.stage === 'intro' || show.stage === 'outro' || !round) {
    return;
  }

  drawCaption(context, { text: textOf(CAPTIONS[round.kind], lang) });

  // a finger's menu has no keys to name: its rows and arrows take taps
  if (show.stage === 'menu' && duelMenu() !== ROOMY_MENU) {
    drawCaption(context, { text: textOf(HINT, lang), bottom: true, color: DUEL_UI.muted });
  }
}

// `actors` are the players' sheets, which the save cam draws its keeper from
export function drawDuelShow(
  context,
  show,
  { lang = 'en', tick = show.ticks, actors = null } = {},
) {
  const pen = createPen(context, { unit: UNIT });
  const offset = shakeOffset(show);

  context.imageSmoothingEnabled = false;
  dimMatch(context, show);
  context.save();
  context.globalAlpha = sceneAlpha(show);
  SCENES[show.stage](shiftedPen(pen, offset.x, offset.y), show, { lang, tick, actors });
  context.restore();
  flash(context, show);
  drawBars(pen, barsAmount(show));
  captions(context, show, lang);
}
