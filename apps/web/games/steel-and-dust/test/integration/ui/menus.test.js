// @vitest-environment happy-dom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { findElements } from '../../../src/boot/dom-elements.js';
import { installUi } from '../../../src/boot/install-ui.js';
import { installKeyboard } from '../../../src/input/keyboard.js';
import { tick } from '../../../src/sim/tick.js';
import { createUiState } from '../../../src/ui/ui-state.js';
import { createTestGame } from '../../support/test-game.js';

// happy-dom swaps the global URL for one that ignores file: bases, so the path is joined by hand
const PAGE = readFileSync(join(import.meta.dirname, '../../../index.html'), 'utf8');

function openPage() {
  document.body.innerHTML = PAGE.match(/<body>([\s\S]*)<\/body>/)[1];
  const saveSettings = vi.fn();
  const game = createTestGame({ io: { saveSettings } });
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
  return { game, menus, act, saveSettings, key };
}

const openMenu = () => document.querySelector('#menus .menu.open');
const selected = () => document.querySelector('#menus .sel');

describe('game menus on the real page', () => {
  let page;
  let key;
  beforeEach(() => {
    page = openPage();
    key = page.key;
  });

  it('opens on the title menu with a way back to the arcade', () => {
    expect(openMenu().id).toBe('m-title');
    expect(document.querySelector('[data-act="arcade"]')).not.toBeNull();
  });

  it('moves the highlight with the arrow keys and opens How to play with Enter', () => {
    key('ArrowDown');
    expect(selected().textContent).toBe('How to play');
    key('Enter');
    expect(openMenu().id).toBe('m-help');
    expect(document.getElementById('helpBody').innerHTML).toContain('Keyboard');
    key('Escape');
    expect(openMenu().id).toBe('m-title');
  });

  it('changes and saves a setting with the arrow keys', () => {
    page.act('settings');
    expect(openMenu().id).toBe('m-settings');
    const rows = [...document.querySelectorAll('.setrow')];
    page.menus.state.selected = rows.findIndex((row) => row.dataset.k === 'difficulty');
    key('ArrowRight');
    expect(page.game.settings.difficulty).toBe(2);
    expect(page.saveSettings).toHaveBeenCalledWith(page.game.settings);
    expect(document.querySelector('[data-k="difficulty"] .val').textContent).toBe('Hard');
  });

  it('asks which Shade to play, then starts the run with the one picked', () => {
    key('Enter');
    expect(openMenu().id).toBe('m-heroes');
    const cards = [...document.querySelectorAll('.hero-card')];
    expect(cards.map((card) => card.dataset.hero)).toEqual(['moss', 'firefly', 'antler', 'blue']);
    expect(document.querySelector('.hero-card.picked').dataset.hero).toBe('moss');
    expect(cards[1].getAttribute('style')).toContain('heroes/firefly/arsenal/hero_idle.png');
    expect(cards.map((card) => card.querySelectorAll('.hero-kit')[1].textContent)).toEqual([
      'Ult Thornwood Requiem',
      'Ult Swarm Nova',
      'Ult Spirit Stampede',
      'Ult Absolute Zero',
    ]);
    expect(cards[3].querySelector('.hero-kit').textContent).toBe('Style Frost Iai');
    key('ArrowRight');
    expect(selected().dataset.hero).toBe('firefly');
    key('Enter');
    expect(page.game.settings.hero).toBe('firefly');
    expect(page.saveSettings).toHaveBeenCalledWith(page.game.settings);
    expect(page.game.mode).toBe('play');
  });

  it('goes back from the hero list to the title', () => {
    page.act('play');
    key('Escape');
    expect(openMenu().id).toBe('m-title');
    expect(page.game.mode).toBe('title');
  });

  it('hides the menus in play, pauses with Escape and resumes with Enter', () => {
    page.act('hero-moss');
    page.menus.sync();
    expect(openMenu()).toBeNull();
    expect(document.getElementById('touch').classList.contains('live')).toBe(true);
    key('Escape');
    tick(page.game);
    page.menus.sync();
    expect(page.game.mode).toBe('pause');
    expect(openMenu().id).toBe('m-pause');
    key('Enter');
    expect(page.game.mode).toBe('play');
  });

  it('shows the score and continues after a defeat', () => {
    page.act('hero-moss');
    page.game.score = 4200;
    page.game.mode = 'over';
    page.menus.sync();
    expect(document.getElementById('overNote').textContent).toContain('4200');
    key('Enter');
    expect(page.game.mode).toBe('play');
    expect(page.game.continues).toBe(1);
  });
});
