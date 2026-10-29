import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { vi } from 'vitest';
import { findElements } from '../../src/boot/dom-elements.js';
import { installUi } from '../../src/boot/install-ui.js';
import { installKeyboard } from '../../src/input/keyboard.js';
import { installGameTouchPad } from '../../src/input/touch-actions.js';
import { createUiState } from '../../src/ui/ui-state.js';
import { createTestOnline } from './online-board.js';
import { createTestGame } from './test-game.js';

// happy-dom swaps the global URL for one that ignores file: bases, so the path is joined by hand
const PAGE = readFileSync(join(import.meta.dirname, '../../index.html'), 'utf8');

// a run saved on an earlier visit and the board kept so far come in as `checkpoint` and `leaderboard`;
// the online board answers through `api` (online-board.js) and keeps its ticket in `storage`
export function openPage({ records, checkpoint, leaderboard, api, storage } = {}) {
  document.body.innerHTML = PAGE.match(/<body>([\s\S]*)<\/body>/)[1];
  document.body.className = '';
  const saveSettings = vi.fn();
  const saveRun = vi.fn();
  const saveLeaderboard = vi.fn();
  const tested = createTestOnline({ ...(api && { api }), ...(storage && { storage }) });
  const { online } = tested;
  const game = createTestGame({
    io: { saveSettings, saveRun, saveLeaderboard, runStarted: () => online.startRun() },
    records,
    checkpoint,
    leaderboard,
  });
  const audio = { sfx: vi.fn(), unlock: vi.fn(), syncVolumes: vi.fn() };
  const ui = createUiState(game);
  const elements = findElements(document);
  const { menus, act, layout, supporters } = installUi({
    window,
    elements,
    game,
    audio,
    ui,
    pad: { connected: false },
    online,
  });
  // a fresh target per test, so keys never reach the listeners of an earlier test's page
  const keys = new EventTarget();
  installKeyboard(keys, { game, audio, menus, ui });
  // the touch pad answers and its stick rests on every fit, and the page is fitted, as main.js has it
  const touchPad = installGameTouchPad({ elements, game, audio, layout });
  layout.onFit = () => touchPad.restStick();
  layout.applyTouchSettings();
  menus.sync();
  const key = (code) => keys.dispatchEvent(new KeyboardEvent('keydown', { code }));
  const openSection = (id) => {
    act('settings');
    document.querySelector(`[data-section="${id}"]`).click();
  };
  const openSkins = () => {
    openSection('touch');
    document.querySelector('[data-k="skin"] [data-act="skins"]').click();
  };

  return {
    game,
    touchPad,
    menus,
    act,
    layout,
    supporters,
    saveSettings,
    saveRun,
    saveLeaderboard,
    key,
    openSection,
    openSkins,
    ui,
    audio,
    online,
    boardApi: tested.api,
    storage: tested.storage,
  };
}

export const openMenu = () => document.querySelector('#menus .menu.open');
export const selected = () => document.querySelector('#menus .sel');
