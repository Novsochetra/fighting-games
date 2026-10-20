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

function openPage(records) {
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
  return { game, menus, act, saveSettings, key, ui };
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

  it('lets a phone hide its joystick, and its touch controls step aside for a gamepad', () => {
    const classes = document.body.classList;
    page.game.device.coarsePointer = true;
    page.act('settings');
    page.menus.changeSetting('stick', 1, false);
    page.menus.changeSetting('stick', 1, false);
    expect(page.game.settings.stick).toBe('hidden');
    expect(page.saveSettings).toHaveBeenLastCalledWith(page.game.settings);
    expect(classes.contains('stick-hidden')).toBe(true);
    expect(classes.contains('touch-on')).toBe(true);
    page.ui.noteInput('pad');
    expect(classes.contains('touch-on')).toBe(false);
    page.ui.noteInput('touch');
    expect(classes.contains('touch-on')).toBe(true);
    page.menus.changeSetting('padHidesTouch', -1, false);
    page.ui.noteInput('pad');
    expect(classes.contains('touch-on')).toBe(true);
  });

  it('keeps Missions off the title until a mission has been beaten', () => {
    expect(document.getElementById('missionsBtn').hidden).toBe(true);
    key('ArrowDown');
    expect(selected().textContent).toBe('How to play');
  });

  it('lists the missions reached so far and starts the one picked', () => {
    page = openPage({ bestMission: 3 });
    expect(document.getElementById('missionsBtn').hidden).toBe(false);
    page.key('ArrowDown');
    page.key('Enter');
    expect(openMenu().id).toBe('m-missions');
    const cards = [...document.querySelectorAll('.mission-card')];
    expect(cards.map((card) => card.querySelector('.mission-name').textContent)).toEqual([
      'Pine Ridge',
      'Old Grove',
      'Bamboo Pass',
    ]);
    page.key('ArrowDown');
    page.key('ArrowDown');
    expect(selected().dataset.act).toBe('mission-2');
    page.key('Enter');
    expect(openMenu().id).toBe('m-heroes');
    expect(page.game.missionIndex).toBe(2);
    page.act('hero-moss');
    expect(page.game.mode).toBe('play');
    expect(page.game.banner).toMatchObject({ text: 'Mission 3', sub: 'Bamboo Pass' });
  });

  it('always starts Play from the first mission', () => {
    page = openPage({ bestMission: 5 });
    page.act('missions');
    page.act('mission-4');
    page.key('Escape');
    page.key('Escape');
    expect(openMenu().id).toBe('m-title');
    page.act('play');
    expect(page.game.missionIndex).toBe(0);
  });

  it('shows the score and continues after a defeat', () => {
    page.act('hero-moss');
    page.game.score = 4200;
    page.game.mode = 'over';
    page.menus.sync();
    expect(document.getElementById('overNote').textContent).toContain('4200');
    expect(document.getElementById('overNote').textContent).toContain('Mission 1');
    key('Enter');
    expect(openMenu().id).toBe('m-heroes');
    expect(openMenu().querySelector('h2').textContent).toBe('Continue as');
    expect(selected().dataset.hero).toBe('moss');
    key('Enter');
    expect(page.game.mode).toBe('play');
    expect(page.game.continues).toBe(1);
    expect(page.game.settings.hero).toBe('moss');
  });

  it('lets a fallen hero pick another Shade to continue as, or go back to the defeat menu', () => {
    page.act('hero-moss');
    page.game.mode = 'over';
    page.menus.sync();
    page.act('continue');
    key('Escape');
    expect(openMenu().id).toBe('m-over');
    expect(page.game.mode).toBe('over');
    page.act('continue');
    key('ArrowRight');
    key('ArrowRight');
    expect(selected().dataset.hero).toBe('antler');
    key('Enter');
    expect(page.game.mode).toBe('play');
    expect(page.game.settings.hero).toBe('antler');
    expect(page.saveSettings).toHaveBeenLastCalledWith(page.game.settings);
    expect(page.game.missionIndex).toBe(0);
  });

  it('highlights the Shade played last when the list opens from the title', () => {
    page.game.settings.hero = 'blue';
    key('Enter');
    expect(openMenu().querySelector('h2').textContent).toBe('Choose your Shade');
    expect(selected().dataset.hero).toBe('blue');
  });
});
