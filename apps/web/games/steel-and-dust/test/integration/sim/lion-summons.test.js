import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { pounceComboLions, releaseLion } from '../../../src/sim/summons/lions.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

const originalRandom = Math.random;
const HIT = { damage: 5, knockback: [0.5, -4], launch: true, hitstop: 3, hitstun: 20 };
const lionsOf = (game) => game.summons.filter((summon) => summon.kind === 'lion');

function gameWithRaider() {
  const game = createPlayingGame({ settings: { hero: 'bokator' } });
  spawnEnemy(game, 'grunt', 1);
  const raider = game.fighters.find((fighter) => fighter.side === 'enemy');
  Object.assign(raider, { entering: false, x: game.player.x + 80, state: 'idle' });
  raider.ai.cooldown = 999;
  return { game, raider };
}

describe('the golden lion in a running fight', () => {
  beforeEach(() => {
    Math.random = seededRandom(11);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('strikes a raider it bounds over once, then melts away where it last landed', () => {
    const { game, raider } = gameWithRaider();
    const { x, y } = raider;
    const flight = [
      [0, x - 120, y],
      [20, x, y - 20],
      [40, x + 120, y],
    ];
    releaseLion(game, { flight, hit: HIT, scale: 1 });
    runTicks(game, 41);
    expect(raider.maxHp - raider.hp).toBe(5);
    const [lion] = lionsOf(game);
    expect(lion).toMatchObject({ x: x + 120, y });
    expect(lion.fade).toBeGreaterThan(0);
    runTicks(game, 10);
    expect(raider.maxHp - raider.hp).toBe(5);
    expect(lionsOf(game)).toEqual([]);
  });

  it('bounds in arcs, landing with dust and a thud on every point of its run', () => {
    const sounds = [];
    const game = createPlayingGame({
      settings: { hero: 'bokator' },
      io: { sfx: (key) => sounds.push(key) },
    });
    const { x, y } = game.player;
    const flight = [
      [0, x, y],
      [20, x + 100, y, 60],
      [40, x + 200, y, 60],
    ];
    releaseLion(game, { flight, hit: HIT, scale: 1 });
    const heights = [];
    for (let i = 0; i < 40; i++) {
      runTicks(game, 1);
      heights.push(y - lionsOf(game)[0].y);
    }
    expect(heights[9]).toBeCloseTo(60);
    expect(heights[19]).toBeCloseTo(0);
    expect(heights[29]).toBeCloseTo(60);
    expect(Math.max(...heights)).toBeLessThanOrEqual(60);
    expect(sounds.filter((key) => key === 'pounce')).toHaveLength(2);
  });

  it('strikes again on every leg when its run asks for it', () => {
    const { game, raider } = gameWithRaider();
    const { x, y } = raider;
    const flight = [
      [0, x - 60, y],
      [12, x + 60, y],
      [24, x - 60, y],
    ];
    releaseLion(game, { flight, hit: HIT, scale: 1, everyLeg: true });
    runTicks(game, 6);
    expect(lionsOf(game)[0].direction).toBe(1);
    runTicks(game, 12);
    expect(lionsOf(game)[0].direction).toBe(-1);
    runTicks(game, 10);
    expect(raider.maxHp - raider.hp).toBe(10);
  });

  it('a finisher sends one lion per count, the later ones a beat behind and further ahead', () => {
    const { game } = gameWithRaider();
    pounceComboLions(game, game.player, 2);
    const [first, second] = lionsOf(game);
    expect(second.time).toBeLessThan(first.time);
    const reach = (lion) => lion.flight.at(-1)[1] - game.player.x;
    expect(reach(second)).toBeGreaterThan(reach(first));
  });
});
