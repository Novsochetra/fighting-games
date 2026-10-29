// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { openMenu, openPage } from '../../support/menu-page.js';
import {
  cancel,
  copy,
  drag,
  holdPhone,
  placed,
  press,
  real,
  realStick,
  screen,
  skinButton,
  stubRect,
  tool,
  toolbarText,
} from '../../support/skin-screen.js';

describe('saving the controls laid out on the Skins screen of the real page', () => {
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

  it('moves and resizes controls in a draft, and puts the real ones there on Use', () => {
    openSkins();
    expect(skinButton('reset').disabled).toBe(true);
    drag('light', { x: 100, y: 300 });
    press('jump');
    tool('bigger').click();
    tool('bigger').click();
    expect(toolbarText()).toEqual(['JUMP', '120%']);
    expect(copy('light').style.getPropertyValue('--pad-x')).toBe('0.125');
    expect(real('light').style.getPropertyValue('--pad-x')).toBe('');
    tool('done').click();
    expect(skinButton('reset').disabled).toBe(false);
    expect(page.saveSettings).not.toHaveBeenCalled();

    skinButton('use').click();
    expect(openMenu().id).toBe('m-section');
    const { classic } = page.game.settings.buttonLayout;
    expect(page.saveSettings).toHaveBeenCalledWith(page.game.settings);
    expect(classic.portrait).toBeNull();
    expect(classic.landscape).toEqual({
      light: { x: 0.125, y: 0.75, size: 1 },
      jump: { x: 0.925, y: 0.5, size: 1.2 },
      heavy: { x: 0.775, y: 0.85, size: 1 },
      dash: { x: 0.8, y: 0.525, size: 1 },
      ult: { x: 0.7, y: 0.625, size: 1 },
      stick: { x: 0.1125, y: 0.75, size: 1 },
    });
    expect(placed(document.getElementById('touch'))).toBe(true);
    expect(real('light').style.getPropertyValue('--pad-x')).toBe('0.125');
    expect(real('jump').style.getPropertyValue('--pad-size')).toBe('1.2');
  });

  it('drops every move and resize on Cancel', () => {
    openSkins();
    drag('heavy', { x: 300, y: 200 });
    tool('smaller').click();
    tool('done').click();
    cancel().click();
    expect(openMenu().id).toBe('m-section');
    expect(page.game.settings.buttonLayout).toBeNull();
    expect(page.saveSettings).not.toHaveBeenCalled();
    expect(placed(document.getElementById('touch'))).toBe(false);
    reopen();
    expect(copy('heavy').style.getPropertyValue('--pad-x')).toBe('');
  });

  it('keeps a layout for each way the phone is held, and Reset brings the one held back', () => {
    openSkins();
    drag('ult', { x: 400, y: 100 });
    holdPhone(390, 844);
    expect(placed(screen())).toBe(false);
    drag('dash', { x: 80, y: 300 });
    tool('done').click();
    skinButton('use').click();
    expect(page.game.settings.buttonLayout.classic.portrait.dash).toMatchObject({
      x: 0.1,
      y: 0.75,
    });
    expect(page.game.settings.buttonLayout.classic.landscape.ult).toMatchObject({
      x: 0.5,
      y: 0.25,
    });
    expect(real('dash').style.getPropertyValue('--pad-x')).toBe('0.1');

    reopen();
    expect(placed(screen())).toBe(true);
    skinButton('reset').click();
    expect(placed(screen())).toBe(false);
    expect(skinButton('reset').disabled).toBe(true);
    skinButton('use').click();
    expect(page.game.settings.buttonLayout.classic).toMatchObject({ portrait: null });
    expect(page.game.settings.buttonLayout.classic.landscape.ult).toMatchObject({ x: 0.5 });
    expect(real('dash').style.getPropertyValue('--pad-x')).toBe('');

    holdPhone(844, 390);
    reopen();
    skinButton('reset').click();
    skinButton('use').click();
    expect(page.game.settings.buttonLayout).toBeNull();
    expect(page.saveSettings).toHaveBeenLastCalledWith(
      expect.objectContaining({ buttonLayout: null }),
    );
  });

  it('moves and resizes the stick, and the real one rests there inside its zone on Use', () => {
    const { zone, base } = realStick();
    holdPhone(800, 400);
    openSkins();
    drag('stick', { x: 680, y: 280 });
    expect(toolbarText()).toEqual(['STICK', '100%']);
    expect(copy('stick').classList.contains('picked')).toBe(true);
    tool('bigger').click();
    tool('bigger').click();
    expect(toolbarText()).toEqual(['STICK', '120%']);
    expect(copy('stick').style.getPropertyValue('--pad-size')).toBe('1.2');
    expect(base.style.getPropertyValue('--pad-size')).toBe('');
    tool('done').click();
    skinButton('use').click();
    expect(page.game.settings.buttonLayout.classic.landscape.stick).toEqual({
      x: 0.85,
      y: 0.7,
      size: 1.2,
    });
    expect(base.style.getPropertyValue('--pad-size')).toBe('1.2');
    // the stick stands on the right, so its zone is the right half and the base rests inside it
    expect([zone.style.left, zone.style.width]).toEqual(['400px', '400px']);
    expect([base.style.left, base.style.top]).toEqual(['280px', '280px']);

    reopen();
    expect(placed(screen())).toBe(true);
    skinButton('reset').click();
    skinButton('use').click();
    expect(page.game.settings.buttonLayout).toBeNull();
    expect(base.style.getPropertyValue('--pad-size')).toBe('');
    expect([zone.style.left, zone.style.width]).toEqual(['', '']);
  });

  it('leaves a hidden stick out of the editing', () => {
    page.game.settings.stick = 'hidden';
    openSkins();
    expect(copy('stick').hasAttribute('data-editable')).toBe(false);
    expect(page.menus.items()).not.toContain(copy('stick'));
    press('light');
    const names = [];
    for (let i = 0; i < 6; i++) {
      names.push(screen().querySelector('.layout-name').textContent);
      tool('next').click();
    }
    expect(names).toEqual(['ATTACK', 'HEAVY', 'JUMP', 'DASH', 'ULT', 'ATTACK']);
  });
});
