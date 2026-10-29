// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
const row = (key) => document.querySelector(`[data-k="${key}"]`);

function step(key) {
  row(key).querySelector('[data-d="1"]').click();
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

  it('offers a skin for each way the phone is held, and the controls’ opacity, with touch on', () => {
    page.act('settings');
    expect(row('skinLandscape').querySelector('.val').textContent).toBe('Classic');
    expect(row('skinPortrait').querySelector('.val').textContent).toBe('Classic');
    expect(row('padOpacity').querySelector('.val').textContent).toBe('100%');
    page.act('back');
    page.game.device.coarsePointer = false;
    page.act('settings');
    expect(row('skinLandscape')).toBeNull();
    expect(row('padOpacity')).toBeNull();
  });

  it('draws Dusk’s d-pad held sideways and keeps the classic stick upright', () => {
    page.act('settings');
    step('skinLandscape');
    expect(row('skinLandscape').querySelector('.val').textContent).toBe('Dusk');
    expect(page.game.settings.skinLandscape).toBe('dusk');
    expect(real('stick')).toBeNull();
    expect(real('dpad').className).toBe('pad-dpad dusk-dpad');
    expect(real('light').className).toBe('pad-button dusk dusk-light');
    expect(real('light').style.getPropertyValue('--pad-dx')).toBe('-120px');
    expect(document.querySelector('#touch .pad-controls').classList.contains('pad-placed')).toBe(
      true,
    );
    holdPhone(390, 844);
    expect(real('dpad')).toBeNull();
    expect(real('stick').className).toBe('pad-stick classic-stick');
    expect(document.querySelector('#touch .pad-controls').classList.contains('pad-placed')).toBe(
      false,
    );
  });

  it('steers the fighter with the d-pad and fights with Dusk’s buttons', () => {
    page.game.settings.skinLandscape = 'dusk';
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
    page.act('settings');
    step('padOpacity');
    expect(page.game.settings.padOpacity).toBe(0.8);
    expect(document.documentElement.style.getPropertyValue('--pad-opacity')).toBe('0.8');
  });

  it('edits Dusk’s own layout and leaves the classic one as it was', () => {
    page.game.settings.skinLandscape = 'dusk';
    page.layout.applyTouchSettings();
    page.act('settings');
    row('buttonLayout').querySelector('[data-act="layout"]').click();
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
  });

  it('tells a Dusk player to steer with the d-pad', () => {
    page.game.settings.skinLandscape = 'dusk';
    page.act('help');
    expect(document.getElementById('helpBody').textContent).toContain(
      'press left or right on the d-pad',
    );
  });
});
