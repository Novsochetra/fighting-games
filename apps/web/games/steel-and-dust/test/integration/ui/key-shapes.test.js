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

const row = (key) => document.querySelector(`[data-k="${key}"]`);
const preview = () => document.querySelector('#m-skins .skin-preview');
const chooser = () => document.querySelector('#m-skins .key-chooser');
const shapeOf = (root, control) =>
  root.querySelector(`[data-control="${control}"]`).classList.contains('clear-pill')
    ? 'pill'
    : 'round';
const played = (control) => shapeOf(document.getElementById('touch'), control);
const previewed = (control) => shapeOf(preview(), control);
const tapKey = (control) => preview().querySelector(`[data-control="${control}"]`).click();
const choose = (shape) => chooser().querySelector(`[data-key-shape="${shape}"]`).click();

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
    page.openSection('touch');
    row('skin').querySelector('[data-act="skins"]').click();
    expect(openMenu().id).toBe('m-skins');
  }

  it('opens a chooser for a key tapped, and makes that key alone a pill as it plays', () => {
    openSkins('clear-lotus');
    expect(['dash', 'ult'].map(played)).toEqual(['round', 'round']);

    tapKey('dash');

    expect(chooser().hidden).toBe(false);
    expect(chooser().textContent).toContain('DASH');
    expect(chooser().querySelector('[aria-pressed="true"]').dataset.keyShape).toBe('round');

    choose('pill');

    expect(chooser().hidden).toBe(true);
    expect([played('dash'), played('ult'), previewed('dash')]).toEqual(['pill', 'round', 'pill']);
    expect(page.game.settings.keyShapes).toEqual({});

    tapKey('dash');
    expect(chooser().querySelector('[aria-pressed="true"]').dataset.keyShape).toBe('pill');
    choose('round');
    expect(played('dash')).toBe('round');
  });

  it('keeps the shapes picked only on Use, and none on Cancel', () => {
    openSkins('clear-jade');
    tapKey('ult');
    choose('pill');
    document.querySelector('#m-skins [data-act="back"]:not([data-skin])').click();
    expect(played('ult')).toBe('round');
    expect(page.game.settings.keyShapes).toEqual({});

    row('skin').querySelector('[data-act="skins"]').click();
    tapKey('ult');
    choose('pill');
    document.querySelector('#m-skins [data-skin="use"]').click();

    expect(page.game.settings.keyShapes).toEqual({ ult: 'pill' });
    expect(page.saveSettings).toHaveBeenLastCalledWith(
      expect.objectContaining({ skin: 'clear-jade', keyShapes: { ult: 'pill' } }),
    );
    expect([played('dash'), played('ult')]).toEqual(['round', 'pill']);
  });

  it('offers only the keys a skin has pills for, and names them in the bar', () => {
    openSkins('clear-smoke');
    const pickable = () => [...preview().querySelectorAll('[data-pickable]')];
    const hint = document.querySelector('#m-skins .skin-shape');

    expect(pickable().map((key) => key.dataset.control)).toEqual(['dash', 'ult']);
    expect(hint.hidden).toBe(false);
    expect(hint.textContent).toBe('Tap DASH or ULT to make it round or a pill');

    tapKey('light');
    expect(chooser().hidden).toBe(true);

    document.querySelector('#m-skins [data-skin-step="1"]').click();
    expect(pickable()).toEqual([]);
    expect(hint.hidden).toBe(true);
  });

  it('lets the keyboard reach the keys and the chooser, and Back close only the chooser', () => {
    openSkins('clear-ember');
    const highlighted = () => page.menus.items()[page.menus.state.selected];

    expect(highlighted().dataset.skin).toBe('use');
    expect(
      page.menus
        .items()
        .map((item) => item.dataset.control)
        .slice(-2),
    ).toEqual(['dash', 'ult']);

    tapKey('dash');
    expect(page.menus.items()).toEqual([...chooser().querySelectorAll('button')]);
    expect(highlighted().dataset.keyShape).toBe('round');

    page.menus.back();

    expect(openMenu().id).toBe('m-skins');
    expect(chooser().hidden).toBe(true);
    expect(highlighted().dataset.control).toBe('dash');
  });

  it('closes the chooser for a step to another skin, a turn of the phone, or a tap beside it', () => {
    openSkins('clear-lotus');
    tapKey('dash');
    document.querySelector('#m-skins .skin-shell').click();
    expect(chooser().hidden).toBe(true);

    tapKey('dash');
    holdPhone(390, 844);
    expect(chooser().hidden).toBe(true);

    tapKey('ult');
    document.querySelector('#m-skins [data-skin-step="-1"]').click();
    expect(chooser().hidden).toBe(true);
  });

  it('plays the pills held upright too, and round keys for a shape it does not know', () => {
    holdPhone(390, 844);
    Object.assign(page.game.settings, { skin: 'clear-mekong', keyShapes: { dash: 'pill' } });
    page.layout.applyTouchSettings();
    expect([played('dash'), played('ult')]).toEqual(['pill', 'round']);

    page.game.settings.keyShapes = { dash: 'square', ult: 'pill', light: 'pill' };
    page.layout.applyTouchSettings();
    expect([played('dash'), played('ult'), played('light')]).toEqual(['round', 'pill', 'round']);
  });
});
