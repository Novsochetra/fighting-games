import { describe, expect, it } from 'vitest';
import { createView } from '../../../src/render/create-view.js';
import { renderFrame } from '../../../src/render/render-frame.js';
import { selectMission, startPlay } from '../../../src/sim/stage/flow.js';
import { FakeImage } from '../../support/fake-image.js';
import { RecordingCanvas } from '../../support/recording-canvas.js';
import { createTestGame, runTicks } from '../../support/test-game.js';

// Bug: the Angkor moat's water was laid over the breach after the road, so it covered the foot of
// each bank's rock face: the face's dark outline stopped at the waterline, and under it the water's
// edge ran on past the face, a strip of it out of line with the bank above. The water now lies
// behind the road, and each bank's face stands over its edge and runs straight down into it
const ANGKOR_WAT = 10;
const FACE_WIDTH = 12;

function createCanvas(width, height) {
  return Object.assign(new RecordingCanvas(), { width, height });
}

function renderMoat() {
  const screen = createCanvas(768, 432);
  const view = createView({
    context: screen.getContext('2d'),
    createCanvas,
    createImage: () => new FakeImage(),
    baseUrl: '',
  });
  const game = createTestGame();

  selectMission(game, ANGKOR_WAT);
  startPlay(game);
  runTicks(game, 2);
  const [moat] = game.terrain.water;
  game.camera.x = moat.from - 192;
  const log = screen.recording.log;
  log.length = 0;
  renderFrame(game, view);

  return { log, moat };
}

// the face of a bank, hung over the breach from its lip, by where it stands along the road
function faceAt(log, x) {
  return log.findIndex(
    (call) =>
      /^drawImage\((img\(cliff\.png\)|canvas\(12x64,)/.test(call) && call.includes(`,${x},`),
  );
}

describe('the Angkor moat between its banks', () => {
  it('is drawn before the rock face of either bank, so the faces stand over its edges', () => {
    const { log, moat } = renderMoat();
    const water = log.findIndex((call) => call.startsWith('drawImage(img(moatWater.png),'));
    const nearBank = faceAt(log, moat.from + 2 - FACE_WIDTH);
    const farBank = faceAt(log, moat.to - 2);

    expect(water).toBeGreaterThan(-1);
    expect(nearBank).toBeGreaterThan(water);
    expect(farBank).toBeGreaterThan(water);
  });
});
