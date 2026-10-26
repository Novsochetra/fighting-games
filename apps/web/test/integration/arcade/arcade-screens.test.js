// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  changed,
  homeLoaded,
  ORIGIN,
  pageRequests,
  screenOf,
  showing,
  startArcadeAt,
  stopArcades,
  tap,
} from '../../support/arcade-harness.js';
import { press } from '../../support/home-harness.js';
import { waitUntil } from '../../support/render-arcade.tsx';

const backOf = (id) => screenOf(id).querySelector('[data-back]');
const centerTitle = () => document.querySelector('#carousel-track .card.is-center').ariaLabel;

afterEach(() => {
  stopArcades();
  vi.restoreAllMocks();
});

describe('the arcade as one page', () => {
  it('keeps the arcade under a screen opened on its own, unseen and inert', async () => {
    const { fetchFn } = startArcadeAt('supporters');

    await homeLoaded();

    expect(showing()).toEqual(['supporters']);
    expect(screenOf('home').hasAttribute('inert')).toBe(true);
    expect(screenOf('home').querySelector('#carousel-track img').getAttribute('src')).toMatch(
      /^http:\/\//,
    );
    expect(pageRequests(fetchFn)).toEqual([]);
  });

  it('changes to the supporters in the page, with the address, the title and the list', async () => {
    const { navigate } = startArcadeAt('home');

    await homeLoaded();
    tap(document.getElementById('supporters-link'));
    await changed();
    await waitUntil(() => expect(document.getElementById('total').textContent).toBe('$500.50'));

    expect(window.location.href).toBe(`${ORIGIN}supporters/`);
    expect(document.title).toBe('Supporters · Retro Arcade');
    expect(showing()).toEqual(['supporters']);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('goes Back through history to the arcade it came from, which comes back as it was left', async () => {
    startArcadeAt('home');

    await homeLoaded();
    screenOf('home').scrollTop = 600;
    tap(document.getElementById('credits-link'));
    await changed();
    tap(backOf('credits'));
    await changed();

    expect(window.location.href).toBe(ORIGIN);
    expect(showing()).toEqual(['home']);
    expect(screenOf('home').scrollTop).toBe(600);
    expect(screenOf('credits')).toBeNull();
  });

  it('opened on its own, goes Back to the arcade in the page, as a pop', async () => {
    const { navigate } = startArcadeAt('supporters');

    tap(backOf('supporters'));
    await waitUntil(() => expect(showing()).toEqual(['home']));
    await homeLoaded();

    expect(window.location.href).toBe(ORIGIN);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('closes a sheet left open as its screen goes, and opens the donate sheet for #give', async () => {
    startArcadeAt('home');

    await homeLoaded();
    tap(document.getElementById('coffee-open'));
    expect(document.getElementById('coffee-sheet').open).toBe(true);

    tap(document.getElementById('coffee-khqr'));
    await changed();

    expect(window.location.hash).toBe('#give');
    expect(document.getElementById('coffee-sheet').open).toBe(false);
    expect(document.getElementById('donate-sheet').open).toBe(true);
  });

  it('keeps the arcade’s keys off it while another screen shows', async () => {
    startArcadeAt('home');

    await homeLoaded();
    const selected = centerTitle();

    tap(document.getElementById('credits-link'));
    await changed();
    press('ArrowRight');

    expect(centerTitle()).toBe(selected);
  });
});
