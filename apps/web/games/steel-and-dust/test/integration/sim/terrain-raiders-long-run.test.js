import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { layoutTerrain } from '../../../src/data/missions/terrain.js';
import { HOP_WAIT } from '../../../src/sim/brains/enemy/hop.js';
import { groundAt, platformUnder } from '../../../src/sim/stage/terrain.js';
import { createBot } from '../../support/bot.js';
import { createGameDriver, createScenarioGame } from '../../support/game-driver.js';
import { seededRandom } from '../../support/seeded-random.js';
import { useTerrain } from '../../support/terrain-game.js';

const originalRandom = Math.random;
const MISSION = 2;
const TICKS = 8000;

// every zone gets a bank, a block, a hill with a log over it and two more platforms
const ZONE = {
  ground: [
    [-230, 0],
    [-230, 16],
    [-150, 16],
    [-100, 0],
    [60, 0],
    [60, 20],
    [110, 20],
    [110, 0],
    [150, 0],
    [210, 24],
    [290, 24],
    [350, 0],
  ],
  platforms: [
    { at: 220, width: 60, rise: 36, kind: 'log' },
    { at: 400, width: 80, rise: 30, kind: 'planks' },
    { at: -60, width: 70, rise: 34, kind: 'planks' },
  ],
};

function raggedTerrain(mission) {
  return layoutTerrain(
    mission.zones.map(() => ZONE),
    mission.zones,
    mission.length,
  );
}

// a hop leaves the ground at hop speed; a drop leaves a platform while still over it
function levelChange(terrain, before, raider) {
  if (before.airborne || !raider.airborne || raider.state !== 'air') {
    return null;
  }
  if (raider.vy < -5) {
    return 'hop';
  }
  const platform = platformUnder(terrain, before.x, before.y);
  const overIt = platform && raider.x >= platform.x && raider.x <= platform.x + platform.width;
  return overIt ? 'drop' : null;
}

function playRun() {
  Math.random = seededRandom(31);
  const game = useTerrain(createScenarioGame('moss', MISSION), raggedTerrain(MISSIONS[MISSION]));
  const driver = createGameDriver(game);
  // the hero takes up his fists (w1, a training key): the raiders live long enough under them to
  // hop and drop more than once, which a sword cuts short
  const bot = createBot(driver, { 0: ['w1'], 900: ['fill'], 2400: ['fill'], 3900: ['fill'] });
  const run = { belowGround: [], changes: new Map(), hops: 0, perchedTicks: 0 };
  const before = new Map();
  driver.act('play');
  for (let tick = 0; tick < TICKS; tick++) {
    bot.step(tick);
    driver.tick();
    driver.afterTick();
    for (const fighter of game.fighters) {
      if (fighter.y > groundAt(game.terrain, fighter.x)) {
        run.belowGround.push(`${fighter.kind} at tick ${tick}`);
      }
      if (fighter.side === 'enemy') {
        noteRaider(run, { game, fighter, tick, before });
      }
    }
  }
  return run;
}

function noteRaider(run, { game, fighter, tick, before }) {
  const change = before.has(fighter) && levelChange(game.terrain, before.get(fighter), fighter);
  if (change) {
    run.hops += change === 'hop' ? 1 : 0;
    run.changes.set(fighter, [...(run.changes.get(fighter) ?? []), tick]);
  }
  const perched = platformUnder(game.terrain, fighter.x, fighter.y) && !fighter.airborne;
  run.perchedTicks += perched && fighter.def.ranged ? 1 : 0;
  before.set(fighter, { x: fighter.x, y: fighter.y, airborne: fighter.airborne });
}

describe('a long bot-played run with raiders on hills, banks and platforms', () => {
  let run;
  beforeAll(() => {
    run = playRun();
  });
  afterAll(() => {
    Math.random = originalRandom;
  });

  it('never leaves anyone below the ground', () => {
    expect(run.belowGround).toEqual([]);
  });

  it('has melee raiders hopping up and ranged raiders throwing from perches', () => {
    expect(run.hops).toBeGreaterThan(2);
    expect(run.perchedTicks).toBeGreaterThan(100);
  });

  it('never has a raider hop or drop twice within its rest, so none hops back and forth', () => {
    const gaps = [...run.changes.values()].flatMap((ticks) =>
      ticks.slice(1).map((tick, i) => tick - ticks[i]),
    );
    expect(gaps.length).toBeGreaterThan(0);
    expect(gaps.every((gap) => gap >= HOP_WAIT)).toBe(true);
  });
});
