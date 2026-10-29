// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SKIN_IDS } from '../../../src/data/skins/skins.js';
import { openMenu, openPage } from '../../support/menu-page.js';

// happy-dom lays nothing out: the d-pad gets a 150px square with its centre at (140, 275), ATTACK
// a 92px one at (724, 298), and the editor's copy of the touch layer an 844x390 screen
const SPOTS = { dpad: [140, 275, 150], light: [724, 298, 92] };
const LAYER = { left: 0, top: 0, width: 844, height: 390 };

function stubRect(element) {
  if (element.classList.contains('layout-preview')) {
    return LAYER;
  }
  const spot = SPOTS[element.dataset.control];
  if (!spot) {
    return { left: 0, top: 0, width: 0, height: 0 };
  }
  const [x, y, size] = spot;
  return { left: x - size / 2, top: y - size / 2, width: size, height: size };
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

function pointer(target, type, [x, y]) {
  target.dispatchEvent(
    new PointerEvent(type, { bubbles: true, pointerId: 4, clientX: x, clientY: y }),
  );
}

const real = (control) => document.querySelector(`#touch [data-control="${control}"]`);
const copy = (control) => document.querySelector(`#m-layout [data-control="${control}"]`);
const shown = (control) => document.querySelector(`#m-skins [data-control="${control}"]`);
const row = (key) => document.querySelector(`[data-k="${key}"]`);
const skinName = () => document.querySelector('#m-skins .skin-name').textContent;

function step(key) {
  row(key).querySelector('[data-d="1"]').click();
}

function openSkins(page) {
  page.openSection('touch');
  row('skin').querySelector('[data-act="skins"]').click();
  expect(openMenu().id).toBe('m-skins');
}

describe('touch skins on the real page', () => {
  let page;

  beforeEach(() => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function rect() {
      return stubRect(this);
    });
    page = openPage();
    page.game.device.coarsePointer = true;
    holdPhone(844, 390);
  });

  afterEach(() => vi.restoreAllMocks());

  it('offers a Skin and layout row that opens the Skins screen, and the controls’ opacity, with touch on', () => {
    page.openSection('touch');
    expect(row('skin').querySelector('.val').textContent).toBe('Classic');
    expect(row('skin').querySelector('[data-act="skins"]').textContent).toBe('Edit');
    expect(row('padOpacity').querySelector('.val').textContent).toBe('100%');
    page.act('back');
    page.act('back');
    page.game.device.coarsePointer = false;
    page.openSection('touch');
    expect(row('skin')).toBeNull();
    expect(row('padOpacity')).toBeNull();
  });

  it('shows each skin on the screen before it is picked, and only Use picks it', () => {
    openSkins(page);
    expect(skinName()).toBe('Classic');
    expect(shown('stick')).not.toBeNull();
    // the keyboard and gamepad highlight starts on Use
    expect(page.menus.items()[page.menus.state.selected].textContent).toBe('Use');
    document.querySelector('#m-skins [data-skin-step="1"]').click();
    expect(skinName()).toBe('Dusk');
    expect(document.querySelector('#m-skins .skin-about').textContent).toContain('d-pad');
    expect(shown('stick')).toBeNull();
    expect(shown('dpad').className).toBe('pad-dpad dusk-dpad');
    // the skin looked at stands for real meanwhile, and Cancel puts the picked one back
    expect(real('dpad')).not.toBeNull();
    document.querySelector('#m-skins [data-act="back"]:not([data-skin])').click();
    expect(openMenu().id).toBe('m-section');
    expect(page.game.settings.skin).toBe('classic');
    expect(real('stick')).not.toBeNull();
    expect(page.saveSettings).not.toHaveBeenCalled();

    row('skin').querySelector('[data-act="skins"]').click();
    expect(skinName()).toBe('Classic');
    document.querySelector('#m-skins [data-skin-step="-1"]').click();
    expect(skinName()).toBe('Clear Smoke');
    document.querySelector('#m-skins [data-skin-step="1"]').click();
    document.querySelector('#m-skins [data-skin-step="1"]').click();
    document.querySelector('#m-skins [data-skin="use"]').click();
    expect(openMenu().id).toBe('m-section');
    expect(page.game.settings.skin).toBe('dusk');
    expect(page.saveSettings).toHaveBeenCalledWith(page.game.settings);
    expect(real('dpad')).not.toBeNull();
    expect(row('skin').querySelector('.val').textContent).toBe('Dusk');
  });

  it('steps with the arrow keys, shows the skin held the new way, and leaves with Escape', () => {
    openSkins(page);
    page.key('ArrowRight');
    expect(skinName()).toBe('Dusk');
    expect(shown('light').style.getPropertyValue('--pad-dx')).toBe('-100px');
    holdPhone(390, 844);
    expect(shown('light').style.getPropertyValue('--pad-dx')).toBe('-78px');
    page.key('ArrowLeft');
    expect(skinName()).toBe('Classic');
    page.key('Escape');
    expect(openMenu().id).toBe('m-section');
    expect(page.game.settings.skin).toBe('classic');
  });

  it('flips skins with a swipe across the screen, not with a short drag or one up the screen', () => {
    const section = document.getElementById('m-skins');
    const swipe = (from, to) => {
      pointer(section, 'pointerdown', from);
      pointer(section, 'pointerup', to);
    };

    openSkins(page);
    swipe([500, 250], [380, 260]);
    expect(skinName()).toBe('Dusk');
    swipe([300, 250], [320, 250]);
    swipe([300, 300], [250, 120]);
    expect(skinName()).toBe('Dusk');
    swipe([300, 250], [420, 240]);
    expect(skinName()).toBe('Classic');
    pointer(document.querySelector('#m-skins [data-skin="use"]'), 'pointerdown', [700, 40]);
    pointer(section, 'pointerup', [500, 40]);
    expect(skinName()).toBe('Classic');
  });

  it('marks which skin of how many with its dots, and slides each in from its side', () => {
    openSkins(page);
    const dots = () =>
      [...document.querySelectorAll('#m-skins .skin-dots i')].map((dot) => dot.className);
    const pad = () => document.querySelector('#m-skins .pad');

    const lit = () => dots().indexOf('on');

    expect(dots()).toHaveLength(SKIN_IDS.length);
    expect(dots().filter((dot) => dot === 'on')).toHaveLength(1);
    expect(lit()).toBe(0);
    expect(pad().className).toBe('pad');
    page.key('ArrowRight');
    expect(lit()).toBe(1);
    expect(pad().className).toBe('pad slide-a');
    expect(pad().style.getPropertyValue('--skin-slide-from')).toBe('32px');
    page.key('ArrowLeft');
    expect(pad().className).toBe('pad slide-b');
    expect(pad().style.getPropertyValue('--skin-slide-from')).toBe('-32px');
  });

  it('shows a skin where the player moved its controls', () => {
    const { light } = { light: { x: 0.5, y: 0.5, size: 1.2 } };
    page.game.settings.buttonLayout = {
      dusk: {
        landscape: { light, heavy: light, jump: light, dash: light, ult: light, dpad: light },
        portrait: null,
      },
    };
    openSkins(page);
    page.key('ArrowRight');
    expect(shown('light').style.getPropertyValue('--pad-x')).toBe('0.5');
    expect(shown('light').style.getPropertyValue('--pad-size')).toBe('1.2');
  });

  it('draws the skin picked both ways the phone is held, each its own layout', () => {
    page.game.settings.skin = 'dusk';
    page.layout.applyTouchSettings();
    expect(real('stick')).toBeNull();
    expect(real('light').className).toBe('pad-button dusk dusk-light');
    expect(real('light').style.getPropertyValue('--pad-dx')).toBe('-100px');
    holdPhone(390, 844);
    expect(real('light').style.getPropertyValue('--pad-dx')).toBe('-78px');
    expect(document.querySelector('#touch .pad-controls').classList.contains('pad-placed')).toBe(
      true,
    );
  });

  it('steers the fighter with the d-pad and fights with Dusk’s buttons', () => {
    page.game.settings.skin = 'dusk';
    page.layout.applyTouchSettings();
    const { held, pressed, autoAttack } = page.game.input;
    const holding = (...keys) => keys.filter((key) => held[key]);

    pointer(real('dpad'), 'pointerdown', [195, 275]);
    expect(holding('up', 'right', 'down', 'left')).toEqual(['right']);
    pointer(real('dpad'), 'pointermove', [195, 220]);
    expect(holding('up', 'right', 'down', 'left')).toEqual(['up', 'right']);
    pointer(real('dpad'), 'pointerup', [195, 220]);
    expect(holding('up', 'right', 'down', 'left')).toEqual([]);

    pointer(real('light'), 'pointerdown', [724, 298]);
    expect([pressed.light, held.light, autoAttack.on]).toEqual([true, true, true]);
    pointer(real('light'), 'pointerup', [724, 298]);
    expect([held.light, autoAttack.on]).toEqual([false, false]);
  });

  it('fades the controls to the opacity picked, but not the pause button', () => {
    page.openSection('touch');
    step('padOpacity');
    expect(page.game.settings.padOpacity).toBe(0.8);
    expect(document.documentElement.style.getPropertyValue('--pad-opacity')).toBe('0.8');
  });

  it('edits the layout of the skin looked at, not the one worn, and keeps it on Cancel', () => {
    openSkins(page);
    page.key('ArrowRight');
    expect(skinName()).toBe('Dusk');
    document.querySelector('#m-skins [data-act="layout"]').click();
    expect(openMenu().id).toBe('m-layout');
    expect(copy('stick')).toBeNull();
    pointer(copy('dpad'), 'pointerdown', SPOTS.dpad);
    pointer(copy('dpad'), 'pointerup', SPOTS.dpad);
    expect(document.querySelector('.layout-name').textContent).toBe('D-PAD');
    pointer(copy('light'), 'pointerdown', SPOTS.light);
    pointer(copy('light'), 'pointermove', [500, 200]);
    pointer(copy('light'), 'pointerup', [500, 200]);
    document.querySelector('#m-layout [data-edit="done"]').click();

    const { buttonLayout } = page.game.settings;
    expect(Object.keys(buttonLayout)).toEqual(['dusk']);
    expect(buttonLayout.dusk.landscape.light.x).toBeCloseTo(500 / 844, 3);
    expect(Object.keys(buttonLayout.dusk.landscape).sort()).toEqual([
      'dash',
      'dpad',
      'heavy',
      'jump',
      'light',
      'ult',
    ]);
    expect(real('light').style.getPropertyValue('--pad-dx')).toBe('');

    expect(openMenu().id).toBe('m-skins');
    expect(skinName()).toBe('Dusk');
    expect(Number(shown('light').style.getPropertyValue('--pad-x'))).toBeCloseTo(500 / 844, 3);
    document.querySelector('#m-skins [data-act="back"]:not([data-skin])').click();
    expect(page.game.settings.skin).toBe('classic');
    expect(page.game.settings.buttonLayout.dusk.landscape.light.x).toBeCloseTo(500 / 844, 3);
    expect(real('stick')).not.toBeNull();
  });

  it('tells a Dusk player to steer with the d-pad', () => {
    page.game.settings.skin = 'dusk';
    page.act('help');
    expect(document.getElementById('helpBody').textContent).toContain(
      'press left or right on the d-pad',
    );
  });
});
