// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';
import {
  changed,
  homeLoaded,
  showing,
  startArcadeAt,
  stopArcades,
  tap,
} from '../../support/arcade-harness.js';
import { boardFetch, byId, texts } from '../../support/leaderboard-harness.js';
import { waitUntil } from '../../support/render-arcade.tsx';

afterEach(stopArcades);

describe('the way to the leaderboard', () => {
  it('pushes the leaderboard over the arcade from the trophy in the top bar', async () => {
    startArcadeAt('home');
    await homeLoaded();
    const trophy = byId('leaderboard-link');
    expect(trophy.getAttribute('aria-label')).toBe('Leaderboard');
    // the carousel opens on Morodok Angkor, which has no board
    expect(new URL(trophy.href).search).toBe('');
    tap(trophy);
    await changed();
    expect(showing()).toEqual(['leaderboard']);
  });

  it("shows the week's top three in the game's Details, and See all opens the board", async () => {
    startArcadeAt('home', { fetch: boardFetch({ only: 'steel-and-dust' }).fetchFn });
    await homeLoaded();
    tap(byId('details-open'));
    await waitUntil(() => expect(texts('.board-peek__name')).toHaveLength(3));
    expect(texts('#details-board-title')).toEqual(['Top this week']);
    expect(texts('.board-peek__name')).toEqual(['Sok Dara', 'សុខ ដារ៉ា', 'Mey']);
    expect(new URL(byId('details-board-all').href).search).toBe('?game=steel-and-dust');
    expect(new URL(byId('leaderboard-link').href).search).toBe('?game=steel-and-dust');
    tap(byId('details-board-all'));
    await changed();
    expect(byId('details').open).toBe(false);
    expect(showing()).toEqual(['leaderboard']);
  });
});
