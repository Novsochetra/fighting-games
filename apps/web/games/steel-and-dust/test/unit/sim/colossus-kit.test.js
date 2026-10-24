import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { COLOSSUS_KIT } from '../../../src/data/enemies/boss-kits/colossus.js';
import { thinkKitBoss } from '../../../src/sim/brains/enemy/boss-kit.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { createPlayingGame } from '../../support/test-game.js';

const originalRandom = Math.random;

function colossusAt(distance, { missionIndex = 1, share = 1 } = {}) {
  const game = createPlayingGame();
  game.missionIndex = missionIndex;
  game.player.x = 120;
  spawnEnemy(game, 'colossus', 1);
  const colossus = game.fighters.find((fighter) => fighter.kind === 'colossus');
  Object.assign(colossus, { entering: false, x: 120 + distance, facing: -1 });
  colossus.ai.cooldown = 0;
  colossus.hp = share * colossus.maxHp;
  return { game, colossus };
}

const think = (game, colossus) =>
  thinkKitBoss(game, colossus, {
    kit: COLOSSUS_KIT,
    distance: Math.abs(colossus.x - game.player.x),
  });

describe("the Rust Colossus's kit", () => {
  beforeEach(() => {
    Math.random = () => 0;
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('walks at the hero while he gathers himself, and stands his ground when crowded', () => {
    const { game, colossus } = colossusAt(120);
    colossus.ai.cooldown = 20;
    think(game, colossus);
    expect(colossus.walkDirection).toBe(1);
    colossus.x = game.player.x + 30;
    think(game, colossus);
    expect(colossus.state).toBe('idle');
  });

  it('stomps a spike line at a hero a few steps away', () => {
    const { game, colossus } = colossusAt(100);
    think(game, colossus);
    expect(colossus.move.id).toBe('spikeLine');
  });

  it('lobs a boulder at a hero far away', () => {
    const { game, colossus } = colossusAt(260);
    think(game, colossus);
    expect(colossus.move.id).toBe('boulderLob');
  });

  it('stomps spikes both ways below half health', () => {
    const { game, colossus } = colossusAt(100, { share: 0.46 });
    think(game, colossus);
    expect(colossus.move.id).toBe('spikeCross');
  });

  it('calls the Landslide below 40% on his own road, and not as a mid-boss', () => {
    const own = colossusAt(100, { share: 0.38 });
    think(own.game, own.colossus);
    expect(own.colossus.move.id).toBe('landslide');
    const mid = colossusAt(100, { missionIndex: 7, share: 0.38 });
    think(mid.game, mid.colossus);
    expect(mid.colossus.move.id).toBe('spikeCross');
  });
});
