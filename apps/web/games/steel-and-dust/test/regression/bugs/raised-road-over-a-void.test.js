import { describe, expect, it } from 'vitest';
import { VIEW_HEIGHT } from '../../../src/config.js';
import { createView } from '../../../src/render/create-view.js';
import { renderFrame } from '../../../src/render/render-frame.js';
import { selectMission, startPlay } from '../../../src/sim/stage/flow.js';
import { FakeImage } from '../../support/fake-image.js';
import { RecordingCanvas } from '../../support/recording-canvas.js';
import { createTestGame, runTicks } from '../../support/test-game.js';

// Bug: under each raised stretch of the Angkor Wat and Bayon roads the cross-section ran out a few
// dozen rows down and its last row was stretched to the bottom of the screen, a flat dark void
// (striped on the Bayon) under every terrace and stair, and every sheer step and both banks of the
// moat's breach ended in a ruler-straight cut. The roads' bodies now lie level at the world's rows,
// so every step stands on the same courses and earth down to the bottom of the screen, and on
// Angkor Wat the ends of its courses jut, sit flush or have fallen back where a step cuts through
// them, the breach's two banks each broken its own way
const ANGKOR_WAT = 10;
const BAYON = 11;

function createCanvas(width, height) {
  return Object.assign(new RecordingCanvas(), { width, height });
}

function renderRoad(missionIndex, cameraAt) {
  const screen = createCanvas(768, 432);
  const view = createView({
    context: screen.getContext('2d'),
    createCanvas,
    createImage: () => new FakeImage(),
    baseUrl: '',
  });
  const game = createTestGame();

  selectMission(game, missionIndex);
  startPlay(game);
  runTicks(game, 2);
  game.camera.x = cameraAt(game);
  const log = screen.recording.log;
  log.length = 0;
  renderFrame(game, view);

  return log;
}

// the arguments after the picture of a draw: source x, y, width, height, then x, y, width, height
const argumentsOf = (call) => call.slice(call.indexOf(')') + 2, -1).split(',');

function draws(log, id) {
  return log
    .filter((call) => call.startsWith(`drawImage(${id}`))
    .map((call) => argumentsOf(call).map(Number));
}

describe.each([
  ['Angkor Wat', ANGKOR_WAT, 1480],
  ['the Bayon', BAYON, 1380],
])('the raised road of %s', (_name, mission, cameraX) => {
  it('runs no row of its cross-section on down under a high step', () => {
    const log = renderRoad(mission, () => cameraX);
    const runOn = ([, , , height, , , , drawnHeight]) => height === 1 && drawnHeight > 1;

    expect(draws(log, 'img(ground.png)').filter(runOn)).toEqual([]);
  });

  it('stands on a body laid at the world rows, down to the bottom of the screen', () => {
    const log = renderRoad(mission, () => cameraX);
    const body = draws(log, 'img(deep.png)');

    expect(body.length).toBeGreaterThan(0);
    for (const [, sourceY, , height, , y] of body) {
      expect(sourceY).toBe(y);
      expect(y + height).toBe(VIEW_HEIGHT);
    }
  });
});

describe('the banks of the Angkor moat', () => {
  it('are broken each its own way down out of sight, not cut straight', () => {
    const log = renderRoad(ANGKOR_WAT, (game) => game.terrain.water[0].from - 192);
    const near = draws(log, 'img(breach.png)');
    const far = draws(log, 'canvas(32x216,');

    expect(near).toHaveLength(1);
    expect(far).toHaveLength(1);
    for (const [, , , height, , y] of [...near, ...far]) {
      expect(y + height).toBe(VIEW_HEIGHT);
    }
  });
});
