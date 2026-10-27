// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { openMenu, openPage } from '../../support/menu-page.js';

const backdrop = () => {
  const { scene, dim } = document.getElementById('menus').dataset;
  return { scene, dim };
};
const title = () => document.getElementById('m-title');

describe('moving between the menus', () => {
  let page;
  beforeEach(() => {
    page = openPage();
  });

  it('drops the logo in when the title first comes up', () => {
    expect(title().classList.contains('enter')).toBe(true);
    expect(backdrop()).toEqual({ scene: 'on', dim: 'none' });
  });

  it('keeps the painting up behind Settings, then fades the title back without dropping it in', () => {
    page.act('settings');
    expect(openMenu().id).toBe('m-settings');
    expect(backdrop()).toEqual({ scene: 'on', dim: 'panel' });
    expect(title().classList.contains('enter')).toBe(false);
    page.act('back');
    expect(openMenu().id).toBe('m-title');
    expect(title().classList.contains('enter')).toBe(false);
    expect(backdrop()).toEqual({ scene: 'on', dim: 'none' });
  });

  it('keeps the painting up from the title into the hero select', () => {
    page.act('play');
    expect(openMenu().id).toBe('m-heroes');
    expect(backdrop()).toEqual({ scene: 'on', dim: 'none' });
  });

  it('clears the backdrop for play and dims the game for the pause menu', () => {
    page.game.mode = 'play';
    page.menus.sync();
    expect(openMenu()).toBeNull();
    expect(backdrop()).toEqual({ scene: 'off', dim: 'none' });
    page.game.mode = 'pause';
    page.menus.sync();
    expect(openMenu().id).toBe('m-pause');
    expect(openMenu().classList.contains('enter')).toBe(true);
    expect(backdrop()).toEqual({ scene: 'off', dim: 'menu' });
    page.act('settings');
    expect(backdrop()).toEqual({ scene: 'off', dim: 'panel' });
  });

  it('opens only one menu at a time', () => {
    page.act('help');
    expect(document.querySelectorAll('#menus .menu.open')).toHaveLength(1);
    expect(document.querySelectorAll('#menus .menu.enter')).toHaveLength(0);
  });

  it('brings the clear menu in once the credits give way to it, and only fades it back after', () => {
    const clear = () => document.getElementById('m-clear');

    page.game.mode = 'clear';
    page.menus.sync();

    expect(openMenu().id).toBe('m-credits');

    page.act('back');

    expect(openMenu()).toBe(clear());
    expect(clear().classList.contains('enter')).toBe(true);

    page.act('leaderboard');
    page.act('back');

    expect(openMenu()).toBe(clear());
    expect(clear().classList.contains('enter')).toBe(false);
  });
});
