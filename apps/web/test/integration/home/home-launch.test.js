// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  bootWithGames,
  bootWithRealCatalog,
  gameLinks,
  loadHomeMarkup,
  press,
  stopHomes,
} from '../../support/home-harness.js';

const SCREEN = { left: 0, top: 0, width: 400, height: 800 };
const ICON = { left: 40, top: 100, width: 60, height: 60 };

// happy-dom has no layout, so every box measures zero; give the launch a phone-sized screen.
function stubLayout() {
  const boxFor = (element) => {
    if (!element.isConnected) {
      return { left: 0, top: 0, width: 0, height: 0 };
    }
    if (element.classList.contains('launch') || element.id === 'home') {
      return SCREEN;
    }
    return element.classList.contains('app__icon')
      ? ICON
      : { left: 0, top: 0, width: 0, height: 0 };
  };
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function measure() {
    return { ...boxFor(this), right: 0, bottom: 0, x: 0, y: 0 };
  });
}

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
  stubLayout();
});

afterEach(() => {
  stopHomes();
  vi.restoreAllMocks();
});

describe('launching a game', () => {
  it('grows the icon into a screen-sized panel, then opens the game', async () => {
    const { navigate } = await bootWithRealCatalog();
    press('Enter');
    expect(layer()).not.toBeNull();
    expect(layer().getAttribute('aria-hidden')).toBe('true');
    expect(layer().querySelector('.launch__panel canvas.launch__backdrop')).not.toBeNull();
    expect(layer().querySelector('.launch__icon img').getAttribute('src')).toBe(
      gameLinks()[0].querySelector('img').getAttribute('src'),
    );
    expect(gameLinks()[0].classList.contains('is-launching')).toBe(true);
    expect(document.getElementById('home').style.transformOrigin).toBe('70px 130px');
    expect(navigate).not.toHaveBeenCalled();

    await vi.waitFor(() => expect(navigate).toHaveBeenCalledWith('games/steel-and-dust/'));
  });

  it('ignores more presses while a game is opening', async () => {
    const { navigate } = await bootWithGames(['alpha', 'bravo']);
    press('Enter');
    press('ArrowRight');
    press('Enter');
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
  async function launchAndLeave() {
    const started = await bootWithRealCatalog();
    press('Enter');
    await vi.waitFor(() => expect(started.navigate).toHaveBeenCalled());
    return started;
  }

  it('shrinks the panel back into the icon when the page is restored from the cache', async () => {
    const { home } = await launchAndLeave();
    expect(layer()).not.toBeNull();
    restoreFromCache();
    await vi.waitFor(() => expect(layer()).toBeNull());
    expect(gameLinks()[0].classList.contains('is-launching')).toBe(false);
    expect(home.launcher.isFlying()).toBe(false);
    expect(document.getElementById('home').getAnimations()).toEqual([]);
    expect(document.getElementById('home').style.transformOrigin).toBe('');
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

  it('fades the panel away when its icon is gone', async () => {
    await launchAndLeave();
    document.getElementById('app-grid').innerHTML = '';
    restoreFromCache();
    await vi.waitFor(() => expect(layer()).toBeNull());
  });
});
