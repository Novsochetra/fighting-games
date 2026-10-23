import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ULT_MAX } from '../../../src/config.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks, tap } from '../../support/test-game.js';

const originalRandom = Math.random;
// one heavy chain's own fire stays a share of the game's 500 particles
const CHAIN_BUDGET = 60;

function emberFight() {
  const game = createPlayingGame({ settings: { hero: 'ember' }, io: { sfx: () => {} } });
  runTicks(game, 30);
  spawnEnemy(game, 'grunt', 1);
  const raider = game.fighters.find((fighter) => fighter.side === 'enemy');
  Object.assign(raider, { entering: false, x: game.player.x + 24, hp: 500 });
  raider.ai.cooldown = 9999;
  game.player.facing = 1;
  game.ultMeter = ULT_MAX;
  return game;
}

const emberKinds = (game) => game.particles.filter((particle) => particle.kind.startsWith('ember'));

// the Ember Shade's fire, tick by tick, over a heavy pressed at each of `presses`
function playChain(game, presses, ticks) {
  const steps = [];
  for (let i = 0; i < ticks; i++) {
    if (presses.includes(i)) {
      tap(game, 'heavy');
    } else {
      runTicks(game, 1);
    }
    const { player } = game;
    steps.push({ move: player.move, time: player.moveTime, fire: emberKinds(game) });
  }
  return steps;
}

describe("the Ember Shade's heavy fire", () => {
  beforeEach(() => {
    Math.random = seededRandom(6);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('keeps its own fire within its share of particles over a heavy chain', () => {
    const steps = playChain(emberFight(), [0, 22, 44], 90);
    const most = Math.max(...steps.map((step) => step.fire.length));
    expect(most).toBeGreaterThan(0);
    expect(most).toBeLessThanOrEqual(CHAIN_BUDGET);
  });

  it('swirls embers in as it winds up and throws cinders and flames as it strikes', () => {
    const steps = playChain(emberFight(), [0], 30);
    const windUp = steps.filter((step) => step.move && step.time < step.move.startup);
    const struck = steps.filter((step) => step.move && step.time > step.move.startup);
    const kindsIn = (list) =>
      new Set(list.flatMap((step) => step.fire.map((particle) => particle.kind)));
    expect(kindsIn(windUp).has('emberSwirl')).toBe(true);
    const thrown = kindsIn(struck);
    expect(thrown.has('emberCinder') || thrown.has('emberFlame')).toBe(true);
  });
});
