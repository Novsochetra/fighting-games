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

function renderMission(index, ticks = 2) {
  const { view, log } = recordedView();
  const game = createTestGame();
  selectMission(game, index);
  startPlay(game);
  runTicks(game, ticks);
  log.length = 0;
  renderFrame(game, view);
  return { view, log, game, mission: MISSIONS[index] };
}

describe('the scenery of each mission', () => {
  it('paints every road with layers of its own, loaded once', () => {
    const { view } = recordedView();
    const game = createTestGame();
    for (const mission of MISSIONS) {
      expect(PAINTED_BACKDROPS[mission.theme], mission.name).toBeDefined();
      selectMission(game, mission.index);
      startPlay(game);
      runTicks(game, 2);
      renderFrame(game, view);
    }
    expect(Object.keys(view.backdrops).sort()).toEqual(
      [...new Set(MISSIONS.map((mission) => mission.theme))].sort(),
    );
  });

  it('draws every layer of a painted road, far plate first, before the fighters', () => {
    for (const mission of MISSIONS) {
      const { log } = renderMission(mission.index);
      const { folder } = PAINTED_BACKDROPS[mission.theme];
      const layerCalls = log.filter(
        (call) => call.includes('img(back.png)') || call.includes('img(near.png)'),
      );
      expect(layerCalls.length, mission.name).toBeGreaterThanOrEqual(2);
      expect(layerCalls[0], `${mission.name} in ${folder}`).toContain('img(back.png)');
    }
  });

  it('keeps the air of a painted road moving while the camera stands still', () => {
    for (const mission of MISSIONS) {
      const first = renderMission(mission.index, 2).log.join('|');
      const later = renderMission(mission.index, 90).log.join('|');
      expect(later, mission.name).not.toBe(first);
    }
  });

  it('leaves the forest through its broken palisade and the last of its trunks', () => {
    const canyon = MISSIONS.find((mission) => mission.theme === 'sandstormPass');
    const { log } = renderMission(canyon.index);
    for (const image of ['palisadeBroken.png', 'edge.png', 'back.png', 'near.png']) {
      expect(
        log.some((call) => call.includes(`img(${image})`)),
        image,
      ).toBe(true);
    }
    expect(log.some((call) => call.includes('img(canyonBarricade.png)'))).toBe(false);
  });

  it('closes the canyon with the raider barricade and lets the forest fall behind', () => {
    const canyon = MISSIONS.find((mission) => mission.theme === 'sandstormPass');
    const { view, log, game } = renderMission(canyon.index);
    game.camera.x = canyon.length - 384;
    log.length = 0;
    renderFrame(game, view);
    expect(log.some((call) => call.includes('img(canyonBarricade.png)'))).toBe(true);
    expect(log.some((call) => call.includes('img(edge.png)'))).toBe(false);
  });

  it('lays every road from its painted cross-section', () => {
    for (const mission of MISSIONS) {
      expect(
        renderMission(mission.index).log.some((call) => call.includes('img(ground.png)')),
        mission.name,
      ).toBe(true);
    }
  });
});
