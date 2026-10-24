import { describe, expect, it } from 'vitest';
import { RENDER_SCALE, VIEW_WIDTH } from '../../../src/config.js';
import { CHEST_TIMING } from '../../../src/data/loot.js';
import { createView } from '../../../src/render/create-view.js';
import { drawPurse, easePurse } from '../../../src/render/hud/purse.js';
import { drawChests } from '../../../src/render/scene/loot-chest.js';
import { drawFlyingLoot, drawGroundLoot } from '../../../src/render/scene/loot.js';
import { knockOut } from '../../../src/sim/combat/knock-out.js';
import { updateLoot } from '../../../src/sim/items/loot.js';
import { FakeImage } from '../../support/fake-image.js';
import { createGridContext } from '../../support/grid-canvas.js';
import { createLootGame, spawnEnemy } from '../../support/loot-game.js';
import { RecordingCanvas } from '../../support/recording-canvas.js';

function gridView() {
  const { context, misses, counts } = createGridContext();
  context.canvas = { width: 768, height: 432 };
  const view = createView({
    context,
    createCanvas: (width, height) => Object.assign(new RecordingCanvas(), { width, height }),
    createImage: () => new FakeImage(),
    baseUrl: '',
  });
  context.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
  return { view, painter: view.painter, misses, counts };
}

function drawLoot(painter, { game, view }) {
  const sheets = view.lootSheets;
  drawChests(painter, { game, sheets });
  drawGroundLoot(painter, { game, sheets, cameraX: game.camera.x });
  drawFlyingLoot(painter, { game, sheets });
  drawPurse(painter, game, view);
}

// a road with raiders and a boss just felled, the hero close enough to pull some pieces in
function lootyGame() {
  const { game } = createLootGame();
  for (let i = 0; i < 6; i++) {
    knockOut(game, spawnEnemy(game, 'grunt', game.player.x + 12 + i * 33), 1);
  }
  knockOut(game, spawnEnemy(game, 'brute', game.player.x + 150), 1);
  return game;
}

describe('loot on the pixel grid', () => {
  it('lands every coin, gem, apple, chest frame, light beam, sparkle and the purse on whole pixels', () => {
    const { view, painter, misses, counts } = gridView();
    const game = lootyGame();
    for (let tick = 0; tick < CHEST_TIMING.gone + 40; tick++) {
      updateLoot(game);
      drawLoot(painter, { game, view });
    }
    expect(misses).toEqual([]);
    expect(counts.draws).toBeGreaterThan(3000);
  });

  it('draws only the pieces near the screen', () => {
    const { view, painter, counts } = gridView();
    const { game } = createLootGame();
    const near = { kind: 'coin', x: 50, y: 150, time: 0, phase: 0, landed: true };
    const far = { ...near, x: VIEW_WIDTH + 200 };
    const drawsFor = (loot) => {
      game.loot = loot;
      const before = counts.draws;
      drawGroundLoot(painter, { game, sheets: view.lootSheets, cameraX: 0 });
      return counts.draws - before;
    };
    const one = drawsFor([near]);
    expect(one).toBeGreaterThan(0);
    expect(drawsFor([near, far, { ...far, x: -200 }])).toBe(one);
  });

  it('draws nothing of a piece whose sheet is not in yet', () => {
    const { view, painter, counts } = gridView();
    const { game } = createLootGame();
    game.loot = [{ kind: 'gem', x: 50, y: 150, time: 0, phase: 0, landed: true }];
    view.lootSheets.ready = {};
    const before = counts.draws;
    drawGroundLoot(painter, { game, sheets: view.lootSheets, cameraX: 0 });
    drawFlyingLoot(painter, { game, sheets: view.lootSheets });
    expect(counts.draws - before).toBeLessThanOrEqual(1);
  });
});

describe('the purse count', () => {
  it('counts up toward the purse, a coin at a time near the end, and drops at once', () => {
    expect(easePurse(0, 100)).toBeGreaterThan(1);
    expect(easePurse(99, 100)).toBe(100);
    expect(easePurse(100, 100)).toBe(100);
    expect(easePurse(250, 0)).toBe(0);
  });
});
