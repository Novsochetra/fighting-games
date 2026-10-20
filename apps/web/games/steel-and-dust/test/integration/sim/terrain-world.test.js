import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { GROUND_Y } from '../../../src/config.js';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { fireEnemyShot } from '../../../src/sim/hazards/enemy-shots.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { groundAt } from '../../../src/sim/stage/terrain.js';
import { createBot } from '../../support/bot.js';
import { createGameDriver, createScenarioGame } from '../../support/game-driver.js';
import { seededRandom } from '../../support/seeded-random.js';
import {
  createTerrainGame,
  hillyTerrain,
  placeFighter,
  useTerrain,
} from '../../support/terrain-game.js';
import { press, release, runTicks, tap } from '../../support/test-game.js';

const originalRandom = Math.random;
const enemies = (game) => game.fighters.filter((fighter) => fighter.side === 'enemy');

function calmRaider(game, kind, { x, y }) {
  spawnEnemy(game, kind, 1);
  const raider = enemies(game).at(-1);
  raider.entering = false;
  raider.ai.cooldown = 999;
  placeFighter(game, raider, { x, y });
  return raider;
}

describe('raiders, hazards and pickups on uneven ground', () => {
  beforeEach(() => {
    Math.random = seededRandom(23);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('bounces a juggled raider off the face of a step', () => {
    const game = createTerrainGame({
      ground: [
        [260, 0],
        [260, 30],
        [340, 30],
        [340, 0],
      ],
    });
    const raider = calmRaider(game, 'grunt', { x: 240, y: GROUND_Y - 4 });
    Object.assign(raider, { state: 'juggle', airborne: true, vx: 3.5, vy: -1 });
    runTicks(game, 12);
    expect(raider.wallBounced).toBe(true);
    expect(raider.x).toBeLessThan(260);
    expect(raider.vx).toBeLessThanOrEqual(0);
  });

  it('walks a raider spawned on a slope down into the fight', () => {
    const game = createTerrainGame({
      ground: [
        [300, 0],
        [420, 40],
      ],
    });
    spawnEnemy(game, 'grunt', 1);
    const raider = enemies(game)[0];
    expect(raider.y).toBe(groundAt(game.terrain, raider.x));
    expect(raider.y).toBeLessThan(GROUND_Y - 30);
    let closest = Infinity;
    for (let i = 0; i < 600; i++) {
      runTicks(game, 1);
      expect(raider.y).toBe(groundAt(game.terrain, raider.x));
      closest = Math.min(closest, Math.abs(raider.x - game.player.x));
    }
    expect(raider.entering).toBe(false);
    expect(closest).toBeLessThan(90);
  });

  it('lands a fire pot on the platform the hero stands on', () => {
    const game = createTerrainGame({
      platforms: [{ at: 180, width: 100, rise: 40, kind: 'planks' }],
    });
    const top = GROUND_Y - 40;
    placeFighter(game, game.player, { x: 230, y: top });
    const bomber = calmRaider(game, 'bomber', { x: 320 });
    bomber.facing = -1;
    fireEnemyShot(game, bomber, 'bomb');
    runTicks(game, 120);
    const fire = game.projectiles.find((shot) => shot.kind === 'fire');
    expect(game.projectiles.some((shot) => shot.kind === 'bomb')).toBe(false);
    expect(fire).toBeDefined();
    expect(fire.y).toBe(top);
  });

  it('drops a crate on a hill open and the hero picks up what was inside', () => {
    const game = createTerrainGame({
      ground: [
        [100, 0],
        [130, 20],
        [230, 20],
        [260, 0],
      ],
    });
    const crate = game.crates[0];
    expect(crate.y).toBe(GROUND_Y - 20);
    placeFighter(game, game.player, { x: crate.x - 15 });
    game.player.facing = 1;
    press(game, 'down');
    tap(game, 'light');
    release(game, 'down');
    runTicks(game, 10);
    expect(crate.broken).toBe(true);
    placeFighter(game, game.player, { x: crate.x });
    runTicks(game, 40);
    expect(game.pickups).toHaveLength(0);
    expect(game.player.weapon.id).toBe('sword');
  });
});

describe('a long bot-played run on a hilly mission', () => {
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('never leaves anyone below the ground, and jumps the banks to fight through the zones', () => {
    Math.random = seededRandom(31);
    const game = useTerrain(createScenarioGame('moss', 0), hillyTerrain(MISSIONS[0]));
    const driver = createGameDriver(game);
    const bot = createBot(driver, { 900: ['fill'], 2400: ['fill'], 3900: ['fill'] });
    const zones = new Set();
    const heights = new Set();
    let wallsMet = 0;
    driver.act('play');
    for (let tick = 0; tick < 6000; tick++) {
      wallsMet += driver.observe().wallAhead ? 1 : 0;
      bot.step(tick);
      driver.tick();
      driver.afterTick();
      for (const fighter of game.fighters) {
        expect(fighter.y, `${fighter.kind} at tick ${tick}`).toBeLessThanOrEqual(
          groundAt(game.terrain, fighter.x),
        );
      }
      zones.add(game.stage.zoneIndex);
      heights.add(game.player.airborne ? null : game.player.y);
    }
    expect(wallsMet).toBeGreaterThan(0);
    expect(zones.size).toBeGreaterThan(1);
    expect(heights).toContain(GROUND_Y - 16);
  });
});
