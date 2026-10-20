import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { groundAt, platformUnder } from '../../../src/sim/stage/terrain.js';
import { createBot } from '../../support/bot.js';
import { createGameDriver, createScenarioGame } from '../../support/game-driver.js';
import { seededRandom } from '../../support/seeded-random.js';

const originalRandom = Math.random;
const TEMPLE = MISSIONS.findIndex((mission) => mission.theme === 'mirageTemple');
const TICKS = 9000;

function playRun() {
  Math.random = seededRandom(9);
  const game = createScenarioGame('moss', TEMPLE);
  const driver = createGameDriver(game);
  const bot = createBot(driver, { 1500: ['fill'], 4500: ['fill'], 7500: ['fill'] });
  const run = { belowGround: [], highest: Infinity, perched: 0, zones: 0, raiders: new Set() };
  driver.act('play');
  for (let tick = 0; tick < TICKS; tick++) {
    bot.step(tick);
    driver.tick();
    driver.afterTick();
    game.player.hp = game.player.maxHp;
    for (const fighter of game.fighters) {
      if (fighter.y > groundAt(game.terrain, fighter.x)) {
        run.belowGround.push(`${fighter.kind} at tick ${tick}`);
      }
      const onSlab = platformUnder(game.terrain, fighter.x, fighter.y) && !fighter.airborne;
      run.perched += onSlab ? 1 : 0;
    }
    run.highest = Math.min(run.highest, game.player.y);
    run.zones = Math.max(run.zones, game.stage.zoneIndex);
  }
  return run;
}

describe('a bot-played run over the dunes and temple steps of the Mirage Temple', () => {
  let run;
  beforeAll(() => {
    run = playRun();
  });
  afterAll(() => {
    Math.random = originalRandom;
  });

  it('never leaves anyone below the sand', () => {
    expect(run.belowGround).toEqual([]);
  });

  it('fights its way through the first zones, up the dunes and onto the slabs', () => {
    expect(run.zones).toBeGreaterThanOrEqual(2);
    expect(run.highest).toBeLessThan(184 - 20);
    expect(run.perched).toBeGreaterThan(0);
  });
});
