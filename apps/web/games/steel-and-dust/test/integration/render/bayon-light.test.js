import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { BOSS_ULT_COLORS } from '../../../src/art/boss-colors.js';
import { FX_COLORS } from '../../../src/art/fx-colors.js';
import { createView } from '../../../src/render/create-view.js';
import { drawGroundHazards, drawProjectiles } from '../../../src/render/fx/hazards.js';
import { createPainter } from '../../../src/render/painter.js';
import { renderFrame } from '../../../src/render/render-frame.js';
import { startMove } from '../../../src/sim/fighters/actions.js';
import { FACE_TIMES } from '../../../src/sim/hazards/stone-faces.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { FakeImage } from '../../support/fake-image.js';
import { RecordingCanvas, createRecordingContext } from '../../support/recording-canvas.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

const originalRandom = Math.random;
const BAYON_KINDS = new Set(['gazePillar', 'figRoot', 'stoneFace']);

function bayonArena() {
  const game = createPlayingGame();
  game.missionIndex = 11;
  game.arena = { left: 0, right: 384 };
  game.player.x = 120;
  spawnEnemy(game, 'guardian', 1);
  const guardian = game.boss;
  Object.assign(guardian, { entering: false, x: game.player.x + 170, facing: -1 });
  guardian.ai.cooldown = 9999;
  return { game, guardian };
}

function createCanvas(width, height) {
  return Object.assign(new RecordingCanvas(), { width, height });
}

// the guardian's own effects as the real fight leaves them, drawn under and over the fighters, with
// Math.random barred while they draw
function drawBayonEffects(game) {
  const { context, log } = createRecordingContext(null);
  const painter = createPainter(context);
  const shots = game.projectiles.filter((shot) => BAYON_KINDS.has(shot.kind));
  const simRandom = Math.random;
  Math.random = () => {
    throw new Error('drawing called Math.random');
  };
  try {
    drawGroundHazards(painter, shots, { ready: {} });
    drawProjectiles(painter, shots, { ready: {} });
  } finally {
    Math.random = simRandom;
  }
  return log;
}

const offGrid = (log) =>
  log
    .filter((call) => call.startsWith('fillRect('))
    .filter((call) =>
      call
        .slice('fillRect('.length, -1)
        .split(',')
        .map(Number)
        .some((value) => Math.abs(value * 2 - Math.round(value * 2)) > 1e-9),
    );

// plays the move out, drawing the effects it leaves every tick
function playAndDraw(game, guardian, ticks) {
  const frames = [];
  for (let i = 0; i < ticks; i++) {
    runTicks(game, 1);
    guardian.ai.cooldown = 9999;
    frames.push(drawBayonEffects(game));
  }
  return frames;
}

describe("the Bayon Guardian's light in a fight", () => {
  beforeEach(() => {
    Math.random = seededRandom(12);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('draws his gaze, its rune rings, the cracks and the beams on the screen-pixel grid', () => {
    const { game, guardian } = bayonArena();
    const drawn = [];
    for (const move of ['stoneGlare', 'figThicket', 'fourFaces']) {
      startMove(game, guardian, move);
      drawn.push(...playAndDraw(game, guardian, 160));
    }
    const fills = drawn.flat().filter((call) => call.startsWith('fillRect(')).length;
    expect(fills).toBeGreaterThan(10000);
    expect(drawn.flatMap(offGrid)).toEqual([]);
  });

  it("breathes the stone face's beam over the world he dims for his ultimate", () => {
    const { game, guardian } = bayonArena();
    startMove(game, guardian, 'fourFaces');
    const first = guardian.move.faces[0].at;
    runTicks(game, first + FACE_TIMES.fire + 6);
    expect(game.projectiles.some((shot) => shot.kind === 'stoneFace')).toBe(true);
    const screen = createCanvas(768, 432);
    const view = createView({
      context: screen.getContext('2d'),
      createCanvas,
      createImage: () => new FakeImage(),
      baseUrl: '',
    });
    renderFrame(game, view);
    const log = screen.recording.log;
    const dim = log.indexOf(`fillStyle=${BOSS_ULT_COLORS.guardian.dim}`);
    const beamEdge = log.lastIndexOf(`fillStyle=${FX_COLORS.gazeDeep}`);
    expect(dim).toBeGreaterThan(-1);
    expect(beamEdge).toBeGreaterThan(dim);
  });
});
