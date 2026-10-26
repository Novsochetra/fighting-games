// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  changed,
  ORIGIN,
  pageRequests,
  screenOf,
  settle,
  showing,
  startArcadeAt,
  stopArcades,
  tap,
} from '../../support/arcade-harness.js';

const backOf = (id) => screenOf(id).querySelector('[data-back]');
const homeOf = (arcade) => arcade.screens.get('home').page;

afterEach(() => {
  stopArcades();
  vi.restoreAllMocks();
});

describe('the arcade as one page', () => {
  it('takes the other screens in from their own pages, inert, once it is idle', async () => {
    const { arcade, fetchFn } = await startArcadeAt('home');

    await settle(arcade);

    expect(pageRequests(fetchFn).sort()).toEqual(['/credits/', '/supporters/']);
    expect(showing()).toEqual(['home']);
    expect(screenOf('supporters').hasAttribute('inert')).toBe(true);
    expect(screenOf('credits').querySelector('img').getAttribute('src')).toMatch(/^http:\/\//);
  });

  it('changes to the supporters in the page, with the address, the title and the list', async () => {
    const { arcade, navigate } = await startArcadeAt('home');

    await settle(arcade);
    tap(document.getElementById('supporters-link'));
    await changed();
    await arcade.screens.get('supporters').page.ready;

    expect(window.location.href).toBe(`${ORIGIN}supporters/`);
    expect(document.title).toBe('Supporters · Retro Arcade');
    expect(showing()).toEqual(['supporters']);
    expect(document.getElementById('total').textContent).toBe('$500.50');
    expect(window.history.state.arcade).toEqual({ screen: 'supporters', index: 1 });
    expect(navigate).not.toHaveBeenCalled();
  });

  it('goes Back through history to the arcade it came from, which comes back as it was left', async () => {
    const { arcade } = await startArcadeAt('home');
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});

    await settle(arcade);
    await homeOf(arcade).ready;
    window.scrollTo(0, 600);
    window.dispatchEvent(new Event('scroll'));
    tap(document.getElementById('credits-link'));
    await changed();
    tap(backOf('credits'));

    expect(back).toHaveBeenCalledOnce();

    // the browser's own back: the address, then the entry the arcade wrote for it
    window.happyDOM.setURL(ORIGIN);
    window.dispatchEvent(
      new PopStateEvent('popstate', { state: { arcade: { screen: 'home', index: 0 } } }),
    );
    await changed();

    expect(showing()).toEqual(['home']);
    expect(window.scrollY).toBe(600);
  });

  it('opened on its own, goes Back to the arcade in the page, as a pop', async () => {
    const { arcade, fetchFn, navigate } = await startArcadeAt('supporters');

    await arcade.screens.get('supporters').page.ready;
    tap(backOf('supporters'));
    await vi.waitFor(() => expect(showing()).toEqual(['home']));
    await homeOf(arcade).ready;

    expect(window.location.href).toBe(ORIGIN);
    expect(pageRequests(fetchFn)).toContain('/');
    expect(document.querySelectorAll('#carousel-track .card').length).toBeGreaterThan(0);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('closes a sheet left open as its screen goes, and opens the donate sheet for #give', async () => {
    const { arcade } = await startArcadeAt('home');

    await settle(arcade);
    await homeOf(arcade).ready;
    tap(document.getElementById('coffee-open'));
    expect(document.getElementById('coffee-sheet').open).toBe(true);

    tap(document.getElementById('coffee-khqr'));
    await changed();

    expect(window.location.hash).toBe('#give');
    expect(document.getElementById('coffee-sheet').open).toBe(false);
    expect(document.getElementById('donate-sheet').open).toBe(true);
  });

  it('keeps the arcade’s keys off it while another screen shows', async () => {
    const { arcade } = await startArcadeAt('home');

    await settle(arcade);
    await homeOf(arcade).ready;
    const { controller } = homeOf(arcade);
    const selected = controller.selectedIndex();

    tap(document.getElementById('credits-link'));
    await changed();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

    expect(controller.selectedIndex()).toBe(selected);
  });

  it('loads the page itself when a screen’s page does not come', async () => {
    const { arcade } = await startArcadeAt('home', { fail: ['credits'] });
    const assign = vi.spyOn(window.location, 'assign').mockImplementation(() => {});

    await homeOf(arcade).ready;
    tap(document.getElementById('credits-link'));
    await vi.waitFor(() => expect(assign).toHaveBeenCalledWith(`${ORIGIN}credits/`));

    expect(showing()).toEqual(['home']);
  });
});
