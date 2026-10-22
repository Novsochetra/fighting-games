import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ENEMY_SPRITES } from '../../../src/data/enemies/enemy-sprites.js';
import { startMove } from '../../../src/sim/fighters/actions.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { groundAt } from '../../../src/sim/stage/terrain.js';
import { readPngAlpha } from '../../support/png-alpha.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';
import { buildTerrain, useTerrain } from '../../support/terrain-game.js';

// Bug: the Meltdown's flame lances did not seem to come from the Furnace Knight's chest. Each lance
// took its height from the ground under its tip, so over the Iron Works' rising road it flew higher
// than the furnace it left; and the flame in the furnace's mouth on the firing frame was cut off
// square where the drawn beam had been trimmed away
const originalRandom = Math.random;
const GAME = new URL('../../../', import.meta.url);

function firingFrameFlame() {
  const { file, frameWidth, frameHeight, strips } = ENEMY_SPRITES.furnace;
  const sheet = readPngAlpha(new URL(`assets/sprites/enemies/${file}`, GAME));
  const top = strips.meltdown.row * frameHeight;
  const left = 4 * frameWidth;
  const isFlame = (x, y) => {
    const [red, green] = sheet.rgb(left + x, top + y);
    return sheet.alpha(left + x, top + y) > 0 && red > 200 && green > 100;
  };
  const columns = [];
  for (let x = 0; x < frameWidth; x++) {
    let rows = 0;
    for (let y = 0; y < frameHeight; y++) {
      rows += isFlame(x, y) ? 1 : 0;
    }
    columns.push(rows);
  }
  return columns.slice(0, columns.findLastIndex((rows) => rows > 0) + 1);
}

describe('the Furnace Knight’s flame lances', () => {
  beforeEach(() => {
    Math.random = seededRandom(8);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('fly level at the height they left his chest, over a road that rises ahead', () => {
    const terrain = buildTerrain({
      ground: [
        [0, 0],
        [120, 6],
        [240, 6],
        [300, 0],
      ],
    });
    const game = useTerrain(createPlayingGame(), terrain);
    game.arena = { left: 0, right: 384 };
    game.player.x = 40;
    game.player.y = groundAt(terrain, 40);
    game.player.invincible = 9999;
    spawnEnemy(game, 'furnace', 1);
    const knight = game.boss;
    Object.assign(knight, { entering: false, x: 340, y: groundAt(terrain, 340), facing: -1 });
    knight.ai.cooldown = 9999;
    startMove(game, knight, 'meltdown');
    runTicks(game, 73);
    const lance = game.projectiles.find((shot) => shot.kind === 'flameLance');
    const chest = lance.y;
    const heights = new Set();
    while (game.projectiles.includes(lance) && lance.x > 60) {
      runTicks(game, 1);
      knight.ai.cooldown = 9999;
      heights.add(lance.y);
    }
    expect([...heights]).toEqual([chest]);
    expect(knight.y - chest).toBeCloseTo(19 * knight.scale, 5);
  });

  it('leave a flame on the firing frame that ends in a point, not cut off square', () => {
    const flame = firingFrameFlame();
    expect(flame.at(-1)).toBeLessThanOrEqual(3);
    expect(flame.at(-2)).toBeLessThanOrEqual(3);
  });
});
