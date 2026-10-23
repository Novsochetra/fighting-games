import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { OX_KIT } from '../../../src/data/enemies/boss-kits/ox.js';
import { thinkKitBoss } from '../../../src/sim/brains/enemy/boss-kit.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { createPlayingGame } from '../../support/test-game.js';

const originalRandom = Math.random;

function oxAt(distance, { missionIndex = 9, hp } = {}) {
  const game = createPlayingGame();
  game.missionIndex = missionIndex;
  game.player.x = 120;
  spawnEnemy(game, 'brute', 1);
  const ox = game.fighters.find((fighter) => fighter.kind === 'brute');
  Object.assign(ox, { entering: false, x: 120 + distance, facing: -1 });
  ox.ai.cooldown = 0;
  ox.hp = hp ?? ox.maxHp;
  return { game, ox };
}

const think = (game, ox) =>
  thinkKitBoss(game, ox, { kit: OX_KIT, distance: Math.abs(ox.x - game.player.x) });

describe("the Warden Ox's kit", () => {
  beforeEach(() => {
    Math.random = () => 0;
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('comes on in measured strides, halting between them, and never gives ground', () => {
    const { game, ox } = oxAt(200);
    ox.ai.cooldown = 400;
    const directions = [];
    for (let i = 0; i < 160; i++) {
      think(game, ox);
      directions.push(ox.walkDirection * (ox.state === 'walk' ? 1 : 0));
    }
    expect(new Set(directions)).toEqual(new Set([1, 0]));
  });

  it('throws the Chain Hook at a hero standing off from him', () => {
    const { game, ox } = oxAt(160);
    think(game, ox);
    expect(ox.move.id).toBe('chainHook');
  });

  it('raises his guard against a hero who crowds him', () => {
    const { game, ox } = oxAt(60);
    think(game, ox);
    expect(ox.move.id).toBe('guardCounter');
  });

  it('chops twice below half health', () => {
    const { game, ox } = oxAt(160, { hp: 160 });
    think(game, ox);
    expect(ox.move.id).toBe('chainHookTwice');
    expect(ox.move.hook.chop).toBe('hookChopTwice');
  });

  it("swings into the Executioner's Round below 40% on his own road, and not on another", () => {
    const own = oxAt(160, { hp: 120 });
    think(own.game, own.ox);
    expect(own.ox.move.id).toBe('executionersRound');
    const other = oxAt(160, { missionIndex: 0, hp: 120 });
    think(other.game, other.ox);
    expect(other.ox.move.id).not.toBe('executionersRound');
  });
});
