// @vitest-environment happy-dom
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { act } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PUBLIC_ROOT } from '../../../../../../server/src/paths.js';
import { BANNERS, BANNER_WIDTHS } from '@/screens/home/library/WallpapersCallout.tsx';
import { BANNER_TURN_MS } from '@/screens/home/library/use-banner-turn.ts';
import { homeLoaded, startArcadeAt, stopArcades } from '../../../support/arcade-harness.js';

const drawn = () =>
  Object.fromEntries(
    [...document.querySelectorAll('#wallpapers-link [data-banner]')].map((art) => [
      art.dataset.banner,
      art.dataset.state,
    ]),
  );

// the card on the screen, as an observer tells it, and the banners' timer, run by hand
function onScreen() {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback) {
        this.callback = callback;
      }

      observe() {
        this.callback([{ isIntersecting: true }]);
      }

      disconnect() {}
    },
  );

  return vi.spyOn(window, 'setInterval');
}

const turnTimers = (setInterval) =>
  setInterval.mock.calls.filter(([, delay]) => delay === BANNER_TURN_MS);

async function openHome() {
  startArcadeAt('home');
  await homeLoaded();
}

afterEach(() => {
  stopArcades();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('the wallpapers banner under the library', () => {
  it('has each banner in every width on disk', async () => {
    for (const id of BANNERS) {
      for (const width of BANNER_WIDTHS) {
        const file = path.join(PUBLIC_ROOT, 'assets', 'wallpapers', `banner-${id}-${width}.webp`);

        expect((await stat(file)).isFile()).toBe(true);
      }
    }
  });

  it('shows the first banner, with only the next drawn unseen behind it', async () => {
    await openHome();

    expect(drawn()).toEqual({ [BANNERS[0]]: 'shown', [BANNERS[1]]: 'waiting' });
  });

  it('fades to the next banner on each turn while the card is on the screen', async () => {
    const setInterval = onScreen();

    await openHome();
    const [[turn]] = turnTimers(setInterval);
    act(() => turn());

    expect(drawn()).toEqual({
      [BANNERS[0]]: 'leaving',
      [BANNERS[1]]: 'shown',
      [BANNERS[2]]: 'waiting',
    });
  });

  it('holds still while a pointer rests on the card', async () => {
    const setInterval = onScreen();
    const clearInterval = vi.spyOn(window, 'clearInterval');

    await openHome();
    const timer =
      setInterval.mock.results[setInterval.mock.calls.indexOf(turnTimers(setInterval)[0])];
    act(() => {
      document
        .getElementById('wallpapers-link')
        .dispatchEvent(new PointerEvent('pointerover', { bubbles: true }));
    });

    expect(clearInterval).toHaveBeenCalledWith(timer.value);
  });

  it('never turns for a visitor who asks for reduced motion', async () => {
    const setInterval = onScreen();
    const matchMedia = window.matchMedia.bind(window);

    vi.spyOn(window, 'matchMedia').mockImplementation((query) =>
      query.includes('reduced-motion')
        ? { ...matchMedia(query), matches: true }
        : matchMedia(query),
    );
    await openHome();

    expect(turnTimers(setInterval)).toEqual([]);
  });
});
