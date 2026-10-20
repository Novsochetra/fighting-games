import { describe, expect, it } from 'vitest';
import { ENEMY_TYPES } from '../../../src/data/enemies/enemy-types.js';
import { createView } from '../../../src/render/create-view.js';
import { renderFrame } from '../../../src/render/render-frame.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { FakeImage } from '../../support/fake-image.js';
import { RecordingCanvas } from '../../support/recording-canvas.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

// Bug: memory grew zone after zone. A white hit flash, a gold armor flash or the ice tint made a
// solid-color copy of the raider's whole sprite sheet (every strip and frame) and kept it for the
// rest of the session, so every new raider type and color added megabytes of canvas: more than
// 100 MB by the last zone, too much for a phone.
const UNTINTED = { flashTime: 0, armorFlash: 0, frozen: false };
const TINTS = [{ flashTime: 4 }, { armorFlash: 6 }, { frozen: true }];

function recordingView() {
  const created = [];
  const createCanvas = (width, height) => {
    const canvas = Object.assign(new RecordingCanvas(), { width, height });
    created.push(canvas);
    return canvas;
  };
  const screen = createCanvas(768, 432);
  const view = createView({
    context: screen.getContext('2d'),
    createCanvas,
    createImage: () => new FakeImage(),
    baseUrl: '',
  });
  return { view, created, before: created.length };
}

const pixels = (canvases) =>
  canvases.reduce((sum, canvas) => sum + canvas.width * canvas.height, 0);

describe('tinted sprites', () => {
  it('keep a few frame-sized copies, not a copy of every sheet in every color', () => {
    const game = createPlayingGame();
    runTicks(game, 2);
    for (const kind of Object.keys(ENEMY_TYPES)) {
      spawnEnemy(game, kind, 1);
    }
    const raiders = game.fighters.filter((fighter) => fighter.side === 'enemy');
    raiders.forEach((raider, i) => Object.assign(raider, { x: 60 + i * 18, entering: false }));
    const { view, created, before } = recordingView();
    for (const tint of TINTS) {
      raiders.forEach((raider) => Object.assign(raider, UNTINTED, tint));
      Object.assign(game.player, { flashTime: TINTS[0] === tint ? 4 : 0 });
      renderFrame(game, view);
    }
    const tinted = created.slice(before);
    expect(tinted.length).toBeGreaterThanOrEqual(raiders.length * TINTS.length);
    expect(pixels(tinted)).toBeLessThan(1_500_000);
  });
});
