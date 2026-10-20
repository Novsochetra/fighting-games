import { describe, expect, it } from 'vitest';
import { PAINTED_BACKDROPS } from '../../../src/data/backdrops.js';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { createView } from '../../../src/render/create-view.js';
import { renderFrame } from '../../../src/render/render-frame.js';
import { scenePalette } from '../../../src/render/scene/scene-palette.js';
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

const paintedColors = (canvas) =>
  canvas.recording.log
    .filter((call) => call.startsWith('fillStyle='))
    .map((call) => call.slice(10));

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

const forestMissions = MISSIONS.filter((mission) => PAINTED_BACKDROPS[mission.theme]);
const desertMissions = MISSIONS.filter((mission) => !PAINTED_BACKDROPS[mission.theme]);

describe('the scenery of each mission', () => {
  it('walks the first six missions through painted forests and the last four through the desert', () => {
    expect(forestMissions.map((mission) => mission.number)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(desertMissions.map((mission) => mission.number)).toEqual([7, 8, 9, 10]);
  });

  it('draws every layer of a forest, far plate first, before the fighters', () => {
    for (const mission of forestMissions) {
      const { log } = renderMission(mission.index);
      const { folder } = PAINTED_BACKDROPS[mission.theme];
      const layerCalls = log.filter(
        (call) => call.includes('img(back.png)') || call.includes('img(near.png)'),
      );
      expect(layerCalls.length, mission.name).toBeGreaterThanOrEqual(2);
      expect(layerCalls[0], `${mission.name} in ${folder}`).toContain('img(back.png)');
    }
  });

  it('keeps the air of a forest moving while the camera stands still', () => {
    for (const mission of forestMissions) {
      const first = renderMission(mission.index, 2).log.join('|');
      const later = renderMission(mission.index, 90).log.join('|');
      expect(later, mission.name).not.toBe(first);
    }
  });

  it("paints each desert road's backdrop in its own theme, once per theme", () => {
    const { view } = recordedView();
    const game = createTestGame();
    for (const mission of desertMissions) {
      selectMission(game, mission.index);
      startPlay(game);
      runTicks(game, 2);
      renderFrame(game, view);
      const sky = view.backdrops[mission.theme].sky;
      expect(paintedColors(sky), mission.name).toContain(scenePalette(mission.theme).sky.bands[0]);
    }
    expect(Object.keys(view.backdrops).sort()).toEqual(
      [...new Set(desertMissions.map((mission) => mission.theme))].sort(),
    );
  });

  it("draws the road in the mission's own soil or sand", () => {
    expect(renderMission(5).log).toContain(
      `fillStyle=${scenePalette('fireflyHollow').ground.sand}`,
    );
    expect(renderMission(6).log).toContain(`fillStyle=${scenePalette('storm').ground.sand}`);
  });
});
