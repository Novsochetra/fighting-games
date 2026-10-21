import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import {
  raiseComboSoldiers,
  raiseSoldier,
  SOLDIER_TIMING,
} from '../../../src/sim/summons/soldiers.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

const originalRandom = Math.random;
const HIT = { damage: 5, knockback: [1, -2], knockdown: true, hitstop: 3, hitstun: 20 };
const soldiersOf = (game) => game.summons.filter((summon) => summon.kind === 'soldier');

function gameWithRaider() {
  const game = createPlayingGame({ settings: { hero: 'angkor' } });
  spawnEnemy(game, 'grunt', 1);
  const raider = game.fighters.find((fighter) => fighter.side === 'enemy');
  Object.assign(raider, { entering: false, x: game.player.x + 80, state: 'idle' });
  raider.ai.cooldown = 999;
  return { game, raider };
}

describe('the relief soldiers in a running fight', () => {
  beforeEach(() => {
    Math.random = seededRandom(17);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('thrusts once at the raider in front of it, then crumbles and is gone', () => {
    const { game, raider } = gameWithRaider();
    raiseSoldier(game, { x: raider.x - 20, direction: 1, hit: HIT });
    expect(soldiersOf(game)[0].hero).toBe('angkor');
    runTicks(game, SOLDIER_TIMING.strike - 1);
    expect(raider.hp).toBe(raider.maxHp);
    runTicks(game, 6);
    expect(raider.maxHp - raider.hp).toBe(5);
    runTicks(game, SOLDIER_TIMING.end);
    expect(raider.maxHp - raider.hp).toBe(5);
    expect(soldiersOf(game)).toEqual([]);
  });

  it('leaves a raider at its back alone', () => {
    const { game, raider } = gameWithRaider();
    raiseSoldier(game, { x: raider.x + 20, direction: 1, hit: HIT });
    runTicks(game, SOLDIER_TIMING.end + 1);
    expect(raider.hp).toBe(raider.maxHp);
  });

  it('only plays when it has no hit of its own, as in the ultimate', () => {
    const { game, raider } = gameWithRaider();
    raiseSoldier(game, { x: raider.x - 20, direction: 1 });
    runTicks(game, SOLDIER_TIMING.end + 1);
    expect(raider.hp).toBe(raider.maxHp);
  });

  it('a finisher raises one soldier per count, each a beat behind and further ahead', () => {
    const { game } = gameWithRaider();
    raiseComboSoldiers(game, game.player, 3);
    const soldiers = soldiersOf(game);
    const ahead = (soldier) => (soldier.x - game.player.x) * game.player.facing;
    expect(soldiers.every((soldier) => soldier.direction === game.player.facing)).toBe(true);
    expect(soldiers.map((soldier) => -soldier.time)).toEqual([0, 5, 10]);
    expect(ahead(soldiers[1])).toBeGreaterThan(ahead(soldiers[0]));
    expect(ahead(soldiers[2])).toBeGreaterThan(ahead(soldiers[1]));
  });
});
