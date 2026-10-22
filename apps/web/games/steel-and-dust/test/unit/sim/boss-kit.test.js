import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { KHAN_KIT } from '../../../src/data/enemies/boss-kits/khan.js';
import { thinkKitBoss } from '../../../src/sim/brains/enemy/boss-kit.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { createPlayingGame } from '../../support/test-game.js';

const originalRandom = Math.random;

function khanAt(distance, { missionIndex = 0, hp } = {}) {
  const game = createPlayingGame();
  game.missionIndex = missionIndex;
  game.player.x = 160;
  spawnEnemy(game, 'khan', 1);
  const khan = game.fighters.find((fighter) => fighter.kind === 'khan');
  Object.assign(khan, { entering: false, x: 160 + distance, facing: -1 });
  khan.ai.cooldown = 0;
  khan.hp = hp ?? khan.maxHp;
  return { game, khan };
}

const think = (game, khan) =>
  thinkKitBoss(game, khan, { kit: KHAN_KIT, distance: Math.abs(khan.x - game.player.x) });

describe("Gravel Khan's kit", () => {
  beforeEach(() => {
    Math.random = () => 0;
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('backs away from a hero who crowds him while he gathers himself', () => {
    const { game, khan } = khanAt(30);
    khan.ai.cooldown = 20;
    think(game, khan);
    expect(khan.state).toBe('walk');
    expect(khan.walkDirection).toBe(-1);
  });

  it('closes on a hero who keeps away', () => {
    const { game, khan } = khanAt(150);
    khan.ai.cooldown = 20;
    think(game, khan);
    expect(khan.walkDirection).toBe(1);
  });

  it('dashes at a hero out of reach, then waits out the dash before the next one', () => {
    const { game, khan } = khanAt(120);
    think(game, khan);
    expect(khan.move.id).toBe('crescentDash');
    Object.assign(khan, { state: 'idle', move: null });
    think(game, khan);
    expect(khan.move?.id).not.toBe('crescentDash');
  });

  it('swings at a hero in reach', () => {
    const { game, khan } = khanAt(30);
    think(game, khan);
    expect(KHAN_KIT.close.moves).toContain(khan.move.id);
  });

  it('blows his war horn only when no raider stands with him', () => {
    const { game, khan } = khanAt(65);
    spawnEnemy(game, 'grunt', -1);
    think(game, khan);
    expect(khan.move?.id).not.toBe('warHorn');
    game.fighters = game.fighters.filter((fighter) => fighter.kind !== 'grunt');
    think(game, khan);
    expect(khan.move.id).toBe('warHorn');
  });

  it("looses Khan's Tempest below 40% health on his own road, and not again for a while", () => {
    const { game, khan } = khanAt(120, { hp: 70 });
    think(game, khan);
    expect(khan.move.id).toBe('tempest');
    Object.assign(khan, { state: 'idle', move: null });
    think(game, khan);
    expect(khan.move.id).not.toBe('tempest');
  });

  it('keeps his ultimate for his own road when he comes back as a mid-boss', () => {
    const { game, khan } = khanAt(120, { missionIndex: 5, hp: 50 });
    think(game, khan);
    expect(khan.move.id).toBe('crescentDash');
  });

  it('dashes twice in a row below half health', () => {
    const { game, khan } = khanAt(120, { hp: 90 });
    think(game, khan);
    expect(khan.move.id).toBe('crescentDash');
    Object.assign(khan, { state: 'idle', move: null });
    khan.ai.cooldown = 40;
    think(game, khan);
    expect(khan.move.id).toBe('crescentDash');
    Object.assign(khan, { state: 'idle', move: null });
    think(game, khan);
    expect(khan.move?.id).not.toBe('crescentDash');
  });
});
