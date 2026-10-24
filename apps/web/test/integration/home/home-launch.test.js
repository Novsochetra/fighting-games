// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  bootWithGames,
  bootWithRealCatalog,
  byId,
  cards,
  loadHomeMarkup,
  press,
  stopHomes,
  tiles,
} from '../../support/home-harness.js';

const SCREEN = { left: 0, top: 0, width: 400, height: 800 };
const NOTHING = { left: 0, top: 0, width: 0, height: 0 };
const boxes = new Map([
  ['card__frame', { left: 40, top: 100, width: 320, height: 180 }],
  ['tile__frame', { left: 20, top: 900, width: 360, height: 202 }],
]);

// happy-dom has no layout, so every box measures zero; give the launch a phone-sized screen.
function stubLayout(overrides = {}) {
  const boxFor = (element) => {
    if (!element.isConnected) {
      return NOTHING;
    }
    if (element.classList.contains('launch') || element.id === 'home') {
      return SCREEN;
    }
    const name = [...boxes.keys()].find((className) => element.classList.contains(className));
    return overrides[name] ?? boxes.get(name) ?? NOTHING;
  };
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function measure() {
    const box = boxFor(this);
    return { ...box, right: box.left + box.width, bottom: box.top + box.height, x: 0, y: 0 };
  });
}

const cardFrame = () => cards()[0].querySelector('.card__frame');

const layer = () => document.querySelector('.launch');
// happy-dom's PageTransitionEvent drops the persisted flag, so the event carries it by hand.
function restoreFromCache(persisted = true) {
  const event = new Event('pageshow');
  Object.defineProperty(event, 'persisted', { value: persisted });
  window.dispatchEvent(event);
}

beforeEach(async () => {
  document.body.innerHTML = '';
  await loadHomeMarkup();
  vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(SCREEN.height);
});

afterEach(() => {
  stopHomes();
  vi.restoreAllMocks();
});

describe('launching a game', () => {
  beforeEach(() => stubLayout());

  it('grows the card into a screen-sized panel, then opens the game', async () => {
    const { navigate } = await bootWithRealCatalog();
    press('Enter');
    expect(layer()).not.toBeNull();
    expect(layer().getAttribute('aria-hidden')).toBe('true');
    // happy-dom loads no images, so the panel keeps the plain splash color
    expect(layer().querySelector('.launch__panel').style.getPropertyValue('--splash-top')).toBe('');
    const icon = layer().querySelector('.launch__icon');
    expect(icon.querySelector('img').getAttribute('src')).toBe(
      cardFrame().querySelector('img').getAttribute('src'),
    );
    expect(icon.style.width).toBe('320px');
    expect(icon.style.height).toBe('180px');
    expect(cardFrame().classList.contains('is-launching')).toBe(true);
    expect(byId('home').style.transformOrigin).toBe('200px 190px');
    expect(navigate).not.toHaveBeenCalled();

    await vi.waitFor(() => expect(navigate).toHaveBeenCalledWith('games/steel-and-dust/'));
  });

  it('opens from the library tile when the carousel has scrolled out of sight', async () => {
    stubLayout({
      card__frame: { left: 40, top: -600, width: 320, height: 180 },
      tile__frame: { left: 20, top: 300, width: 360, height: 202 },
    });
    await bootWithRealCatalog();
    press('Enter');
    expect(tiles()[0].querySelector('.tile__frame').classList.contains('is-launching')).toBe(true);
    expect(cardFrame().classList.contains('is-launching')).toBe(false);
  });

  it('ignores more presses while a game is opening', async () => {
    const { navigate } = await bootWithGames(['alpha', 'bravo']);
    press('Enter');
    expect(press('ArrowRight').defaultPrevented).toBe(false);
    press('Enter');
    expect(byId('spotlight-title').textContent).toBe('alpha');
    await vi.waitFor(() => expect(navigate).toHaveBeenCalled());
    expect(navigate.mock.calls).toEqual([['games/alpha/']]);
    expect(document.querySelectorAll('.launch')).toHaveLength(1);
  });

  it('opens at once, with no panel, when the visitor asks for less motion', async () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true });
    const { navigate } = await bootWithRealCatalog();
    press('Enter');
    expect(navigate).toHaveBeenCalledWith('games/steel-and-dust/');
    expect(layer()).toBeNull();
    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
  });
});

describe('coming back from a game', () => {
  beforeEach(() => stubLayout());

  async function launchAndLeave() {
    const started = await bootWithRealCatalog();
    press('Enter');
    await vi.waitFor(() => expect(started.navigate).toHaveBeenCalled());
    return started;
  }

  it('shrinks the panel back into the card when the page is restored from the cache', async () => {
    const { home } = await launchAndLeave();
    expect(layer()).not.toBeNull();
    restoreFromCache();
    await vi.waitFor(() => expect(layer()).toBeNull());
    expect(cardFrame().classList.contains('is-launching')).toBe(false);
    expect(home.launcher.isFlying()).toBe(false);
    expect(byId('home').getAnimations()).toEqual([]);
    expect(byId('home').style.transformOrigin).toBe('');
  });

  it('can open a game again after coming back', async () => {
    const { navigate } = await launchAndLeave();
    restoreFromCache();
    await vi.waitFor(() => expect(layer()).toBeNull());
    press('Enter');
    await vi.waitFor(() => expect(navigate).toHaveBeenCalledTimes(2));
  });

  it('leaves the page alone on an ordinary page show', async () => {
    await launchAndLeave();
    restoreFromCache(false);
    await Promise.resolve();
    expect(layer()).not.toBeNull();
  });

  it('fades the panel away when its card is gone', async () => {
    await launchAndLeave();
    byId('carousel-track').innerHTML = '';
    restoreFromCache();
    await vi.waitFor(() => expect(layer()).toBeNull());
  });

  it('brings the Recent list up to date with the game just played', async () => {
    const { navigate } = await bootWithRealCatalog();
    document.querySelector('[data-filter="recent"]').click();
    press('Enter');
    await vi.waitFor(() => expect(navigate).toHaveBeenCalled());
    expect(tiles()).toHaveLength(0);
    restoreFromCache();
    await vi.waitFor(() => expect(layer()).toBeNull());
    expect(tiles()).toHaveLength(1);
  });
});
