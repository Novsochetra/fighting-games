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

const KEYS = ['light', 'heavy', 'jump', 'dash', 'ult'];
const row = (key) => document.querySelector(`[data-k="${key}"]`);
const screen = () => document.getElementById('m-skins');
const preview = () => screen().querySelector('.skin-preview');
const shapes = () => screen().querySelector('.edit-shape');
const editing = () => screen().classList.contains('editing');
const shapeOf = (root, control) =>
  root.querySelector(`[data-control="${control}"]`).classList.contains('clear-pill')
    ? 'pill'
    : 'round';
const played = (control) => shapeOf(document.getElementById('touch'), control);
const previewed = (control) => shapeOf(preview(), control);
const tapKey = (control) => preview().querySelector(`[data-control="${control}"]`).click();
const choose = (shape) => shapes().querySelector(`[data-key-shape="${shape}"]`).click();
const done = () => screen().querySelector('[data-edit="done"]').click();
const lit = () => shapes().querySelector('[aria-pressed="true"]').dataset.keyShape;

function pointer(target, type, [x, y]) {
  target.dispatchEvent(
    new PointerEvent(type, { bubbles: true, pointerId: 3, clientX: x, clientY: y }),
  );
}

describe("a skin's keys, round or pill, picked key by key on the real page", () => {
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

  function openSkins(skin) {
    page.game.settings.skin = skin;
    page.layout.applyTouchSettings();
    page.openSkins();
    expect(openMenu().id).toBe('m-skins');
  }

  it('makes a key edited a pill from its tools, and that key alone as it plays', () => {
    openSkins('clear-lotus');
    expect(['dash', 'ult'].map(played)).toEqual(['round', 'round']);

    tapKey('dash');

    expect(editing()).toBe(true);
    expect(shapes().hidden).toBe(false);
    expect(lit()).toBe('round');

    choose('pill');

    expect(editing()).toBe(true);
    expect(lit()).toBe('pill');
    expect([played('dash'), played('ult'), previewed('dash')]).toEqual(['pill', 'round', 'pill']);
    expect(page.game.settings.keyShapes).toEqual({});

    choose('round');
    expect(played('dash')).toBe('round');
  });

  it('keeps the shapes picked only on Use, and none on Cancel', () => {
    openSkins('clear-jade');
    tapKey('ult');
    choose('pill');
    done();
    screen().querySelector('[data-act="back"]:not([data-skin])').click();
    expect(played('ult')).toBe('round');
    expect(page.game.settings.keyShapes).toEqual({});

    row('skin').querySelector('[data-act="skins"]').click();
    tapKey('ult');
    choose('pill');
    done();
    screen().querySelector('[data-skin="use"]').click();

    expect(page.game.settings.keyShapes).toEqual({ ult: 'pill' });
    expect(page.saveSettings).toHaveBeenLastCalledWith(
      expect.objectContaining({ skin: 'clear-jade', keyShapes: { ult: 'pill' } }),
    );
    expect([played('dash'), played('ult')]).toEqual(['round', 'pill']);
  });

  it('offers a shape for every key of a Clear skin, none for its d-pad or a skin with no pills', () => {
    openSkins('clear-smoke');
    const help = () => screen().querySelector('.skin-help').textContent;

    expect(help()).toBe('Tap a control to move, resize or reshape it');

    for (const key of KEYS) {
      tapKey(key);
      expect(shapes().hidden, key).toBe(false);
    }

    tapKey('dpad');
    expect(shapes().hidden).toBe(true);

    done();
    screen().querySelector('[data-skin-step="1"]').click();
    expect(help()).toBe('Tap a control to move or resize it');
    tapKey('light');
    expect(shapes().hidden).toBe(true);
  });

  it('turns any key a pill and back again, and plays each as picked once used', () => {
    openSkins('clear-lotus');

    for (const key of ['light', 'heavy', 'jump']) {
      tapKey(key);
      choose('pill');
      expect(previewed(key), key).toBe('pill');
    }

    done();
    screen().querySelector('[data-skin="use"]').click();
    expect(page.game.settings.keyShapes).toEqual({ light: 'pill', heavy: 'pill', jump: 'pill' });
    expect(KEYS.map(played)).toEqual(['pill', 'pill', 'pill', 'round', 'round']);

    row('skin').querySelector('[data-act="skins"]').click();
    tapKey('light');
    expect(lit()).toBe('pill');
    choose('round');
    done();
    screen().querySelector('[data-skin="use"]').click();
    expect(page.game.settings.keyShapes).toEqual({ heavy: 'pill', jump: 'pill' });
    expect(KEYS.map(played)).toEqual(['round', 'pill', 'pill', 'round', 'round']);
  });

  it('lets the keyboard reach every key and its shape, and Back let go of the key', () => {
    openSkins('clear-ember');
    const highlighted = () => page.menus.items()[page.menus.state.selected];

    expect(highlighted().dataset.skin).toBe('use');
    expect(page.menus.items().map((item) => item.dataset.control)).toEqual(
      expect.arrayContaining(['light', 'dash', 'ult']),
    );

    page.menus.state.selected = page.menus
      .items()
      .indexOf(preview().querySelector('[data-control="dash"]'));
    page.key('Enter');
    expect(page.menus.items().map((item) => item.dataset.keyShape ?? item.dataset.edit)).toEqual([
      'next',
      'smaller',
      'bigger',
      'round',
      'pill',
      'done',
    ]);
    expect(highlighted().dataset.edit).toBe('done');
    page.key('ArrowLeft');
    page.key('Enter');
    expect(previewed('dash')).toBe('pill');

    page.menus.back();

    expect(openMenu().id).toBe('m-skins');
    expect(editing()).toBe(false);
    expect(highlighted().dataset.control).toBe('dash');
  });

  it('lets go of the key for Done, a turn of the phone kept, a tap beside it or a swipe', () => {
    openSkins('clear-lotus');
    const skinName = () => screen().querySelector('.skin-name').textContent;

    tapKey('dash');
    done();
    expect(editing()).toBe(false);

    tapKey('dash');
    holdPhone(390, 844);
    expect(editing()).toBe(true);
    pointer(screen(), 'pointerdown', [200, 300]);
    pointer(screen(), 'pointerup', [200, 300]);
    expect(editing()).toBe(false);

    tapKey('ult');
    pointer(screen(), 'pointerdown', [300, 300]);
    pointer(screen(), 'pointerup', [150, 300]);
    expect(editing()).toBe(false);
    expect(skinName()).toBe('Clear Lotus');
  });

  it('plays the pills held upright too, and round keys for a shape it does not know', () => {
    holdPhone(390, 844);
    Object.assign(page.game.settings, { skin: 'clear-mekong', keyShapes: { dash: 'pill' } });
    page.layout.applyTouchSettings();
    expect([played('dash'), played('ult')]).toEqual(['pill', 'round']);

    page.game.settings.keyShapes = { dash: 'square', ult: 'pill', light: 'pill', jump: 'round' };
    page.layout.applyTouchSettings();
    expect(KEYS.map(played)).toEqual(['pill', 'round', 'round', 'round', 'pill']);
  });
});
