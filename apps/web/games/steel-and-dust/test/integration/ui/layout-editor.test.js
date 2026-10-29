// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { openMenu, openPage, selected } from '../../support/menu-page.js';
import {
  copy,
  drag,
  editing,
  press,
  screen,
  stubRect,
  tapBeside,
  tool,
  toolbarText,
} from '../../support/skin-screen.js';

describe('editing the controls on the Skins screen of the real page', () => {
  let page;
  beforeEach(() => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function rect() {
      return stubRect(this);
    });
    page = openPage();
    page.game.device.coarsePointer = true;
  });
  afterEach(() => vi.restoreAllMocks());

  function openSkins() {
    page.openSkins();
    expect(openMenu().id).toBe('m-skins');
  }

  const reopen = () => document.querySelector('[data-k="skin"] [data-act="skins"]').click();

  it('is reached from the Skin and layout row, which Settings offers while touch controls are on', () => {
    page.game.device.coarsePointer = false;
    page.openSection('touch');
    expect(document.querySelector('[data-k="skin"]')).toBeNull();
    page.act('back');
    page.act('back');
    page.game.device.coarsePointer = true;
    page.openSection('touch');
    expect(document.querySelector('[data-k="buttonLayout"]')).toBeNull();
    expect(document.querySelector('[data-k="skin"] .lbl').firstChild.textContent).toBe(
      'Skin and layout',
    );
    reopen();
    expect(openMenu().id).toBe('m-skins');
    expect(document.getElementById('m-layout')).toBeNull();
    expect(screen().querySelector('.skin-help').textContent).toBe(
      'Tap a control to move or resize it',
    );
  });

  it('picks a control pressed: rings it, steps the others back and holds its tools in the bar', () => {
    openSkins();
    expect(editing()).toBe(false);

    press('jump');
    expect(editing()).toBe(true);
    expect(copy('jump').classList.contains('picked')).toBe(true);
    expect(toolbarText()).toEqual(['JUMP', '100%']);
    expect(screen().querySelector('.edit-shape').hidden).toBe(true);
    expect(screen().querySelector('.skin-help').textContent).toBe(
      'Drag it to move it, and tap beside the controls when done',
    );

    press('light');
    expect(toolbarText()).toEqual(['ATTACK', '100%']);
    expect(copy('jump').classList.contains('picked')).toBe(false);

    tapBeside();
    expect(editing()).toBe(false);
    expect(screen().querySelector('.picked')).toBeNull();
    expect(screen().querySelector('.skin-name').textContent).toBe('Classic');
    expect(page.saveSettings).not.toHaveBeenCalled();
  });

  it('moves a control dragged at once, without a press to pick it first, and Done lets go', () => {
    openSkins();
    drag('light', { x: 100, y: 300 });
    expect(editing()).toBe(true);
    expect(toolbarText()).toEqual(['ATTACK', '100%']);
    expect(copy('light').style.getPropertyValue('--pad-x')).toBe('0.125');

    tool('done').click();
    expect(editing()).toBe(false);
    expect(copy('light').style.getPropertyValue('--pad-x')).toBe('0.125');
  });

  it('reaches the controls and their tools with the keys, and Back lets go before it leaves', () => {
    openSkins();
    const highlighted = () => page.menus.items()[page.menus.state.selected];
    expect(highlighted().dataset.skin).toBe('use');

    page.menus.state.selected = page.menus.items().indexOf(copy('light'));
    page.key('Enter');
    expect(editing()).toBe(true);
    expect(selected().textContent).toBe('Done');
    page.key('ArrowLeft');
    expect(selected().dataset.edit).toBe('bigger');
    page.key('Enter');
    expect(toolbarText()).toEqual(['ATTACK', '110%']);
    page.key('ArrowLeft');
    page.key('ArrowLeft');
    expect(selected().dataset.edit).toBe('next');
    page.key('Enter');
    expect(toolbarText()).toEqual(['HEAVY', '100%']);
    expect(selected().dataset.edit).toBe('next');

    page.key('Escape');
    expect(openMenu().id).toBe('m-skins');
    expect(editing()).toBe(false);
    expect(highlighted().dataset.control).toBe('heavy');
    page.key('Escape');
    expect(openMenu().id).toBe('m-section');
    expect(page.saveSettings).not.toHaveBeenCalled();
  });
});
