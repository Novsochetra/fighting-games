// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TouchStick } from '../../../src/input/touch-stick.js';
import { openMenu, openPage, selected } from '../../support/menu-page.js';

// happy-dom lays nothing out, so the editor's copy of the touch layer and its controls get the rects
// of an 800x400 screen, where each original control stands at [centre x, centre y, size]
const LAYER = { left: 0, top: 0, width: 800, height: 400 };
const ORIGINAL = {
  light: [720, 320, 96],
  heavy: [620, 340, 78],
  jump: [740, 200, 76],
  dash: [640, 210, 62],
  ult: [560, 250, 56],
  stick: [90, 300, 128],
};

function stubRect(element) {
  if (element.classList.contains('layout-preview')) {
    return LAYER;
  }
  const spot = element.closest('#m-layout') && ORIGINAL[element.dataset.control];
  if (!spot) {
    return { left: 0, top: 0, width: 0, height: 0 };
  }
  const [x, y, size] = spot;
  return { left: x - size / 2, top: y - size / 2, width: size, height: size };
}

const copy = (control) => document.querySelector(`#m-layout [data-control="${control}"]`);
const real = (action) => document.querySelector(`#touch .tb[data-action="${action}"]`);
const tool = (name) => document.querySelector(`#m-layout [data-edit="${name}"]`);
const cancel = () => document.querySelector('#m-layout [data-act="back"]:not([data-edit])');
const toolbarText = () =>
  ['.layout-name', '.layout-size'].map((part) => document.querySelector(part).textContent);

function pointer(target, type, x, y) {
  target.dispatchEvent(
    new PointerEvent(type, { bubbles: true, pointerId: 7, clientX: x, clientY: y }),
  );
}

function drag(action, to) {
  const [x, y] = ORIGINAL[action];
  pointer(copy(action), 'pointerdown', x, y);
  pointer(copy(action), 'pointermove', (x + to.x) / 2, (y + to.y) / 2);
  pointer(copy(action), 'pointermove', to.x, to.y);
  pointer(copy(action), 'pointerup', to.x, to.y);
}

// the page reads which way the phone is held from the app's size
function holdPhone(width, height) {
  const app = document.getElementById('app');
  Object.defineProperties(app, {
    clientWidth: { value: width, configurable: true },
    clientHeight: { value: height, configurable: true },
  });
  window.dispatchEvent(new Event('resize'));
}

// the real stick rests on every fit, as main.js has it
function installStick(page) {
  const byId = (id) => document.getElementById(id);
  const elements = { zone: byId('stickZone'), base: byId('stickBase'), knob: byId('stickKnob') };
  const stick = new TouchStick({ elements, game: page.game, layout: page.layout });
  page.layout.onFit = () => stick.rest();
  return elements;
}

function tap(action) {
  const [x, y] = ORIGINAL[action];
  pointer(copy(action), 'pointerdown', x, y);
  pointer(copy(action), 'pointerup', x, y);
}

