import { describe, expect, it } from 'vitest';
import { VIEW_HEIGHT, VIEW_WIDTH } from '../../../src/config.js';
import { PAINTED_BACKDROPS } from '../../../src/data/backdrops/index.js';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { createView } from '../../../src/render/create-view.js';
import { renderFrame } from '../../../src/render/render-frame.js';
import { selectMission, startPlay } from '../../../src/sim/stage/flow.js';
import { groundAt } from '../../../src/sim/stage/terrain.js';
import { FakeImage } from '../../support/fake-image.js';
import { RecordingCanvas } from '../../support/recording-canvas.js';
import { createTestGame, runTicks } from '../../support/test-game.js';

// Bug: under the raised stretches of most roads the cross-section ran out before the bottom of the
// screen and its last row was stretched down the rest of the way, a flat dark void under every
// high hill, terrace and stair (striped where that row was not one colour), worst on Angkor Wat,
// where every sheer step and both banks of the moat's breach also ended in a ruler-straight cut.
// Those roads' bodies now lie level at the world's rows, so every step stands on the same earth
// or courses down to the bottom of the screen, and on Angkor Wat the ends of its courses jut, sit
// flush or have fallen back where a step cuts through them, the breach's two banks each broken
// its own way
const ANGKOR_WAT = 10;

// the camera that shows a mission's highest ground in the middle of the screen, a screen in from
// either end of the road
function highestGround(game) {
  let highest = VIEW_WIDTH;

  for (let x = VIEW_WIDTH; x < game.terrain.heights.length - VIEW_WIDTH; x++) {
    if (groundAt(game.terrain, x) < groundAt(game.terrain, highest)) {
      highest = x;
    }
  }

  return highest - VIEW_WIDTH / 2;
}

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

const roads = MISSIONS.map((mission, index) => [mission.theme, index]);
const roadsWithBodies = roads.filter(([theme]) => PAINTED_BACKDROPS[theme].deep);

describe.each(roads)('the highest ground of %s', (_theme, mission) => {
  it('runs no row of its cross-section on down to the bottom of the screen', () => {
    const log = renderRoad(mission, highestGround);
    const runOn = ([, , , height, , , , drawnHeight]) => height === 1 && drawnHeight > 1;

    expect(draws(log, 'img(ground.png)').filter(runOn)).toEqual([]);
  });
});

describe.each(roadsWithBodies)('the raised road of %s', (_theme, mission) => {
  it('stands on a body laid at the world rows, down to the bottom of the screen', () => {
    const log = renderRoad(mission, highestGround);
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
