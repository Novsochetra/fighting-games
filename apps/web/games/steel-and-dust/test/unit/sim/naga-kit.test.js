import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { NAGA_KIT } from '../../../src/data/enemies/boss-kits/naga.js';
import { thinkKitBoss } from '../../../src/sim/brains/enemy/boss-kit.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { createPlayingGame } from '../../support/test-game.js';

const originalRandom = Math.random;

function nagaAt(distance, { missionIndex = 10, share = 1 } = {}) {
  const game = createPlayingGame();
  game.missionIndex = missionIndex;
  game.arena = { left: 0, right: 384 };
  game.player.x = 120;
  spawnEnemy(game, 'naga', 1);
  const naga = game.fighters.find((fighter) => fighter.kind === 'naga');
  Object.assign(naga, { entering: false, x: 120 + distance, facing: -1 });
  naga.ai.cooldown = 0;
  naga.hp = share * naga.maxHp;
  return { game, naga };
}

const think = (game, naga) =>
  thinkKitBoss(game, naga, { kit: NAGA_KIT, distance: Math.abs(naga.x - game.player.x) });

describe("the Naga Raja's kit", () => {
  beforeEach(() => {
    Math.random = () => 0;
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('glides in bursts, resting on her coil between them', () => {
    const { game, naga } = nagaAt(130);
    naga.ai.cooldown = 400;
    const states = new Set();
    for (let i = 0; i < 100; i++) {
      think(game, naga);
      states.add(naga.state);
    }
    expect([...states].sort()).toEqual(['idle', 'walk']);
  });

  it('glides back from a hero who crowds her', () => {
    const { game, naga } = nagaAt(50);
    naga.ai.cooldown = 400;
    think(game, naga);
    expect(naga.walkDirection).toBe(-1);
    expect(naga.vx).toBeGreaterThan(0);
  });

  it('slashes or slams her coil on a hero in reach', () => {
    const { game, naga } = nagaAt(30);
    think(game, naga);
    expect(NAGA_KIT.close.moves).toContain(naga.move.id);
  });

  it('rolls a tide at a hero at range, and two in a row below half health', () => {
    const calm = nagaAt(200);
    think(calm.game, calm.naga);
    expect(calm.naga.move.id).toBe('tidalCoil');
    expect(calm.naga.move.tides).toHaveLength(1);
    const hurt = nagaAt(200, { share: 0.45 });
    think(hurt.game, hurt.naga);
    expect(hurt.naga.move.id).toBe('tidalCoils');
    expect(hurt.naga.move.tides).toHaveLength(2);
  });

  it('spits her Seven Heads once the tide is cooling down', () => {
    const { game, naga } = nagaAt(200);
    naga.ai.kit = { readyAt: { tidalCoil: 9999 }, ultReadyAt: 0, chain: null };
    think(game, naga);
    expect(naga.move.id).toBe('sevenHeads');
    expect(naga.move.heads).toHaveLength(7);
  });

  it('calls the Rainbow Naga below 40% on her own road, and not on another', () => {
    const own = nagaAt(150, { share: 0.39 });
    think(own.game, own.naga);
    expect(own.naga.move.id).toBe('rainbowNaga');
    const other = nagaAt(150, { missionIndex: 11, share: 0.39 });
    think(other.game, other.naga);
    expect(other.naga.move.id).not.toBe('rainbowNaga');
  });
});
