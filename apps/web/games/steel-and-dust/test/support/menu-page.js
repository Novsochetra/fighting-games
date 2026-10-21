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

export function openPage(records) {
  document.body.innerHTML = PAGE.match(/<body>([\s\S]*)<\/body>/)[1];
  document.body.className = '';
  const saveSettings = vi.fn();
  const game = createTestGame({ io: { saveSettings }, records });
  const audio = { sfx: vi.fn(), unlock: vi.fn(), syncVolumes: vi.fn() };
  const ui = createUiState(game);
  const elements = findElements(document);
  const { menus, act } = installUi({
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
  return { game, menus, act, saveSettings, key, ui, audio };
}

export const openMenu = () => document.querySelector('#menus .menu.open');
export const selected = () => document.querySelector('#menus .sel');
