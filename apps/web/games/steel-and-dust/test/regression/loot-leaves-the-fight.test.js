import { afterEach, describe, expect, it } from 'vitest';
import { createGameDriver, createScenarioGame } from '../support/game-driver.js';
import { portableCos, portableSin } from '../support/portable-trig.js';
import { runScenario } from '../support/run-scenario.js';
import { SCENARIOS } from '../support/scenarios.js';
import { seededRandom } from '../support/seeded-random.js';

const originalMath = { random: Math.random, sin: Math.sin, cos: Math.cos };
const SWEEPS = {
  none: () => {},
  // coins and gems swept off the road the tick they land, so only the apples reach the hero
  money: (game) => {
    game.loot = game.loot.filter((piece) => piece.kind === 'apple');
  },
  // nothing reaches the hero: no coin, gem, apple or chest
  everything: (game) => {
    game.loot = [];
    game.chests = [];
  },
};

function play(scenario, sweep) {
  Object.assign(Math, { random: seededRandom(scenario.seed), sin: portableSin, cos: portableCos });
  const game = createScenarioGame(scenario.hero, scenario.mission);
  const driver = createGameDriver(game, null);
  const afterTick = driver.afterTick;
  driver.afterTick = () => {
    afterTick();
    SWEEPS[sweep](game);
  };
  return runScenario(driver, scenario).samples;
}

function fight({ tick, mode, zone, wave, enemies, player, boss }) {
  const hero = { x: player.x, y: player.y, state: player.state, move: player.move, hp: player.hp };
  return { tick, mode, zone, wave, boss, enemies, hero };
}

// loot draws from a stream of its own, so the raiders, the bosses and the hero's moves never
// change for it; only an apple may change a fight, and only through the hero's health
describe('loot leaves the fight alone', () => {
  afterEach(() => {
    Object.assign(Math, originalMath);
  });

  for (const name of ['campaign', 'boss', 'naga', 'sandstorm']) {
    it(`the ${name} run fights the same whether the hero gathers coins and gems or not`, () => {
      const scenario = SCENARIOS[name];
      const withLoot = play(scenario, 'none');
      const withoutMoney = play(scenario, 'money');
      expect(withLoot.map(fight)).toEqual(withoutMoney.map(fight));
      expect(withLoot.at(-1).score).toBeGreaterThan(withoutMoney.at(-1).score);
    });

    it(`the ${name} run fights the same without loot until an apple first heals the hero`, () => {
      const scenario = SCENARIOS[name];
      const withLoot = play(scenario, 'none').map(fight);
      const without = play(scenario, 'everything').map(fight);
      const healed = withLoot.findIndex((sample, i) => sample.hero.hp !== without[i].hero.hp);
      const until = healed < 0 ? withLoot.length : healed;
      expect(withLoot.slice(0, until)).toEqual(without.slice(0, until));
      if (healed >= 0) {
        expect(withLoot[healed].hero.hp).toBeGreaterThan(without[healed].hero.hp);
      }
    });
  }
});
