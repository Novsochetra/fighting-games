import { afterEach, describe, expect, it } from 'vitest';
import { HEROES } from '../../../src/data/heroes.js';
import { MISSIONS, missionAt } from '../../../src/data/missions/index.js';
import { missionEnemyKinds } from '../../../src/data/missions/mission-enemies.js';
import { restartRun } from '../../../src/sim/stage/flow.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { createBot } from '../../support/bot.js';
import { createGameDriver, createScenarioGame } from '../../support/game-driver.js';
import { seededRandom } from '../../support/seeded-random.js';

const originalRandom = Math.random;
const TICKS = 2400;
const SPAWN_AT = 60;
const LIMITS = {
  particles: 500,
  effects: 80,
  floaters: 60,
  summons: 80,
  projectiles: 40,
  shockwaves: 20,
  fighters: 16,
  pickups: 8,
};
const FIGHTER_LIST_LIMIT = 32;
const ULT_EVERY = 400;

function ultFills() {
  const fills = {};
  for (let tick = 200; tick < TICKS; tick += ULT_EVERY) {
    fills[tick] = ['fill'];
  }
  return fills;
}

// both stay standing, so the boss fights the whole time in phase two and looses its ultimate
// again and again, the way a long fight against it goes
function keepStanding(game) {
  const { player, boss } = game;
  player.hp = Math.max(player.hp, player.maxHp * 0.6);
  if (boss && boss.state !== 'ko') {
    boss.hp = Math.max(boss.hp, boss.maxHp * 0.15);
  }
}

function longestFighterList(game) {
  let longest = 0;
  for (const fighter of game.fighters) {
    for (const value of Object.values(fighter)) {
      if (Array.isArray(value)) {
        longest = Math.max(longest, value.length);
      }
    }
  }
  return longest;
}

function measure(game, largest) {
  for (const key of Object.keys(LIMITS)) {
    largest[key] = Math.max(largest[key], game[key].length);
  }
  largest.fighterList = Math.max(largest.fighterList, longestFighterList(game));
  game.fighters.forEach((fighter) => fighter.side === 'enemy' && largest.kinds.add(fighter.kind));
}

function fightBoss(game, mission) {
  const driver = createGameDriver(game);
  const bot = createBot(driver, ultFills());
  const largest = {
    fighterList: 0,
    kinds: new Set(),
    ...Object.fromEntries(Object.keys(LIMITS).map((key) => [key, 0])),
  };
  driver.act('play');
  for (let tick = 0; tick < TICKS; tick++) {
    if (tick === SPAWN_AT) {
      spawnEnemy(game, missionAt(mission).boss, 1);
    }
    keepStanding(game);
    bot.step(tick);
    driver.tick();
    driver.afterTick();
    measure(game, largest);
  }
  return largest;
}

describe('a long fight against every road boss', () => {
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('keeps every world list and every list a fighter carries bounded, for every Shade', () => {
    MISSIONS.forEach((spec, mission) => {
      Math.random = seededRandom(90 + mission);
      const hero = HEROES[mission % HEROES.length].id;
      const game = createScenarioGame(hero, mission);
      const largest = fightBoss(game, mission);
      const label = `${hero} against ${spec.boss}`;
      expect(game.boss?.kind, label).toBe(spec.boss);
      for (const [key, limit] of Object.entries(LIMITS)) {
        expect(largest[key], `${label} ${key}`).toBeLessThanOrEqual(limit);
      }
      expect(largest.fighterList, label).toBeLessThanOrEqual(FIGHTER_LIST_LIMIT);
      // a kind the road does not list would load its sheet only as it walks on
      const listed = missionEnemyKinds(mission);
      expect(
        [...largest.kinds].filter((kind) => !listed.has(kind)),
        label,
      ).toEqual([]);
      restartRun(game);
      expect(game.fighters, label).toEqual([game.player]);
      expect(game.boss, label).toBeNull();
      for (const key of [
        'particles',
        'effects',
        'floaters',
        'summons',
        'projectiles',
        'shockwaves',
      ]) {
        expect(game[key], `${label} ${key}`).toEqual([]);
      }
    });
  });
});
