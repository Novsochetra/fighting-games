// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { tick } from '../../../src/sim/tick.js';
import { enterNextMission, selectMission } from '../../../src/sim/stage/flow.js';
import { openMenu, openPage, selected } from '../../support/menu-page.js';

const visibleButtons = () =>
  [...openMenu().querySelectorAll('.mbtn')]
    .filter((button) => !button.hidden)
    .map((button) => button.textContent.trim());

// the hero goes down and stays down until the defeat menu comes up
function fall(game) {
  Object.assign(game.player, { hp: 0, state: 'ko', stateTime: 80, airborne: false });
  tick(game);
}

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

  it('asks which hero to play, then starts the run with the one picked', () => {
    key('Enter');
    expect(openMenu().id).toBe('m-heroes');
    const cards = [...document.querySelectorAll('.hero-card')];
    expect(cards.map((card) => card.dataset.hero)).toEqual([
      'moss',
      'firefly',
      'antler',
      'blue',
      'ember',
      'bokator',
      'angkor',
    ]);
    expect(document.querySelector('.hero-card.picked').dataset.hero).toBe('moss');
    expect(cards[1].getAttribute('style')).toContain('heroes/firefly/arsenal/hero_idle.png');
    expect(cards.map((card) => card.textContent.trim())).toEqual([
      'Moss Shade',
      'Firefly Shade',
      'Antler Spirit Shade',
      'Blue Shade',
      'Ember Shade',
      'Bokator',
      'Angkor Warrior',
    ]);
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

  it('has no mission list: Play always starts a run at the first mission', () => {
    expect(document.querySelector('[data-act="missions"]')).toBeNull();
    expect(document.getElementById('m-missions')).toBeNull();
    selectMission(page.game, 6);
    page.act('play');
    expect(openMenu().id).toBe('m-heroes');
    page.act('hero-moss');
    expect(page.game.mode).toBe('play');
    expect(page.game.banner).toMatchObject({ text: 'Mission 1', sub: 'Pine Ridge' });
  });

  it('shows the score and the lives left after a fall, and continues', () => {
    page.act('hero-moss');
    page.game.score = 4200;
    fall(page.game);
    page.menus.sync();
    expect(document.getElementById('overTitle').textContent).toBe('You fell');
    expect(document.getElementById('overNote').textContent).toContain('4200');
    expect(document.getElementById('overNote').textContent).toContain('Mission 1');
    expect(document.getElementById('overNote').textContent).toContain('lives left 4');
    expect(visibleButtons()).toEqual(['Continue', 'Restart mission', 'Quit to title']);
    key('Enter');
    expect(openMenu().id).toBe('m-heroes');
    expect(openMenu().querySelector('h2').textContent).toBe('Continue as');
    expect(selected().dataset.hero).toBe('moss');
    key('Enter');
    expect(page.game.mode).toBe('play');
    expect(page.game.continues).toBe(1);
    expect(page.game.settings.hero).toBe('moss');
  });

  it('ends the run after the last life and starts over from the first mission', () => {
    page.act('hero-moss');
    enterNextMission(page.game);
    enterNextMission(page.game);
    Object.assign(page.game, { lives: 1, score: 900 });
    fall(page.game);
    page.menus.sync();
    expect(openMenu().id).toBe('m-over');
    expect(document.getElementById('overTitle').textContent).toBe('Game over');
    expect(document.getElementById('overNote').textContent).toContain('Mission 3');
    expect(document.getElementById('overNote').textContent).toContain('no lives left');
    expect(visibleButtons()).toEqual(['Start from mission 1', 'Quit to title']);
    key('Enter');
    expect(page.game).toMatchObject({ mode: 'play', missionIndex: 0, lives: 5, score: 0 });
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
    expect(openMenu().querySelector('h2').textContent).toBe('Choose your hero');
    expect(selected().dataset.hero).toBe('blue');
  });
});
