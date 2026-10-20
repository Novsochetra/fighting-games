import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { GROUND_Y } from '../../../src/config.js';
import { freezeTarget } from '../../../src/sim/combat/freeze.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { releaseFirefly } from '../../../src/sim/summons/fireflies.js';
import { sendStag } from '../../../src/sim/summons/stags.js';
import { raiseThorn } from '../../../src/sim/summons/thorns.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

const originalRandom = Math.random;
const HIT = { damage: 5, knockback: [0.5, -4], launch: true, hitstop: 3, hitstun: 20 };

function gameWithRaider(kind = 'grunt') {
  const game = createPlayingGame();
  spawnEnemy(game, kind, 1);
  const raider = game.fighters.find((fighter) => fighter.side === 'enemy');
  Object.assign(raider, { entering: false, x: game.player.x + 80, state: 'idle' });
  raider.ai.cooldown = 999;
  return { game, raider };
}

describe('summons in a running fight', () => {
  beforeEach(() => {
    Math.random = seededRandom(11);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('a thorn bursts under a raider, launches it once and withers away', () => {
    const { game, raider } = gameWithRaider();
    raiseThorn(game, { x: raider.x, scale: 1, hit: HIT });
    runTicks(game, 8);
    expect(raider.hp).toBe(raider.maxHp - 5);
    expect(raider.state).toBe('juggle');
    runTicks(game, 60);
    expect(raider.hp).toBe(raider.maxHp - 5);
    expect(game.summons).toEqual([]);
  });

  it('a delayed thorn waits before it breaks the ground', () => {
    const { game, raider } = gameWithRaider();
    raiseThorn(game, { x: raider.x, scale: 1, hit: HIT, delay: 20 });
    runTicks(game, 20);
    expect(raider.hp).toBe(raider.maxHp);
    runTicks(game, 10);
    expect(raider.hp).toBeLessThan(raider.maxHp);
  });

  it('a firefly hunts the nearest raider and stings until its stings run out', () => {
    const { game, raider } = gameWithRaider();
    const { x, y } = game.player;
    releaseFirefly(game, { x, y: y - 26, angle: 0, hit: HIT, stings: 2, life: 200 });
    runTicks(game, 120);
    expect(raider.maxHp - raider.hp).toBe(10);
    expect(game.summons.filter((summon) => summon.kind === 'firefly')).toEqual([]);
  });

  it('a spirit stag tramples each raider in its path once and runs on', () => {
    const { game, raider } = gameWithRaider();
    const stag = { lane: 0, direction: 1, speed: 6, scale: 1, hit: HIT, range: 160 };
    sendStag(game, { x: game.player.x, ...stag });
    runTicks(game, 20);
    expect(raider.hp).toBe(raider.maxHp - 5);
    runTicks(game, 20);
    expect(raider.hp).toBe(raider.maxHp - 5);
    expect(game.summons).toEqual([]);
  });

  it('ice holds a raider still, takes extra hits and shatters into a launch', () => {
    const { game, raider } = gameWithRaider();
    raider.y = GROUND_Y;
    freezeTarget(game, raider, { duration: 30 });
    const x = raider.x;
    runTicks(game, 20);
    expect(raider.frozen).toBe(true);
    expect(raider.x).toBe(x);
    expect(raider.hp).toBe(raider.maxHp);
    runTicks(game, 12);
    expect(raider.frozen).toBe(false);
    expect(raider.hp).toBe(raider.maxHp - 8);
    expect(raider.state).toBe('juggle');
  });

  it('freezing a frozen raider adds time instead of a second block of ice', () => {
    const { game, raider } = gameWithRaider();
    freezeTarget(game, raider, { duration: 20 });
    runTicks(game, 10);
    freezeTarget(game, raider, { duration: 30 });
    expect(game.summons.filter((summon) => summon.kind === 'ice')).toHaveLength(1);
    runTicks(game, 25);
    expect(raider.frozen).toBe(true);
  });

  it('holds a boss for half as long', () => {
    const { game, raider } = gameWithRaider('brute');
    freezeTarget(game, raider, { duration: 40 });
    runTicks(game, 22);
    expect(raider.frozen).toBe(false);
  });
});
