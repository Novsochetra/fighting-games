import { describe, expect, it } from 'vitest';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { createView } from '../../../src/render/create-view.js';
import { renderFrame } from '../../../src/render/render-frame.js';
import { scenePalette } from '../../../src/render/scene/scene-palette.js';
import { selectMission, startPlay } from '../../../src/sim/stage/flow.js';
import { FakeImage } from '../../support/fake-image.js';
import { RecordingCanvas } from '../../support/recording-canvas.js';
import { createTestGame, runTicks } from '../../support/test-game.js';

const canvases = [];

function createCanvas(width, height) {
  const canvas = Object.assign(new RecordingCanvas(), { width, height });
  canvases.push(canvas);
  return canvas;
}

function recordedView() {
  const screen = createCanvas(768, 432);
  const view = createView({
    context: screen.getContext('2d'),
    createCanvas,
    createImage: () => new FakeImage(),
    baseUrl: '',
  });
  return { view, log: screen.recording.log };
}

const paintedColors = (canvas) =>
  canvas.recording.log
    .filter((call) => call.startsWith('fillStyle='))
    .map((call) => call.slice(10));

describe('the scenery of each mission', () => {
  it("paints each mission's backdrop in its own theme, once per theme", () => {
    const { view } = recordedView();
    const game = createTestGame();
    for (const mission of MISSIONS) {
      selectMission(game, mission.index);
      startPlay(game);
      runTicks(game, 2);
      renderFrame(game, view);
      const sky = view.backdrops[mission.theme].sky;
      expect(paintedColors(sky), mission.name).toContain(scenePalette(mission.theme).sky.bands[0]);
    }
    expect(Object.keys(view.backdrops).sort()).toEqual(
      [...new Set(MISSIONS.map((mission) => mission.theme))].sort(),
    );
  });

  it("draws the ground in the mission's sand color", () => {
    const { view, log } = recordedView();
    const game = createTestGame();
    selectMission(game, 5);
    startPlay(game);
    renderFrame(game, view);
    expect(log).toContain(`fillStyle=${scenePalette('salt').ground.sand}`);
  });
});
