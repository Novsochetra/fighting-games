import { describe, expect, it } from 'vitest';
import { PAINTED_BACKDROPS } from '../../../src/data/backdrops/index.js';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { createView } from '../../../src/render/create-view.js';
import { renderFrame } from '../../../src/render/render-frame.js';
import { selectMission, startPlay } from '../../../src/sim/stage/flow.js';
import { FakeImage } from '../../support/fake-image.js';
import { RecordingCanvas } from '../../support/recording-canvas.js';
import { createTestGame, runTicks } from '../../support/test-game.js';

function createCanvas(width, height) {
  return Object.assign(new RecordingCanvas(), { width, height });
}

const placed = MISSIONS.flatMap((mission) => mission.nests.map((nest) => ({ mission, nest })));

function renderAt(mission, cameraX) {
  const screen = createCanvas(768, 432);
  const view = createView({
    context: screen.getContext('2d'),
    createCanvas,
    createImage: () => new FakeImage(),
    baseUrl: '',
  });
  const game = createTestGame();

  selectMission(game, mission.index);
  startPlay(game);
  runTicks(game, 2);
  game.camera.x = cameraX;
  const log = screen.recording.log;
  log.length = 0;
  renderFrame(game, view);

  return log;
}

describe('the hornet nests over the forest roads', () => {
  it('hang from a tree of their own forest, drawn on the road before the nest', () => {
    for (const { mission, nest } of placed) {
      const { nestTree } = PAINTED_BACKDROPS[mission.theme];
      const log = renderAt(mission, nest.x - 192);
      const slice = `drawImage(img(${nestTree.layer}.png),${nestTree.from},0,`;
      const tree = log.findIndex((call) => call.startsWith(slice));
      const hanging = log.findIndex((call) =>
        call.startsWith('drawImage(img(hornetNest.png),0,0,'),
      );
      const label = `${mission.name} nest at ${nest.x}`;

      expect(tree, label).toBeGreaterThan(-1);
      expect(hanging, label).toBeGreaterThan(tree);
    }
  });
});
