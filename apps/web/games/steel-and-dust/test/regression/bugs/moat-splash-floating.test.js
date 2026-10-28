import { describe, expect, it } from 'vitest';
import { VIEW_HEIGHT } from '../../../src/config.js';
import { createView } from '../../../src/render/create-view.js';
import { renderFrame } from '../../../src/render/render-frame.js';
import { createFighter } from '../../../src/sim/fighters/create-fighter.js';
import { selectMission, startPlay } from '../../../src/sim/stage/flow.js';
import { groundAt } from '../../../src/sim/stage/terrain.js';
import { FakeImage } from '../../support/fake-image.js';
import { RecordingCanvas } from '../../support/recording-canvas.js';
import { createTestGame, runTicks } from '../../support/test-game.js';

// Bug: a raider falling in the Angkor moat threw up a splash whose flat foot stood on the
// waterline, over the painted lake, drawn in front of everything, so it seemed to float in the
// breach. It now bursts up out of the pit from below the bottom of the screen, its foot out of
// sight however hard the screen shakes, and is drawn with the water, behind the banks' rock faces
const ANGKOR_WAT = 10;
const FACE_WIDTH = 12;
// the hardest any hit shakes the screen, up or down
const HARDEST_SHAKE = 6;

function createCanvas(width, height) {
  return Object.assign(new RecordingCanvas(), { width, height });
}

// a raider dropping into the middle of the breach, a few ticks into its splash, all on screen
function splashing() {
  const game = createTestGame();
  selectMission(game, ANGKOR_WAT);
  startPlay(game);
  const [moat] = game.terrain.water;
  const [heroX, raiderX] = [moat.from - 30, (moat.from + moat.to) / 2];
  const raider = createFighter('enemy', 'grunt', raiderX, moat.level);
  Object.assign(raider, { airborne: true, state: 'juggle', vy: 3 });
  Object.assign(game.player, { x: heroX, y: groundAt(game.terrain, heroX) });
  game.fighters = [game.player, raider];
  game.camera.x = moat.from - 192;
  runTicks(game, 8);

  return { game, moat, splash: game.summons.find((summon) => summon.kind === 'splash') };
}

function renderLog(game) {
  const screen = createCanvas(768, 432);
  const view = createView({
    context: screen.getContext('2d'),
    createCanvas,
    createImage: () => new FakeImage(),
    baseUrl: '',
  });
  const log = screen.recording.log;

  log.length = 0;
  renderFrame(game, view);

  return log;
}

function drawnAt(log, pattern) {
  return log.findIndex((call) => pattern.test(call));
}

describe('the splash of a raider falling in the Angkor moat', () => {
  it('bursts up from below the bottom of the screen, its foot out of sight however it shakes', () => {
    const { splash } = splashing();

    expect(splash.y).toBeGreaterThan(VIEW_HEIGHT + HARDEST_SHAKE);
  });

  it('is drawn with the water, before the rock face of either bank', () => {
    const { game, moat } = splashing();
    const log = renderLog(game);
    const splash = drawnAt(log, /^drawImage\(img\(splash\.png\)/);
    const face = (x) =>
      drawnAt(log, new RegExp(`^drawImage\\((img\\(cliff\\.png\\)|canvas\\(12x64,).*,${x},`));

    expect(splash).toBeGreaterThan(-1);
    expect(face(moat.from + 2 - FACE_WIDTH)).toBeGreaterThan(splash);
    expect(face(moat.to - 2)).toBeGreaterThan(splash);
  });
});
