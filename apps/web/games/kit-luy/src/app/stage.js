import { createAudio } from '../audio/audio.js';
import { canBuzz, createHaptics } from '../platform/haptics.js';
import { storeSave } from '../platform/save.js';
import { createClothView } from '../ui/cloth-view.js';
import { byIds } from '../ui/dom.js';
import { createFuseView } from '../ui/fuse-view.js';
import { createKeypadView } from '../ui/keypad-view.js';
import { createMenus } from '../ui/menus.js';
import { createPraiseView } from '../ui/praise-view.js';
import { createResultsView } from '../ui/results-view.js';
import { createSignView } from '../ui/sign-view.js';
import { createSlipView } from '../ui/slip-view.js';
import { createStoolsView } from '../ui/stools-view.js';
import { createText } from '../ui/text.js';
import { createTillView } from '../ui/till-view.js';

const ELEMENT_IDS = [
  'app',
  'counter',
  'takings',
  'signBest',
  'stools',
  'slip',
  'slipAsk',
  'serial',
  'sum',
  'held',
  'blank',
  'total',
  'mend',
  'extraStamp',
  'fuse',
  'fuseLeft',
  'fuseSpark',
  'trust',
  'streak',
  'flyers',
  'praise',
  'praiseWord',
  'praiseTime',
  'keypad',
  'overSpeeds',
  'overReason',
  'cloth',
  'piles',
  'give',
  'till',
  'menus',
  'settingsRows',
  'overStamp',
  'overServed',
  'overTakings',
  'overPieces',
  'overMissed',
];

function views(at, text, window) {
  return {
    sign: createSignView(at, text),
    stools: createStoolsView({ row: at.stools }),
    slip: createSlipView(at, text),
    cloth: createClothView({ piles: at.piles, text, window }),
    till: createTillView({ till: at.till, text }),
    results: createResultsView(at, text),
    menus: createMenus(at.menus),
    fuse: createFuseView(at),
    praise: createPraiseView(at, text),
    keypad: createKeypadView(at, text),
  };
}

export function createStage({ window, document, game, storage }) {
  const at = byIds(document, ELEMENT_IDS);
  const { settings } = game;
  const text = createText(settings);

  return {
    window,
    document,
    game,
    at,
    text,
    now: 0,
    banked: 0,
    closedAt: 0,
    view: null,
    // the next bill waits here while the stamp on the last one is still being read
    nextSlip: null,
    lastDealt: [],
    audio: createAudio({ window, settings }),
    buzz: createHaptics(window.navigator, settings),
    can: { buzz: canBuzz(window.navigator) },
    save: () => storeSave(storage, game),
    ...views(at, text, window),
  };
}
