import { afterEach, describe, expect, it } from 'vitest';
import { restartRun } from '../../../src/sim/stage/flow.js';
import { createBot } from '../../support/bot.js';
import { createGameDriver, createScenarioGame } from '../../support/game-driver.js';
import { seededRandom } from '../../support/seeded-random.js';

const originalRandom = Math.random;
const LIMITS = {
  particles: 500,
  effects: 80,
  floaters: 60,
  summons: 80,
  projectiles: 40,
  shockwaves: 20,
  fighters: 16,
};

function sizes(game) {
  return Object.fromEntries(Object.keys(LIMITS).map((key) => [key, game[key].length]));
}

// the bot fights from zone to zone, filling the ULT bar now and then; returns the largest sizes
function playZones(game, ticks) {
  const driver = createGameDriver(game);
  const bot = createBot(driver, { 300: ['fill'], 1500: ['fill'], 2700: ['fill'], 3900: ['fill'] });
  const largest = sizes(game);
  const zones = new Set();
  driver.act('play');
  for (let tick = 0; tick < ticks; tick++) {
    bot.step(tick);
    driver.tick();
    driver.afterTick();
    zones.add(game.stage.zoneIndex);
    for (const [key, size] of Object.entries(sizes(game))) {
      largest[key] = Math.max(largest[key], size);
    }
  }
  return { largest, zones };
}

describe('a long run through the zones', () => {
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('keeps every world list bounded zone after zone, for every Shade', () => {
    for (const hero of ['moss', 'firefly', 'antler', 'blue', 'ember']) {
      Math.random = seededRandom(77);
      const game = createScenarioGame(hero);
      const { largest, zones } = playZones(game, 5000);
      expect(zones.size, hero).toBeGreaterThan(1);
      for (const [key, limit] of Object.entries(LIMITS)) {
        expect(largest[key], `${hero} ${key}`).toBeLessThanOrEqual(limit);
      }
      expect(
        game.fighters.every((fighter) => !fighter.removed),
        hero,
      ).toBe(true);
    }
  });

  it('starts a restarted run from nothing, with no raider, summon or effect left over', () => {
    Math.random = seededRandom(78);
    const game = createScenarioGame('blue');
    playZones(game, 2500);
    restartRun(game);
    expect(game.fighters).toEqual([game.player]);
    for (const key of [
      'particles',
      'effects',
      'floaters',
      'summons',
      'projectiles',
      'shockwaves',
    ]) {
      expect(game[key], key).toEqual([]);
    }
    expect(game.boss).toBeNull();
    expect(game.stage).toMatchObject({ zoneIndex: 0, waveIndex: -1, spawnQueue: [] });
  });
});
