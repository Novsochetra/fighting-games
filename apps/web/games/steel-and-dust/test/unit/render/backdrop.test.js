import { describe, expect, it } from 'vitest';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { backdropSettled, missionRoadLoaded } from '../../../src/render/scene/backdrop.js';
import { createLateView } from '../../support/late-images.js';

const piece = (settled) => ({ settled });
const folderOf = (src) => src.split('/').at(-2);
const backdropFolders = (images) =>
  new Set(
    images
      .waiting()
      .filter((src) => src.includes('backdrops/'))
      .map(folderOf),
  );

describe('backdrop loading', () => {
  it('counts a backdrop settled once every layer, front, the ground and any cliff has', () => {
    const settled = { layers: [piece(true)], fronts: [], ground: piece(true), cliff: null };
    expect(backdropSettled(settled)).toBe(true);
    expect(backdropSettled({ ...settled, cliff: piece(false) })).toBe(false);
    expect(backdropSettled({ ...settled, fronts: [piece(true), piece(false)] })).toBe(false);
    expect(backdropSettled({ ...settled, ground: piece(false) })).toBe(false);
  });

  it("holds a mission until its own road is in, and only then loads the next mission's", () => {
    const { view, images } = createLateView();
    expect(missionRoadLoaded(view, 0)).toBe(false);
    expect(backdropFolders(images)).toEqual(new Set(['pine-ridge']));
    images.loadAll();
    expect(missionRoadLoaded(view, 0)).toBe(true);
    expect(backdropFolders(images)).toEqual(new Set(['old-grove']));
    expect(missionRoadLoaded(view, 1)).toBe(false);
  });

  it('loads nothing more after the last mission', () => {
    const { view, images } = createLateView();
    missionRoadLoaded(view, MISSIONS.length - 1);
    images.loadAll();
    expect(missionRoadLoaded(view, MISSIONS.length - 1)).toBe(true);
    expect(images.waiting()).toEqual([]);
  });

  it('lets a mission go on over the plain road when its files fail to load', () => {
    const { view, images } = createLateView();
    missionRoadLoaded(view, 3);
    images.failAll();
    expect(missionRoadLoaded(view, 3)).toBe(true);
  });
});
