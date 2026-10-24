import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FURNACE_KIT } from '../../../src/data/enemies/boss-kits/furnace.js';
import { thinkKitBoss } from '../../../src/sim/brains/enemy/boss-kit.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { createPlayingGame } from '../../support/test-game.js';

const originalRandom = Math.random;

function knightAt(distance, { missionIndex = 7, share = 1 } = {}) {
  const game = createPlayingGame();
  game.missionIndex = missionIndex;
  game.player.x = 120;
  spawnEnemy(game, 'furnace', 1);
  const knight = game.fighters.find((fighter) => fighter.kind === 'furnace');
  Object.assign(knight, { entering: false, x: 120 + distance, facing: -1 });
  knight.ai.cooldown = 0;
  knight.hp = share * knight.maxHp;
  return { game, knight };
}

const think = (game, knight) =>
  thinkKitBoss(game, knight, { kit: FURNACE_KIT, distance: Math.abs(knight.x - game.player.x) });

describe("the Furnace Knight's kit", () => {
  beforeEach(() => {
    Math.random = () => 0;
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('walks at the hero and never steps back, venting steam as he comes', () => {
    const { game, knight } = knightAt(150);
    knight.ai.cooldown = 400;
    const directions = new Set();
    for (let i = 0; i < 220; i++) {
      think(game, knight);
      directions.add(knight.walkDirection);
    }
    expect([...directions]).toEqual([1]);
    expect(game.summons.some((summon) => summon.sprite === 'steam')).toBe(true);
  });

  it('sweeps the Fire Flail at a hero near him, and lobs a Slag Pot at one far off', () => {
    const near = knightAt(70);
    think(near.game, near.knight);
    expect(near.knight.move.id).toBe('fireFlail');
    const far = knightAt(200);
    think(far.game, far.knight);
    expect(far.knight.move.id).toBe('slagPot');
  });

  it('leaves the ground burning longer below half health', () => {
    const { game, knight } = knightAt(70, { share: 0.47 });
    think(game, knight);
    expect(knight.move.id).toBe('fireFlailHot');
    expect(knight.move.blaze.life).toBeGreaterThan(knight.def.boss ? 240 : 0);
  });

  it('opens the Meltdown below 40% on his own road, and not on another', () => {
    const own = knightAt(150, { share: 0.37 });
    think(own.game, own.knight);
    expect(own.knight.move.id).toBe('meltdown');
    const other = knightAt(150, { missionIndex: 0, share: 0.37 });
    think(other.game, other.knight);
    expect(other.knight.move.id).not.toBe('meltdown');
  });
});
