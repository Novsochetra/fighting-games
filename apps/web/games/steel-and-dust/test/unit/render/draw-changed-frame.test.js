import { describe, expect, it } from 'vitest';
import { drawChangedFrame } from '../../../src/render/draw-changed-frame.js';
import { createLateView } from '../../support/late-images.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

function loadedFight() {
  const game = createPlayingGame();
  const late = createLateView();
  drawChangedFrame(game, late.view);
  late.images.loadAll();
  runTicks(game, 1);
  return { game, ...late };
}

describe('drawing only a changed frame', () => {
  it('draws a tick once, however many screen refreshes come before the next one', () => {
    const { game, view, log } = loadedFight();
    expect(drawChangedFrame(game, view)).toBe(true);
    log.length = 0;
    expect(drawChangedFrame(game, view)).toBe(false);
    expect(drawChangedFrame(game, view)).toBe(false);
    expect(log).toEqual([]);
    runTicks(game, 1);
    expect(drawChangedFrame(game, view)).toBe(true);
    expect(log.length).toBeGreaterThan(0);
  });

  it('draws the loading screen on every refresh, its dots count drawn frames', () => {
    const game = createPlayingGame();
    const { view } = createLateView();
    for (let frame = 0; frame < 3; frame++) {
      expect(drawChangedFrame(game, view)).toBe(true);
    }
    expect(view.loadingFrames).toBe(3);
  });

  it('draws the road as soon as it is in, without waiting for a tick', () => {
    const game = createPlayingGame();
    const { view, images } = createLateView();
    drawChangedFrame(game, view);
    images.loadAll();
    expect(drawChangedFrame(game, view)).toBe(true);
  });
});
