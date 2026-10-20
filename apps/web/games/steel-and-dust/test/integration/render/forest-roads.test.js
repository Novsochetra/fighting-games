import { describe, expect, it } from 'vitest';
import { PAINTED_BACKDROPS } from '../../../src/data/backdrops/index.js';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { createView } from '../../../src/render/create-view.js';
import { renderFrame } from '../../../src/render/render-frame.js';
import { selectMission, startPlay } from '../../../src/sim/stage/flow.js';
import { groundAt } from '../../../src/sim/stage/terrain.js';
import { FakeImage } from '../../support/fake-image.js';
import { RecordingCanvas } from '../../support/recording-canvas.js';
import { createTestGame, runTicks } from '../../support/test-game.js';

function createCanvas(width, height) {
  return Object.assign(new RecordingCanvas(), { width, height });
}

const forests = MISSIONS.filter((mission) => PAINTED_BACKDROPS[mission.theme]);

// the first column where the road jumps by more than a step, past the level start
function firstSheerStep(mission) {
  for (let x = 301; x < mission.length; x++) {
    if (Math.abs(groundAt(mission.terrain, x) - groundAt(mission.terrain, x - 1)) > 8) {
      return x;
    }
  }
  return null;
}

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

describe('the forest roads', () => {
  it('give the sheer steps of every forest a cliff face from its own folder', () => {
    for (const mission of forests) {
      const step = firstSheerStep(mission);
      expect(step, mission.name).not.toBeNull();
      const log = renderAt(mission, step - 150);
      const faces = log.filter(
        (call) =>
          call.startsWith('drawImage(img(cliff.png)') || call.startsWith('drawImage(canvas(12x64'),
      );
      expect(faces.length, mission.name).toBeGreaterThan(0);
    }
  });

  it('open every forest after the first with a piece of the forest before it, drawn once', () => {
    for (const mission of forests.slice(1)) {
      const { layers } = PAINTED_BACKDROPS[mission.theme];
      expect(layers.find((layer) => layer.name === 'way-in')?.once, mission.name).toBe(true);
      const atStart = renderAt(mission, 0).filter((call) => call.includes('img(way-in.png)'));
      expect(atStart, mission.name).toHaveLength(1);
      const farOn = renderAt(mission, 1200).filter((call) => call.includes('img(way-in.png)'));
      expect(
        farOn.every((call) => Number(call.split(',')[1]) < -300),
        mission.name,
      ).toBe(true);
    }
  });
});
