import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { vi } from 'vitest';
import { findElements } from '../../src/boot/dom-elements.js';
import { installUi } from '../../src/boot/install-ui.js';
import { installKeyboard } from '../../src/input/keyboard.js';
import { createUiState } from '../../src/ui/ui-state.js';
import { createTestGame } from './test-game.js';

// happy-dom swaps the global URL for one that ignores file: bases, so the path is joined by hand
const PAGE = readFileSync(join(import.meta.dirname, '../../index.html'), 'utf8');

// a run saved on an earlier visit and the board kept so far come in as `checkpoint` and `leaderboard`
export function openPage({ records, checkpoint, leaderboard } = {}) {
  document.body.innerHTML = PAGE.match(/<body>([\s\S]*)<\/body>/)[1];
  document.body.className = '';
  const saveSettings = vi.fn();
  const saveRun = vi.fn();
  const saveLeaderboard = vi.fn();
  const game = createTestGame({
    io: { saveSettings, saveRun, saveLeaderboard },
    records,
    checkpoint,
    leaderboard,
  });
  const audio = { sfx: vi.fn(), unlock: vi.fn(), syncVolumes: vi.fn() };
  const ui = createUiState(game);
  const elements = findElements(document);
  const { menus, act, layout } = installUi({
    window,
    elements,
    game,
    audio,
    ui,
    pad: { connected: false },
  });
  // a fresh target per test, so keys never reach the listeners of an earlier test's page
  const keys = new EventTarget();
  installKeyboard(keys, { game, audio, menus, ui });
  menus.sync();
  const key = (code) => keys.dispatchEvent(new KeyboardEvent('keydown', { code }));
  return { game, menus, act, layout, saveSettings, saveRun, saveLeaderboard, key, ui, audio };
}

export const openMenu = () => document.querySelector('#menus .menu.open');
export const selected = () => document.querySelector('#menus .sel');
