import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DJINN_KIT } from '../../../src/data/enemies/boss-kits/djinn.js';
import { thinkKitBoss } from '../../../src/sim/brains/enemy/boss-kit.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { createPlayingGame } from '../../support/test-game.js';

const originalRandom = Math.random;

function djinnAt(distance, { missionIndex = 6, hp } = {}) {
  const game = createPlayingGame();
  game.missionIndex = missionIndex;
  game.arena = { left: 0, right: 384 };
  game.player.x = 120;
  spawnEnemy(game, 'djinn', 1);
  const djinn = game.fighters.find((fighter) => fighter.kind === 'djinn');
  Object.assign(djinn, { entering: false, x: 120 + distance, facing: -1 });
  djinn.ai.cooldown = 0;
  djinn.hp = hp ?? djinn.maxHp;
  return { game, djinn };
}

const think = (game, djinn) =>
  thinkKitBoss(game, djinn, { kit: DJINN_KIT, distance: Math.abs(djinn.x - game.player.x) });

describe("the Storm Djinn's kit", () => {
  beforeEach(() => {
    Math.random = () => 0;
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('drifts to and fro at the edge of his reach while he gathers himself', () => {
    const { game, djinn } = djinnAt(120);
    djinn.ai.cooldown = 400;
    const directions = new Set();
    for (let i = 0; i < 120; i++) {
      think(game, djinn);
      directions.add(djinn.walkDirection);
    }
    expect([...directions].sort()).toEqual([-1, 1]);
  });

  it('whirls away across the arena from a hero who crowds him, then not again for a while', () => {
    const { game, djinn } = djinnAt(30);
    djinn.ai.cooldown = 400;
    think(game, djinn);
    expect(Math.abs(djinn.x - game.player.x)).toBeGreaterThan(100);
    expect(game.summons.some((summon) => summon.sprite === 'tornado')).toBe(true);
    djinn.x = game.player.x + 30;
    think(game, djinn);
    expect(djinn.x).toBe(game.player.x + 30);
  });

  it('throws the Thunder Fist at a hero a way off, and a dust devil at one further', () => {
    const near = djinnAt(150);
    think(near.game, near.djinn);
    expect(near.djinn.move.id).toBe('thunderFist');
    const far = djinnAt(350);
    think(far.game, far.djinn);
    expect(far.djinn.move.id).toBe('dustDevil');
  });

  it('raises two dust devils at once below half health', () => {
    const { game, djinn } = djinnAt(350, { hp: 130 });
    think(game, djinn);
    expect(djinn.move.id).toBe('dustDevils');
    expect(djinn.move.devils).toBe(2);
  });

  it('raises the Eye of the Storm below 40% on his own road, and not on another', () => {
    const own = djinnAt(150, { hp: 100 });
    think(own.game, own.djinn);
    expect(own.djinn.move.id).toBe('eyeOfStorm');
    const other = djinnAt(150, { missionIndex: 0, hp: 100 });
    think(other.game, other.djinn);
    expect(other.djinn.move.id).not.toBe('eyeOfStorm');
  });
});
