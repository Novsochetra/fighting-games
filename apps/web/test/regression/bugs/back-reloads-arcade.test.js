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
import { waitUntil } from '../../support/render-arcade.tsx';
import { clickAndSeeIfHeld } from '../../support/link-click.js';

// Bug: Arcade (Back) on the credits and supporters pages loaded the arcade as a new page, so it came
// back at the top and played its whole entrance again. Back now pops to the arcade screen it came
// from, in the page; a page loaded from the arcade goes back through history, so the browser brings
// the arcade back as it was left; and one opened on its own takes the arcade in without a load.
const backOf = (id) => screenOf(id).querySelector('[data-back]');
const linkTo = { credits: 'credits-link', supporters: 'supporters-link' };

afterEach(() => {
  stopArcades();
  vi.restoreAllMocks();
});

describe.each(['credits', 'supporters'])('Back on the %s screen', (id) => {
  it('pops to the arcade it came from in the page, not to a new copy of it', async () => {
    const { fetchFn } = startArcadeAt('home');
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});

    await homeLoaded();
    tap(document.getElementById(linkTo[id]));
    await changed();

    expect(clickAndSeeIfHeld(backOf(id))).toBe(true);
    expect(back).toHaveBeenCalledOnce();
    expect(pageRequests(fetchFn)).toEqual([]);
  });

  it('goes back in history to the arcade a load came from, under a query too', async () => {
    for (const referrer of [ORIGIN, `${ORIGIN}?from=share`]) {
      window.history.pushState(null, '', `${ORIGIN}${id}/`);
      startArcadeAt(id, { referrer });
      const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});

      expect(clickAndSeeIfHeld(backOf(id))).toBe(true);
      expect(back).toHaveBeenCalledOnce();
      stopArcades();
      vi.restoreAllMocks();
    }
  });

  it('opened on its own or from elsewhere, takes the arcade in without a load', async () => {
    for (const referrer of ['', `${ORIGIN}supporters/`, 'https://www.google.com/']) {
      const { navigate } = startArcadeAt(id, { referrer });
      const back = vi.spyOn(window.history, 'back');
      const assign = vi.spyOn(window.location, 'assign').mockImplementation(() => {});

      expect(clickAndSeeIfHeld(backOf(id))).toBe(true);
      await waitUntil(() => expect(showing()).toEqual(['home']));
      expect(window.location.href).toBe(ORIGIN);
      expect([back, assign, navigate].map((spy) => spy.mock.calls.length)).toEqual([0, 0, 0]);
      stopArcades();
      vi.restoreAllMocks();
    }
  });

  it('leaves a click that opens a new tab to the link', async () => {
    startArcadeAt(id, { referrer: ORIGIN });
    const back = vi.spyOn(window.history, 'back');

    expect(clickAndSeeIfHeld(backOf(id), { metaKey: true })).toBe(false);
    expect(clickAndSeeIfHeld(backOf(id), { ctrlKey: true })).toBe(false);
    expect(back).not.toHaveBeenCalled();
  });
});
