import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { POUNDING_LION } from '../../../src/data/ultimates/pounding-lion.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { ECHO_FLARE_TICKS, leaveEcho, wakeEcho } from '../../../src/sim/summons/echoes.js';
import { releaseLion } from '../../../src/sim/summons/lions.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

const originalRandom = Math.random;
const { echoDelay, echo: ECHO_HIT } = POUNDING_LION;
const echoesOf = (game) => game.summons.filter((summon) => summon.kind === 'echo');
const burstsOf = (game, sprite) =>
  game.summons.filter((summon) => summon.kind === 'burst' && summon.sprite === sprite);

function gameWithEcho() {
  const game = createPlayingGame({ settings: { hero: 'bokator' } });
  spawnEnemy(game, 'grunt', 1);
  const raider = game.fighters.find((fighter) => fighter.side === 'enemy');
  Object.assign(raider, { entering: false, x: game.player.x + 80, state: 'idle', hp: 200 });
  raider.maxHp = 200;
  raider.ai.cooldown = 999;
  const at = { x: raider.x - 20, y: raider.y, facing: 1, sprite: ['thrust', 3, 1] };
  leaveEcho(game, { ...at, target: raider });
  return { game, raider };
}

describe("Bokator's gold echoes in a running fight", () => {
  beforeEach(() => {
    Math.random = seededRandom(5);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('strikes the raider it was left with once more, after a beat', () => {
    const { game, raider } = gameWithEcho();
    runTicks(game, echoDelay - 1);
    expect(raider.hp).toBe(raider.maxHp);
    runTicks(game, 1);
    expect(raider.maxHp - raider.hp).toBe(ECHO_HIT.damage);
    expect(burstsOf(game, 'strike')).toHaveLength(1);
    runTicks(game, 60);
    expect(raider.maxHp - raider.hp).toBe(ECHO_HIT.damage);
  });

  it('wakes in step with a lion released with the same delay', () => {
    const { game } = gameWithEcho();
    const [echo] = echoesOf(game);
    releaseLion(game, {
      flight: [
        [0, echo.x, echo.y],
        [20, echo.x + 60, echo.y],
      ],
      hit: ECHO_HIT,
      scale: 0.5,
      appear: 18,
      delay: 0,
    });
    wakeEcho(echo, 0);
    const lion = game.summons.find((summon) => summon.kind === 'lion');
    runTicks(game, 1);
    expect(lion.time).toBe(1);
    expect(burstsOf(game, 'awaken')).toHaveLength(1);
  });

  it('holds its blow until it is woken, then flares into gold and is gone', () => {
    const { game } = gameWithEcho();
    runTicks(game, 120);
    const [echo] = echoesOf(game);
    expect(echo).toBeDefined();
    wakeEcho(echo, 6);
    runTicks(game, 6);
    expect(burstsOf(game, 'awaken')).toEqual([]);
    runTicks(game, 1);
    expect(burstsOf(game, 'awaken')).toHaveLength(1);
    expect(echoesOf(game)).toHaveLength(1);
    runTicks(game, ECHO_FLARE_TICKS);
    expect(echoesOf(game)).toEqual([]);
  });

  it('strikes only the air when its raider is gone', () => {
    const { game, raider } = gameWithEcho();
    raider.removed = true;
    runTicks(game, echoDelay + 1);
    expect(raider.hp).toBe(raider.maxHp);
    expect(burstsOf(game, 'strike')).toEqual([]);
  });
});
