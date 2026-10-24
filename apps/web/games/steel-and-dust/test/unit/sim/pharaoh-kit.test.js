import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PHARAOH_KIT } from '../../../src/data/enemies/boss-kits/pharaoh.js';
import { thinkKitBoss } from '../../../src/sim/brains/enemy/boss-kit.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { createPlayingGame } from '../../support/test-game.js';

const originalRandom = Math.random;

function pharaohAt(distance, { missionIndex = 8, share = 1 } = {}) {
  const game = createPlayingGame();
  game.missionIndex = missionIndex;
  game.arena = { left: 0, right: 384 };
  game.player.x = 120;
  spawnEnemy(game, 'pharaoh', 1);
  const pharaoh = game.fighters.find((fighter) => fighter.kind === 'pharaoh');
  Object.assign(pharaoh, { entering: false, x: 120 + distance, facing: -1 });
  pharaoh.ai.cooldown = 0;
  pharaoh.hp = share * pharaoh.maxHp;
  return { game, pharaoh };
}

const think = (game, pharaoh) =>
  thinkKitBoss(game, pharaoh, {
    kit: PHARAOH_KIT,
    distance: Math.abs(pharaoh.x - game.player.x),
  });

const aCopy = { x: 300, y: 200, facing: -1, time: 0, popTime: -1, fireIn: -1, cast: -1 };

describe("the Sand Pharaoh's kit", () => {
  beforeEach(() => {
    Math.random = () => 0;
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('glides slowly to and fro at the middle distance while he gathers himself', () => {
    const { game, pharaoh } = pharaohAt(130);
    pharaoh.ai.cooldown = 400;
    const directions = new Set();
    for (let i = 0; i < 150; i++) {
      think(game, pharaoh);
      directions.add(pharaoh.walkDirection);
    }
    expect([...directions].sort()).toEqual([-1, 1]);
  });

  it('dissolves away from a hero who crowds him', () => {
    const { game, pharaoh } = pharaohAt(40);
    pharaoh.ai.cooldown = 400;
    think(game, pharaoh);
    expect(pharaoh.move.id).toBe('mirageBlink');
  });

  it('casts his copies, and pours scarabs instead while copies still stand', () => {
    const fresh = pharaohAt(150);
    think(fresh.game, fresh.pharaoh);
    expect(fresh.pharaoh.move.id).toBe('mirageClones');
    const copied = pharaohAt(150);
    copied.pharaoh.mirages = [{ ...aCopy }];
    think(copied.game, copied.pharaoh);
    expect(copied.pharaoh.move.id).toBe('scarabCarpet');
  });

  it('casts copies that fire below half health', () => {
    const { game, pharaoh } = pharaohAt(150, { share: 0.48 });
    think(game, pharaoh);
    expect(pharaoh.move.id).toBe('mirageVolley');
    expect(pharaoh.move.mirages.firing).toBe(true);
  });

  it('calls the Curse of the Sun below 40% on his own road, and not on another', () => {
    const own = pharaohAt(150, { share: 0.38 });
    think(own.game, own.pharaoh);
    expect(own.pharaoh.move.id).toBe('curseOfSun');
    const other = pharaohAt(150, { missionIndex: 11, share: 0.38 });
    think(other.game, other.pharaoh);
    expect(other.pharaoh.move.id).not.toBe('curseOfSun');
  });
});
