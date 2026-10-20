import { describe, expect, it } from 'vitest';
import { sceneLoaded } from '../../../src/render/scene-loaded.js';
import { createLateView } from '../../support/late-images.js';

const heroStrip = (folder) => (src) => src.includes(`sprites/${folder}`);
const game = (hero) => ({ missionIndex: 0, settings: { hero } });

describe('the scene gate', () => {
  it("waits for the mission's road and the picked Shade's strips", () => {
    const { view, images } = createLateView();
    expect(sceneLoaded(view, game('moss'))).toBe(false);
    images.loadWhere((src) => !heroStrip('hero/')(src));
    expect(sceneLoaded(view, game('moss'))).toBe(false);
    expect(sceneLoaded(view, game('blue'))).toBe(true);
    images.loadAll();
    expect(sceneLoaded(view, game('moss'))).toBe(true);
  });

  it('lets the game go on when a Shade fails to load, but never draws from its strips', () => {
    const { view, images } = createLateView();
    sceneLoaded(view, game('antler'));
    images.loadWhere((src) => !heroStrip('heroes/antler/')(src));
    images.failAll();
    expect(sceneLoaded(view, game('antler'))).toBe(true);
    expect(view.heroSheets.antler.ready).toBe(false);
    expect(view.heroSheets.moss.ready).toBe(true);
  });
});
