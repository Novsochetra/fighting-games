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
const switcher = () => document.querySelector('#m-skins [data-skin-shape]');
const shapeOf = (root, control) =>
  root.querySelector(`[data-control="${control}"]`).classList.contains('clear-pill')
    ? 'pill'
    : 'round';
const played = (control) => shapeOf(document.getElementById('touch'), control);
const previewed = (control) => shapeOf(document.querySelector('#m-skins .skin-preview'), control);

describe("a skin's shoulder keys, round or pill, on the real page", () => {
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
    page.act('settings');
    row('skin').querySelector('[data-act="skins"]').click();
    expect(openMenu().id).toBe('m-skins');
  }

  it('starts round, and switches DASH and ULT to pills on the Skins screen as it plays', () => {
    openSkins('clear-lotus');
    expect(page.game.settings.keyShape).toBe('round');
    expect(switcher().textContent).toBe('Round keys');
    expect([played('dash'), played('ult'), previewed('dash')]).toEqual(['round', 'round', 'round']);

    switcher().click();

    expect(switcher().textContent).toBe('Pill keys');
    expect([played('dash'), played('ult'), previewed('ult')]).toEqual(['pill', 'pill', 'pill']);
    expect(['heavy', 'light', 'jump'].map(played)).toEqual(['round', 'round', 'round']);
    expect(page.game.settings.keyShape).toBe('round');
  });

  it('keeps the pills only on Use, and leaves the keys round on Cancel', () => {
    openSkins('clear-jade');
    switcher().click();
    document.querySelector('#m-skins [data-act="back"]:not([data-skin])').click();
    expect(played('dash')).toBe('round');
    expect(page.game.settings.keyShape).toBe('round');

    row('skin').querySelector('[data-act="skins"]').click();
    expect(switcher().textContent).toBe('Round keys');
    switcher().click();
    document.querySelector('#m-skins [data-skin="use"]').click();

    expect(page.game.settings.keyShape).toBe('pill');
    expect(page.saveSettings).toHaveBeenLastCalledWith(
      expect.objectContaining({ skin: 'clear-jade', keyShape: 'pill' }),
    );
    expect([played('dash'), played('ult')]).toEqual(['pill', 'pill']);
  });

  it('shows the switch only for a skin that offers pills, and starts the highlight on Use', () => {
    openSkins('classic');
    const onUse = () => page.menus.items()[page.menus.state.selected];

    expect(switcher().closest('[hidden]')).not.toBeNull();
    expect(page.menus.items()).not.toContain(switcher());
    expect(onUse().dataset.skin).toBe('use');

    document.querySelector('#m-skins [data-skin-step="-1"]').click();

    expect(switcher().closest('[hidden]')).toBeNull();
    expect(page.menus.items()).toContain(switcher());
  });

  it('plays the pills held upright too, and round keys for a shape it does not know', () => {
    holdPhone(390, 844);
    Object.assign(page.game.settings, { skin: 'clear-mekong', keyShape: 'pill' });
    page.layout.applyTouchSettings();
    expect([played('dash'), played('ult')]).toEqual(['pill', 'pill']);

    page.game.settings.keyShape = 'square';
    page.layout.applyTouchSettings();
    expect(played('dash')).toBe('round');

    openSkins('clear-mekong');
    expect(switcher().textContent).toBe('Round keys');
  });
});
