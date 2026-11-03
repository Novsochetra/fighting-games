import { CARD, POP } from '../../art/training/cards.js';
import { READY_TICKS } from '../../training/index.js';
import { coneBannerTop, coneMarkPlace, drawConeScene } from './cone-dribble/scene.js';
import { drawHud } from './hud.js';
import { drawIntroCard } from './intro-card.js';
import { LABELS } from './labels.js';
import { drawBanner, drawMarks } from './marks.js';
import { inside } from './panel.js';
import { drawResultCard, RESULT_BUTTONS } from './result-card.js';
import { drawSpiritScene, spiritMarkPlace } from './spirit-focus/scene.js';
import { drawShotScene, shotMarkPlace } from './target-shot/scene.js';

export { drillKeys } from './touch-keys.js';

// a banner never crosses the drill's player: it stands clear of the runner, over the meditator
const SCENES = {
  'cone-dribble': { draw: drawConeScene, placeOf: coneMarkPlace, bannerTop: coneBannerTop },
  'target-shot': { draw: drawShotScene, placeOf: shotMarkPlace },
  'spirit-focus': {
    draw: drawSpiritScene,
    placeOf: spiritMarkPlace,
    newestOnly: true,
    bannerTop: () => 84,
  },
};

export const bannerTopOf = (state) => SCENES[state.drill].bannerTop?.(state);

const IN_PLAY = new Set(['ready', 'play', 'finish']);
const BANNER_TICKS = 70;

function drawReady(context, state, lang) {
  const go = state.phaseTicks >= READY_TICKS / 2;

  drawBanner(context, {
    words: go ? LABELS.go : LABELS.ready,
    lang,
    color: go ? POP.good : CARD.gold,
    top: bannerTopOf(state),
  });
}

function drawFinish(context, state, lang) {
  const timeUp = state.drill === 'cone-dribble' && state.run.timeUp;
  const alpha = Math.min(1, (BANNER_TICKS + 20 - state.phaseTicks) / 20);

  if (state.phaseTicks < BANNER_TICKS + 20) {
    drawBanner(context, {
      words: timeUp ? LABELS.timeUp : LABELS.finished,
      lang,
      color: timeUp ? POP.bad : CARD.gold,
      alpha,
      top: bannerTopOf(state),
    });
  }
}

// `actors` is the match's footballer art (createActorArt, src/render/actors/), with the loaded
// sprites in it, which Sochetra is drawn from; with none he is the match's block figure
export function drawDrill(context, state, { lang = 'en', tick = state.tick, actors } = {}) {
  const scene = SCENES[state.drill];

  context.imageSmoothingEnabled = false;
  scene.draw(context, state, { tick, actors });

  if (IN_PLAY.has(state.phase)) {
    drawMarks(context, state, { placeOf: scene.placeOf, lang, newestOnly: scene.newestOnly });
    drawHud(context, state, { lang });
  }

  if (state.phase === 'ready') {
    drawReady(context, state, lang);
  } else if (state.phase === 'finish') {
    drawFinish(context, state, lang);
  } else if (state.phase === 'intro') {
    drawIntroCard(context, state, { lang, tick });
  } else if (state.phase === 'result' || state.phase === 'done') {
    drawResultCard(context, state, { lang });
  }
}

// a tap on the intro card starts the drill; on the result card it picks a button
export function hitTest(state, point) {
  if (state.phase === 'intro') {
    return 'pass';
  }

  if (state.phase !== 'result') {
    return null;
  }

  return Object.keys(RESULT_BUTTONS).find((key) => inside(RESULT_BUTTONS[key], point)) ?? null;
}
