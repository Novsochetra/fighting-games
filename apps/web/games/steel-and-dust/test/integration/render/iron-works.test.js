import { describe, expect, it } from 'vitest';
import { PAINTED_THEMES } from '../../../src/art/painted-themes/index.js';
import { VIEW_WIDTH } from '../../../src/config.js';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { createView } from '../../../src/render/create-view.js';
import { renderFrame } from '../../../src/render/render-frame.js';
import { selectMission, startPlay } from '../../../src/sim/stage/flow.js';
import { FakeImage } from '../../support/fake-image.js';
import { RecordingCanvas } from '../../support/recording-canvas.js';
import { createTestGame, runTicks } from '../../support/test-game.js';

const mission = MISSIONS.find((item) => item.theme === 'ironWorks');
const theme = PAINTED_THEMES.ironWorks;

function createCanvas(width, height) {
  return Object.assign(new RecordingCanvas(), { width, height });
}

function createRoad() {
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
  return { view, game, log: screen.recording.log };
}

// the canvas calls of one frame with the camera parked at a spot on the road
function frameAt(road, { cameraX, tick = 0 }) {
  road.game.camera.x = cameraX;
  road.game.tickCount = tick;
  road.log.length = 0;
  renderFrame(road.game, road.view);
  return road.log.slice();
}

const imageCalls = (log, file) => log.filter((call) => call.includes(`img(${file})`));
const colorsIn = (log) =>
  new Set(log.filter((call) => call.startsWith('fillStyle=')).map((call) => call.slice(10)));

describe('the Iron Works road', () => {
  it('is the eighth mission, its road dressed by the paintings with only the gate set on it', () => {
    expect(mission.number).toBe(8);
    expect(mission.props.map((prop) => prop.kind)).toEqual(['foundryGate']);
  });

  it('opens on the canyon mouth and leaves it behind as the hero walks on', () => {
    const road = createRoad();
    const [atStart] = imageCalls(frameAt(road, { cameraX: 0 }), 'mouth.png');
    expect(atStart).toBe('drawImage(img(mouth.png),0,0)');
    const [later] = imageCalls(frameAt(road, { cameraX: 2000 }), 'mouth.png');
    const left = Number(later.split(',')[1]);
    expect(left + 384).toBeLessThanOrEqual(0);
  });

  it('stands an iron catwalk wherever its zones raise one', () => {
    const road = createRoad();
    for (const platform of mission.terrain.platforms) {
      const log = frameAt(road, { cameraX: platform.x - 100 });
      expect(imageCalls(log, 'catwalk.png').length, `at ${platform.x}`).toBeGreaterThan(1);
    }
  });

  it('ends at the foundry gate', () => {
    const road = createRoad();
    const log = frameAt(road, { cameraX: mission.length - VIEW_WIDTH });
    expect(imageCalls(log, 'foundry-gate.png')).toHaveLength(1);
  });

  it('fills the air with furnace light, sparks, smoke, steam, heat and ash', () => {
    const road = createRoad();
    const colors = new Set();
    for (const cameraX of [0, 1250, 1750, 2900, 6024]) {
      for (let tick = 0; tick < 300; tick += 15) {
        colorsIn(frameAt(road, { cameraX, tick })).forEach((color) => colors.add(color));
      }
    }
    const { furnace, sparks, plume, steam, shimmer, ash } = theme.ambient;
    for (const color of [...furnace, ...sparks, ...plume, steam, shimmer, ...ash]) {
      expect(colors.has(color), color).toBe(true);
    }
  });

  it('lays slag, dropped pipe and hanging chain in front of the fighters along the road', () => {
    const road = createRoad();
    const colors = new Set();
    for (let cameraX = 0; cameraX <= mission.length - VIEW_WIDTH; cameraX += 340) {
      colorsIn(frameAt(road, { cameraX })).forEach((color) => colors.add(color));
    }
    for (const key of ['slag', 'pipe', 'chain', 'molten']) {
      expect(colors.has(theme.front[key]), key).toBe(true);
    }
  });
});
