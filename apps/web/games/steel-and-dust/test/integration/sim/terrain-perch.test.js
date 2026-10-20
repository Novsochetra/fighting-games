import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { GROUND_Y } from '../../../src/config.js';
import { fireEnemyShot } from '../../../src/sim/hazards/enemy-shots.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createTerrainGame, placeFighter } from '../../support/terrain-game.js';
import { runTicks } from '../../support/test-game.js';

const originalRandom = Math.random;
const LOG = { at: 200, width: 80, rise: 36, kind: 'log' };
const TOP = GROUND_Y - 36;

function raiderAt(game, kind, { x, y }) {
  spawnEnemy(game, kind, 1);
  const raider = game.fighters.filter((fighter) => fighter.side === 'enemy').at(-1);
  raider.entering = false;
  placeFighter(game, raider, { x, y });
  return raider;
}

function isPerched(raider) {
  return raider.y === TOP && !raider.airborne;
}

// runs until the check passes or the ticks run out, and says which tick it passed on
function runUntil(game, ticks, check) {
  for (let i = 0; i < ticks; i++) {
    runTicks(game, 1);
    if (check()) {
      return i;
    }
  }
  return -1;
}

describe('a ranged raider near a platform', () => {
  beforeEach(() => {
    Math.random = seededRandom(19);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('walks under it, hops up, and throws knives down at the hero standing below', () => {
    const game = createTerrainGame({ platforms: [LOG] });
    placeFighter(game, game.player, { x: 320 });
    const slinger = raiderAt(game, 'sling', { x: 150 });
    const knives = [];
    const hitAt = runUntil(game, 600, () => {
      knives.push(...game.projectiles.filter((shot) => shot.kind === 'knife'));
      return game.player.hp < game.player.maxHp;
    });
    expect(hitAt).toBeGreaterThan(0);
    expect(isPerched(slinger)).toBe(true);
    expect(knives.length).toBeGreaterThan(0);
    expect(knives.every((knife) => knife.vy > 0)).toBe(true);
  });

  it('holds still on its perch while the hero stays in range, and drops when he comes close', () => {
    const game = createTerrainGame({ platforms: [LOG] });
    placeFighter(game, game.player, { x: 320 });
    const slinger = raiderAt(game, 'sling', { x: 210, y: TOP });
    slinger.ai.cooldown = 999;
    runTicks(game, 120);
    expect(isPerched(slinger)).toBe(true);
    expect(slinger.x).toBe(210);
    placeFighter(game, game.player, { x: 250 });
    expect(runUntil(game, 5, () => slinger.state === 'air')).toBeGreaterThanOrEqual(0);
    expect(slinger.x).toBeGreaterThan(200);
    runTicks(game, 40);
    expect(slinger).toMatchObject({ y: GROUND_Y, airborne: false });
  });

  it('walks off its perch after a hero who goes out of range', () => {
    const game = createTerrainGame({ platforms: [LOG] });
    placeFighter(game, game.player, { x: 460 });
    const slinger = raiderAt(game, 'sling', { x: 260, y: TOP });
    slinger.ai.cooldown = 999;
    runTicks(game, 200);
    expect(slinger).toMatchObject({ y: GROUND_Y, airborne: false });
    expect(slinger.x).toBeGreaterThan(280);
  });

  for (const [kind, shot] of [
    ['sentry', 'bolt'],
    ['spitter', 'venom'],
    ['witch', 'sand'],
  ]) {
    it(`fires a ${shot} from a perch that dives onto the hero standing below`, () => {
      const game = createTerrainGame({ platforms: [LOG] });
      placeFighter(game, game.player, { x: 300 });
      const shooter = raiderAt(game, kind, { x: 230, y: TOP });
      Object.assign(shooter, { facing: 1 });
      shooter.ai.cooldown = 999;
      fireEnemyShot(game, shooter, shot);
      expect(game.projectiles.at(-1).vy).toBeGreaterThan(0);
      expect(runUntil(game, 60, () => game.player.hp < game.player.maxHp)).toBeGreaterThan(0);
    });
  }
});