describe('the button layout editor on the real page', () => {
  let page;
  beforeEach(() => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function rect() {
      return stubRect(this);
    });
    page = openPage();
    page.game.device.coarsePointer = true;
  });
  afterEach(() => vi.restoreAllMocks());

  function openEditor() {
    page.act('settings');
    document.querySelector('[data-k="buttonLayout"] [data-act="layout"]').click();
    expect(openMenu().id).toBe('m-layout');
  }

  it('is a Settings row only while touch controls are on', () => {
    page.game.device.coarsePointer = false;
    page.act('settings');
    expect(document.querySelector('[data-k="buttonLayout"]')).toBeNull();
    page.act('back');
    page.game.device.coarsePointer = true;
    page.act('settings');
    expect(document.querySelector('[data-k="buttonLayout"] .val').textContent).toBe('Default');
  });

  it('opens from the row with Enter, starts on Done and goes back with Escape', () => {
    page.act('settings');
    const rows = [...document.querySelectorAll('.setrow')];
    page.menus.state.selected = rows.findIndex((row) => row.dataset.k === 'buttonLayout');
    page.key('Enter');
    expect(openMenu().id).toBe('m-layout');
    expect(selected().textContent).toBe('Done');
    page.key('ArrowLeft');
    expect(selected().textContent).toBe('Cancel');
    page.key('ArrowRight');
    page.key('ArrowRight');
    expect(selected().textContent).toBe('ATTACK');
    page.key('Enter');
    expect(toolbarText()).toEqual(['HEAVY', '100%']);
    expect(copy('heavy').classList.contains('picked')).toBe(true);
    page.key('Escape');
    expect(openMenu().id).toBe('m-settings');
    expect(page.saveSettings).not.toHaveBeenCalled();
  });

  it('moves and resizes buttons in a draft and puts the real ones there on Done', () => {
    openEditor();
    expect(toolbarText()).toEqual(['ATTACK', '100%']);
    expect(tool('reset').disabled).toBe(true);
    drag('light', { x: 100, y: 300 });
    tap('jump');
    expect(toolbarText()).toEqual(['JUMP', '100%']);
    tool('bigger').click();
    tool('bigger').click();
    expect(toolbarText()).toEqual(['JUMP', '120%']);
    expect(copy('jump').classList.contains('picked')).toBe(true);
    expect(copy('light').style.getPropertyValue('--tb-x')).toBe('0.125');
    expect(real('light').style.getPropertyValue('--tb-x')).toBe('');
    expect(page.saveSettings).not.toHaveBeenCalled();
    tool('done').click();
    expect(openMenu().id).toBe('m-settings');
    const { buttonLayout } = page.game.settings;
    expect(page.saveSettings).toHaveBeenCalledWith(page.game.settings);
    expect(buttonLayout.portrait).toBeNull();
    expect(buttonLayout.landscape).toEqual({
      light: { x: 0.125, y: 0.75, size: 1 },
      jump: { x: 0.925, y: 0.5, size: 1.2 },
      heavy: { x: 0.775, y: 0.85, size: 1 },
      dash: { x: 0.8, y: 0.525, size: 1 },
      ult: { x: 0.7, y: 0.625, size: 1 },
      stick: { x: 0.1125, y: 0.75, size: 1 },
    });
    expect(document.querySelector('#touch .btns').classList.contains('custom')).toBe(true);
    expect(real('light').style.getPropertyValue('--tb-x')).toBe('0.125');
    expect(real('jump').style.getPropertyValue('--tb-size')).toBe('1.2');
    expect(document.querySelector('[data-k="buttonLayout"] .val').textContent).toBe('Custom');
  });

  it('leaves the settings untouched on Cancel', () => {
    openEditor();
    drag('heavy', { x: 300, y: 200 });
    tool('smaller').click();
    cancel().click();
    expect(openMenu().id).toBe('m-settings');
    expect(page.game.settings.buttonLayout).toBeNull();
    expect(page.saveSettings).not.toHaveBeenCalled();
    expect(document.querySelector('#touch .btns').classList.contains('custom')).toBe(false);
    openEditor();
    expect(copy('heavy').style.getPropertyValue('--tb-x')).toBe('');
  });

  it('keeps a layout for each orientation, and Reset brings one back to the original', () => {
    openEditor();
    drag('ult', { x: 400, y: 100 });
    tool('done').click();
    holdPhone(390, 844);
    expect(document.querySelector('#touch .btns').classList.contains('custom')).toBe(false);
    document.querySelector('[data-k="buttonLayout"] [data-act="layout"]').click();
    drag('dash', { x: 80, y: 300 });
    tool('done').click();
    expect(page.game.settings.buttonLayout.portrait.dash).toMatchObject({ x: 0.1, y: 0.75 });
    expect(page.game.settings.buttonLayout.landscape.ult).toMatchObject({ x: 0.5, y: 0.25 });
    expect(real('dash').style.getPropertyValue('--tb-x')).toBe('0.1');
    document.querySelector('[data-k="buttonLayout"] [data-act="layout"]').click();
    expect(document.querySelector('#m-layout .btns').classList.contains('custom')).toBe(true);
    tool('reset').click();
    expect(document.querySelector('#m-layout .btns').classList.contains('custom')).toBe(false);
    tool('done').click();
    expect(page.game.settings.buttonLayout).toMatchObject({ portrait: null });
    expect(page.game.settings.buttonLayout.landscape.ult).toMatchObject({ x: 0.5 });
    expect(real('dash').style.getPropertyValue('--tb-x')).toBe('');
    holdPhone(844, 390);
    document.querySelector('[data-k="buttonLayout"] [data-act="layout"]').click();
    tool('reset').click();
    tool('done').click();
    expect(page.game.settings.buttonLayout).toBeNull();
    expect(page.saveSettings).toHaveBeenLastCalledWith(
      expect.objectContaining({ buttonLayout: null }),
    );
    expect(document.querySelector('[data-k="buttonLayout"] .val').textContent).toBe('Default');
  });

  it('moves and resizes the stick, and the real one rests there inside its zone', () => {
    const { zone, base } = installStick(page);
    holdPhone(800, 400);
    openEditor();
    drag('stick', { x: 680, y: 280 });
    expect(toolbarText()).toEqual(['STICK', '100%']);
    expect(copy('stick').classList.contains('picked')).toBe(true);
    tool('bigger').click();
    tool('bigger').click();
    expect(toolbarText()).toEqual(['STICK', '120%']);
    expect(copy('stick').style.getPropertyValue('--stick-size')).toBe('1.2');
    expect(base.style.getPropertyValue('--stick-size')).toBe('');
    tool('done').click();
    expect(page.game.settings.buttonLayout.landscape.stick).toEqual({ x: 0.85, y: 0.7, size: 1.2 });
    expect(base.style.getPropertyValue('--stick-size')).toBe('1.2');
    // the stick stands on the right, so its zone is the right half and the base rests inside it
    expect([zone.style.left, zone.style.width]).toEqual(['400px', '400px']);
    expect([base.style.left, base.style.top]).toEqual(['280px', '280px']);
    document.querySelector('[data-k="buttonLayout"] [data-act="layout"]').click();
    expect(document.querySelector('#m-layout .btns').classList.contains('custom')).toBe(true);
    tool('reset').click();
    tool('done').click();
    expect(page.game.settings.buttonLayout).toBeNull();
    expect(base.style.getPropertyValue('--stick-size')).toBe('');
    expect([zone.style.left, zone.style.width]).toEqual(['', '']);
  });

  it('leaves a hidden stick out of the editor', () => {
    page.game.settings.stick = 'hidden';
    openEditor();
    const names = [];
    for (let i = 0; i < 6; i++) {
      names.push(document.querySelector('.layout-name').textContent);
      tool('next').click();
    }
    expect(names).toEqual(['ATTACK', 'HEAVY', 'JUMP', 'DASH', 'ULT', 'ATTACK']);
  });
});
