import { createArcadeExit } from '../../../../packages/host/src/arcade-exit.js';
import { installAudioUnlock } from '../audio/install-unlock.js';
import { installInput } from '../input/install-input.js';
import { loadSave } from '../platform/save.js';
import { createSettingsView } from '../ui/settings-view.js';
import { applyText } from '../ui/text.js';
import { createActions } from './actions.js';
import { drainGame, openStall, tick } from './flow.js';
import { drawFrame } from './frame.js';
import { createGame } from './game.js';
import { startLoop } from './loop.js';
import { present } from './present.js';
import { createSettingsChanged } from './settings-changed.js';
import { createStage } from './stage.js';

// reading localStorage itself throws where site data is blocked
function storageOf(window) {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function showMix(document, settings) {
  for (const chip of document.querySelectorAll('.chip')) {
    chip.setAttribute('aria-pressed', String(settings.ops.includes(chip.dataset.op)));
  }
}

function installPage(stage) {
  const { window, document, game } = stage;
  const renderRows = createSettingsView({
    list: stage.at.settingsRows,
    settings: game.settings,
    text: stage.text,
    can: stage.can,
    changed: createSettingsChanged(stage),
  });
  const renderSettings = () => {
    renderRows();
    showMix(document, game.settings);
  };
  const leaveForArcade = createArcadeExit({
    location: window.location,
    history: window.history,
    referrer: document.referrer,
  });

  document.documentElement.lang = game.settings.lang;
  applyText(document, stage.text);
  stage.keypad.write();
  installInput(stage, createActions(stage, { leaveForArcade, renderSettings }));
  installAudioUnlock({ window, document, audio: stage.audio });
}

export function boot(window) {
  const { document, navigator } = window;
  const storage = storageOf(window);
  const game = createGame(loadSave(storage, navigator.languages ?? []));
  const stage = createStage({ window, document, game, storage });

  installPage(stage);
  openStall(game, window.Date.now() >>> 0);
  startLoop(window, (ms) => {
    tick(game, ms);
    present(stage, drainGame(game));
    drawFrame(stage, ms);
  });

  return { game, stage };
}
