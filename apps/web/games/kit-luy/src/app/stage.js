import { createAudio } from '../audio/audio.js';
import { createFx } from '../fx/particles.js';
import { createPiggy } from '../fx/piggy-mood.js';
import { canBuzz, createHaptics } from '../platform/haptics.js';
import { storeSave } from '../platform/save.js';
import { createBanner } from '../ui/banner.js';
import { createCanvases } from '../ui/canvases.js';
import { byIds } from '../ui/dom.js';
import { createHud } from '../ui/hud.js';
import { createMenus } from '../ui/menus.js';
import { createPops } from '../ui/pops.js';
import { createQuestionView } from '../ui/question-view.js';
import { createResultsView } from '../ui/results-view.js';
import { createText } from '../ui/text.js';
import { createTitleView } from '../ui/title-view.js';

const HUD_IDS = ['score', 'level', 'levelPips', 'clock', 'clockFill', 'clockSeconds'];

const rankOf = (document, prefix) => ({
  name: document.getElementById(`${prefix}Rank`),
  fill: document.getElementById(`${prefix}RankFill`),
  next: document.getElementById(`${prefix}Next`),
});

function playViews(document, at) {
  const hud = { ...byIds(document, HUD_IDS), combo: at.combo, streakPips: at.streakPips };

  return {
    hud: createHud(hud),
    question: createQuestionView(at),
    pop: createPops(at.pops),
    announce: createBanner(at.banner),
  };
}

function menuViews(document, at) {
  return {
    menus: createMenus(at.menus),
    showTitle: createTitleView({
      best: at.titleBest,
      savings: at.titleSavings,
      rank: rankOf(document, 'title'),
      chips: [...document.querySelectorAll('.chip')],
    }),
    results: createResultsView({
      score: at.overScore,
      correct: at.overCorrect,
      accuracy: at.overAccuracy,
      streak: at.overStreak,
      level: at.overLevel,
      stamp: at.overStamp,
      rank: rankOf(document, 'over'),
    }),
  };
}

const ELEMENT_IDS = [
  'app',
  'clock',
  'level',
  'stage',
  'backdrop',
  'fx',
  'menus',
  'pops',
  'banner',
  'note',
  'caption',
  'sum',
  'answers',
  'combo',
  'streakPips',
  'hudPiggy',
  'titlePiggy',
  'settingsRows',
  'titleBest',
  'titleSavings',
  'overScore',
  'overCorrect',
  'overAccuracy',
  'overStreak',
  'overLevel',
  'overStamp',
];

export function createStage({ window, document, game, storage }) {
  const at = byIds(document, ELEMENT_IDS);
  const { settings } = game;

  return {
    window,
    document,
    game,
    at,
    seconds: 0,
    screen: null,
    text: createText(settings),
    audio: createAudio({ window, settings }),
    buzz: createHaptics(window.navigator, settings),
    can: { buzz: canBuzz(window.navigator) },
    fx: createFx(),
    piggy: createPiggy(),
    piggies: [at.hudPiggy, at.titlePiggy].map((canvas) => canvas.getContext('2d')),
    canvases: createCanvases({ window, backdrop: at.backdrop, fx: at.fx }),
    save: () => storeSave(storage, game),
    ...playViews(document, at),
    ...menuViews(document, at),
  };
}
