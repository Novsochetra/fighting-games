// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { openMenu, openPage } from '../../support/menu-page.js';

// the page reads which way the phone is held from the app's size; happy-dom lays nothing out
function holdPhone(width, height) {
  const app = document.getElementById('app');
  Object.defineProperties(app, {
    clientWidth: { value: width, configurable: true },
    clientHeight: { value: height, configurable: true },
  });
  window.dispatchEvent(new Event('resize'));
}

function stage() {
  const { left, top, width, height } = document.getElementById('stage').style;

  return [left, top, width, height].map(parseFloat);
}

const shellOf = (root) => root.querySelector('.pad-shell');
const realShell = () => shellOf(document.getElementById('shell'));
const row = (key) => document.querySelector(`[data-k="${key}"]`);
const skinName = () => document.querySelector('#m-skins .skin-name').textContent;

describe('a skin with a shell on the real page', () => {
  let page;

  beforeEach(() => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      right: 0,
      bottom: 0,
    });
    page = openPage();
    page.game.device.coarsePointer = true;
    holdPhone(844, 390);
  });

  afterEach(() => vi.restoreAllMocks());

  function wear(skin) {
    page.game.settings.skin = skin;
    page.layout.applyTouchSettings();
  }

  it('frames the game between its panels held sideways, the pause in the HUD over it', () => {
    wear('clear-jade');
    const [left, , width] = stage();

    expect(left).toBeGreaterThanOrEqual(170);
    expect(left + width).toBeLessThanOrEqual(844 - 170);
    expect(realShell().className).toBe('pad-shell clear clear-jade');
    expect(document.getElementById('shell').style.getPropertyValue('--pad-screen-x')).toBe(
      `${left}px`,
    );
    expect(document.getElementById('app').classList.contains('pause-in-hud')).toBe(true);
    expect(document.querySelector('#touch [data-control="light"]').className).toContain(
      'clear-jade',
    );
    expect(document.querySelector('#touch .pad-controls').classList.contains('pad-safe')).toBe(
      true,
    );
  });

  it.each(['sandstone', 'retro'])(
    'lays the %s pixel shell round the game, either way held',
    (skin) => {
      wear(skin);
      const [left, , width] = stage();

      expect(left).toBeGreaterThanOrEqual(170);
      expect(left + width).toBeLessThanOrEqual(844 - 170);
      expect(realShell().className).toBe(`pad-shell pixel ${skin}`);
      expect(document.querySelector('#touch [data-control="light"]').className).toBe(
        `pad-button pixel-button pixel-light ${skin}`,
      );
      expect(document.querySelector('#touch [data-control="dpad"]').className).toContain(
        `pixel-dpad ${skin}`,
      );
      holdPhone(390, 844);
      expect(stage()).toEqual([14, 16, 362, 203]);
      expect(realShell().querySelector('.pad-bezel')).not.toBeNull();
    },
  );

  it('stands the game at the top of the shell held upright', () => {
    wear('clear-ember');
    holdPhone(390, 844);

    expect(stage()).toEqual([14, 16, 362, 203]);
  });

  it('widens its panels with the Button size, as its controls grow', () => {
    wear('clear-mekong');
    const [, , width] = stage();
    page.game.settings.buttonSize = 2;
    page.layout.applyTouchSettings();

    expect(stage()[2]).toBeLessThan(width);
  });

  it('lets the game fill the screen again for a skin without a shell, or without touch controls', () => {
    wear('clear-lotus');
    wear('classic');
    const letterboxed = stage();

    expect(letterboxed[0]).toBeLessThan(170);
    expect(realShell()).toBeNull();
    wear('clear-lotus');
    page.game.device.coarsePointer = false;
    page.layout.applyTouchSettings();
    expect(stage()).toEqual(letterboxed);
  });

  it('moves the game into a shell looked at on the Skins screen, and back on Cancel', () => {
    const letterboxed = stage();

    page.act('settings');
    row('skin').querySelector('[data-act="skins"]').click();
    while (skinName() !== 'Clear Lotus') {
      document.querySelector('#m-skins [data-skin-step="1"]').click();
    }

    expect(stage()[0]).toBeGreaterThanOrEqual(170);
    expect(shellOf(document.querySelector('#m-skins .skin-shell')).className).toBe(
      'pad-shell clear clear-lotus',
    );
    document.querySelector('#m-skins [data-act="back"]:not([data-skin])').click();
    expect(openMenu().id).toBe('m-settings');
    expect(page.game.settings.skin).toBe('classic');
    expect(stage()).toEqual(letterboxed);
    expect(realShell()).toBeNull();
  });

  it('shows the shell under the controls in the Button layout editor', () => {
    wear('clear-smoke');
    page.act('settings');
    row('buttonLayout').querySelector('[data-act="layout"]').click();

    expect(shellOf(document.querySelector('#m-layout .layout-shell')).className).toBe(
      'pad-shell clear clear-smoke',
    );
  });
});
