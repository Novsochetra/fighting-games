import { describe, expect, it } from 'vitest';
import { missionWait, sceneLoaded, sceneProgress } from '../../../src/render/scene-loaded.js';
import { createLateView } from '../../support/late-images.js';

const heroStrip = (folder) => (src) => src.includes(`sprites/${folder}`);
const game = (hero, mode = 'play') => ({ missionIndex: 0, settings: { hero }, mode });
const firstRoad = (src) => src.includes('backdrops/') && !src.includes('old-grove');

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

describe("the loading screen's share of the scene", () => {
  // Pine Ridge is a back plate, a near strip, its ground and its cliff; a Shade has 23 strips
  it('counts each layer of the road and each strip of the Shade once', () => {
    const { view, images } = createLateView();
    expect(sceneProgress(view, game('moss'))).toBe(0);
    images.loadWhere(firstRoad);
    expect(sceneProgress(view, game('moss'))).toBe(4 / 27);
    images.loadWhere(heroStrip('hero/'));
    expect(sceneProgress(view, game('moss'))).toBe(1);
  });

  it('counts a file that failed as in, as the game goes on without it', () => {
    const { view, images } = createLateView();
    sceneProgress(view, game('blue'));
    images.loadWhere((src) => !heroStrip('heroes/blue/')(src));
    expect(sceneProgress(view, game('blue'))).toBe(4 / 27);
    images.failAll();
    expect(sceneProgress(view, game('blue'))).toBe(1);
  });

  it('shows only in play, while the scene is still on its way', () => {
    const { view, images } = createLateView();
    expect(missionWait(view, game('moss', 'title'))).toBeNull();
    expect(missionWait(view, game('moss'))).toBe(0);
    images.loadAll();
    expect(missionWait(view, game('moss'))).toBeNull();
  });
});
