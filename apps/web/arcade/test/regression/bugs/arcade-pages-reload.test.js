// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  changed,
  homeLoaded,
  pageRequests,
  showing,
  startArcadeAt,
  stopArcades,
  tap,
} from '../../support/arcade-harness.js';

// Bug: every move between the arcade, its supporters and its credits loaded a whole new page. On a
// phone's link the supporters list showed about 1.3 s after the tap, every time, as all 47 of the
// page's files came again, and the slide waited for them. The three are now screens of one React
// app (src/App.tsx), which brings them all with it: a tap changes the screen at once.
afterEach(() => {
  stopArcades();
  vi.restoreAllMocks();
});

describe('moving between the arcade’s pages', () => {
  it('loads no page, and the tab stays the same document', async () => {
    const { fetchFn, navigate } = startArcadeAt('home');
    const assign = vi.spyOn(window.location, 'assign').mockImplementation(() => {});
    const documentAtStart = document;

    await homeLoaded();
    tap(document.getElementById('credits-link'));
    await changed();
    tap(document.getElementById('credits-supporters-link'));
    await changed();

    expect(showing()).toEqual(['supporters']);
    expect(pageRequests(fetchFn)).toEqual([]);
    expect(document).toBe(documentAtStart);
    expect([assign, navigate].map((spy) => spy.mock.calls.length)).toEqual([0, 0]);
  });
});
