import { describe, expect, it } from 'vitest';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { missionEnemySheets } from '../../../src/data/missions/mission-enemies.js';
import { createView } from '../../../src/render/create-view.js';
import { sceneLoaded } from '../../../src/render/scene-loaded.js';
import { RecordingCanvas } from '../../support/recording-canvas.js';
import { TrackedImage } from '../../support/tracked-image.js';

// Bug: every enemy's sheet loaded at the start and stayed for the whole run, though a road only
// ever sees its own raiders and bosses: the first road's boss still took memory on the last road
const MEGABYTE = 1024 * 1024;
const MOST_MEGABYTES_HELD = 24;

function playingView() {
  const createCanvas = (width, height) => Object.assign(new RecordingCanvas(), { width, height });
  return createView({
    context: createCanvas(768, 432).getContext('2d'),
    createCanvas,
    createImage: () => new TrackedImage(),
    baseUrl: '',
  });
}

const playing = (missionIndex) => ({ missionIndex, settings: { hero: 'moss' }, mode: 'play' });
const held = (view) => Object.keys(view.enemySheets.images).sort();
const heldMegabytes = (view) =>
  Object.values(view.enemySheets.images).reduce(
    (sum, image) => sum + (image.width * image.height * 4) / MEGABYTE,
    0,
  );

function ownAndNext(index) {
  const next = MISSIONS[index + 1] ? missionEnemySheets(index + 1) : [];
  return [...new Set([...missionEnemySheets(index), ...next])].sort();
}

describe('the enemy sheets held through a run', () => {
  it('are none before a mission asks for its enemies', () => {
    expect(held(playingView())).toEqual([]);
  });

  it("are the mission's own and the next mission's, none from a road left behind", () => {
    const view = playingView();
    MISSIONS.forEach((mission, index) => {
      sceneLoaded(view, playing(index));
      expect(held(view), mission.name).toEqual(ownAndNext(index));
    });
  });

  it("take a road or two's worth of memory, never the whole game's", () => {
    const view = playingView();
    MISSIONS.forEach((mission, index) => {
      sceneLoaded(view, playing(index));
      expect(heldMegabytes(view), mission.name).toBeLessThan(MOST_MEGABYTES_HELD);
    });
  });
});
