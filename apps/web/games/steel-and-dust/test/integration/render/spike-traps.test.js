import { describe, expect, it } from 'vitest';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { SPIKE_TRAP } from '../../../src/data/spike-traps.js';
import { createView } from '../../../src/render/create-view.js';
import { renderFrame } from '../../../src/render/render-frame.js';
import { selectMission, startPlay } from '../../../src/sim/stage/flow.js';
import { FakeImage } from '../../support/fake-image.js';
import { RecordingCanvas } from '../../support/recording-canvas.js';
import { createTestGame, runTicks } from '../../support/test-game.js';

const temple = MISSIONS.find((mission) => mission.theme === 'mirageTemple');
const UP = SPIKE_TRAP.rest + SPIKE_TRAP.warn + SPIKE_TRAP.rise + 1;

function createCanvas(width, height) {
  return Object.assign(new RecordingCanvas(), { width, height });
}

// the hero on the middle tile of a row whose spikes all stand up
function renderOnSpikes() {
  const screen = createCanvas(768, 432);
  const view = createView({
    context: screen.getContext('2d'),
    createCanvas,
    createImage: () => new FakeImage(),
    baseUrl: '',
  });
  const game = createTestGame();

  selectMission(game, temple.index);
  startPlay(game);
  runTicks(game, 2);
  const [, middle] = game.spikeTraps;
  game.camera.x = middle.x - 192;
  Object.assign(game.player, { x: middle.x, y: middle.y });
  for (const tile of game.spikeTraps) {
    tile.time = UP;
  }

  screen.recording.log.length = 0;
  renderFrame(game, view);

  return screen.recording.log;
}

describe('the spike traps in a frame of the Mirage Temple', () => {
  it('lay their tiles under a fighter on them, and draw their risen spikes again over it', () => {
    const log = renderOnSpikes();
    const hero = log.findIndex((call) => call.startsWith('drawImage(img(hero_'));
    const drawn = log
      .map((call, index) => (call.startsWith('drawImage(img(spikeTrap.png)') ? index : -1))
      .filter((index) => index !== -1);
    const under = drawn.filter((index) => index < hero);

    expect(hero).toBeGreaterThan(-1);
    expect(under).toHaveLength(3);
    expect(drawn.filter((index) => index > hero)).toHaveLength(under.length);
  });
});
