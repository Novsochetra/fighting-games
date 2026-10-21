import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { igniteTarget } from '../../../src/sim/summons/burn.js';
import { releasePhoenix } from '../../../src/sim/summons/phoenix.js';
import { raisePillar } from '../../../src/sim/summons/pillars.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

const originalRandom = Math.random;
const HIT = { damage: 5, knockback: [0.5, -4], launch: true, hitstop: 3, hitstun: 20 };
const burnsOn = (game, raider) =>
  game.summons.some((summon) => summon.kind === 'burn' && summon.target === raider);

function gameWithRaider() {
  const game = createPlayingGame({ settings: { hero: 'ember' } });
  spawnEnemy(game, 'grunt', 1);
  const raider = game.fighters.find((fighter) => fighter.side === 'enemy');
  Object.assign(raider, { entering: false, x: game.player.x + 80, state: 'idle' });
  raider.ai.cooldown = 999;
  return { game, raider };
}

describe("the Ember Shade's fire in a running fight", () => {
  beforeEach(() => {
    Math.random = seededRandom(11);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('a burning raider loses 2 health every 24 ticks without flinching, then the fire goes out', () => {
    const { game, raider } = gameWithRaider();
    igniteTarget(game, raider, 72);
    runTicks(game, 73);
    expect(raider.maxHp - raider.hp).toBe(6);
    expect(raider.state).not.toBe('hurt');
    expect(burnsOn(game, raider)).toBe(false);
  });

  it('setting a burning raider alight again only makes it burn longer', () => {
    const { game, raider } = gameWithRaider();
    igniteTarget(game, raider, 48);
    runTicks(game, 10);
    igniteTarget(game, raider, 100);
    expect(game.summons.filter((summon) => summon.kind === 'burn')).toHaveLength(1);
    runTicks(game, 80);
    expect(burnsOn(game, raider)).toBe(true);
  });

  it('a raider the fire burns down is knocked out', () => {
    const { game, raider } = gameWithRaider();
    raider.hp = 2;
    igniteTarget(game, raider, 60);
    runTicks(game, 25);
    expect(raider.state).toBe('ko');
    expect(burnsOn(game, raider)).toBe(false);
  });

  it('a flame pillar launches the raider over it once and leaves it burning', () => {
    const { game, raider } = gameWithRaider();
    raisePillar(game, { x: raider.x, scale: 1, hit: HIT, burn: 60 });
    runTicks(game, 8);
    expect(raider.hp).toBe(raider.maxHp - 5);
    expect(raider.state).toBe('juggle');
    expect(burnsOn(game, raider)).toBe(true);
    runTicks(game, 40);
    expect(game.summons.filter((summon) => summon.kind === 'pillar')).toEqual([]);
  });

  it('the phoenix strikes a raider once on each leg of its flight that crosses it', () => {
    const { game, raider } = gameWithRaider();
    const { x, y } = raider;
    const flight = [
      [0, x - 120, y - 20],
      [20, x + 120, y - 20],
      [40, x - 120, y - 20],
    ];
    releasePhoenix(game, { flight, hit: HIT, burn: 30, scale: 1 });
    runTicks(game, 41);
    expect(raider.maxHp - raider.hp).toBeGreaterThanOrEqual(10);
    expect(game.summons.filter((summon) => summon.kind === 'phoenix')).toEqual([]);
  });
});
