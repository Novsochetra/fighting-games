import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { GROUND_Y } from '../../../src/config.js';
import { enemySpriteFrame } from '../../../src/sim/enemy-animation.js';
import { takeToken } from '../../../src/sim/fighters/tokens.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createTerrainGame, placeFighter } from '../../support/terrain-game.js';
import { runTicks } from '../../support/test-game.js';

const originalRandom = Math.random;

function raiderAt(game, kind, { x, y }) {
  spawnEnemy(game, kind, 1);
  const raider = game.fighters.filter((fighter) => fighter.side === 'enemy').at(-1);
  raider.entering = false;
  placeFighter(game, raider, { x, y });
  return raider;
}

// a raider that walks right up to the hero but never takes a swing
function walker(game, x) {
  const raider = raiderAt(game, 'grunt', { x });
  Object.assign(raider.ai, { cooldown: 999, spacing: 20 });
  return raider;
}

function attacker(game, x) {
  const raider = raiderAt(game, 'grunt', { x });
  raider.ai.cooldown = 0;
  takeToken(game, raider);
  return raider;
}

// runs the game and notes each tick the raider leaves the ground and where it was then
function watchTakeOffs(game, raider, ticks, each = () => {}) {
  const takeOffs = [];
  for (let i = 0; i < ticks; i++) {
    const from = { x: raider.x, airborne: raider.airborne };
    runTicks(game, 1);
    if (!from.airborne && raider.airborne) {
      takeOffs.push({ tick: i, x: from.x });
    }
    each(raider);
  }
  return takeOffs;
}

function bank(at, rise) {
  return [
    [at, 0],
    [at, rise],
    [at + 200, rise],
    [at + 200, 0],
  ];
}

describe('a melee raider and the hero on different levels', () => {
  beforeEach(() => {
    Math.random = seededRandom(17);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('hops up onto the platform the hero stands on, and only swings at him up there', () => {
    const game = createTerrainGame({ platforms: [{ at: 200, width: 80, rise: 32, kind: 'log' }] });
    const top = GROUND_Y - 32;
    placeFighter(game, game.player, { x: 250, y: top });
    const grunt = attacker(game, 120);
    const swingHeights = new Set();
    const frames = [];
    const takeOffs = watchTakeOffs(game, grunt, 300, (raider) => {
      if (raider.state === 'attack') {
        swingHeights.add(raider.y);
      }
      if (raider.airborne) {
        frames.push(enemySpriteFrame(raider)[0]);
      }
    });
    expect(takeOffs).toHaveLength(1);
    expect(swingHeights).toEqual(new Set([top]));
    expect(grunt).toMatchObject({ y: top, airborne: false });
    expect(new Set(frames)).toEqual(new Set(['walk']));
  });

  it('hops over the face of a bank to reach the hero standing on it', () => {
    const game = createTerrainGame({ ground: bank(200, 30) });
    placeFighter(game, game.player, { x: 215 });
    const grunt = attacker(game, 120);
    const takeOffs = watchTakeOffs(game, grunt, 300);
    expect(takeOffs).toHaveLength(1);
    expect(takeOffs[0].x).toBeLessThan(200);
    expect(grunt).toMatchObject({ y: GROUND_Y - 30, airborne: false });
  });

  it('drops through the platform it stands on when the hero is below and close', () => {
    const game = createTerrainGame({ platforms: [{ at: 200, width: 80, rise: 32, kind: 'log' }] });
    placeFighter(game, game.player, { x: 300 });
    const grunt = walker(game, 240);
    placeFighter(game, grunt, { x: 240, y: GROUND_Y - 32 });
    runTicks(game, 1);
    expect(grunt).toMatchObject({ state: 'air', airborne: true });
    expect(grunt.x).toBeGreaterThan(200);
    runTicks(game, 40);
    expect(grunt).toMatchObject({ y: GROUND_Y, airborne: false });
  });

  it('hops up once onto a short log and stays there, even with the hero at its far end', () => {
    const game = createTerrainGame({ platforms: [{ at: 200, width: 60, rise: 17, kind: 'log' }] });
    const top = GROUND_Y - 17;
    placeFighter(game, game.player, { x: 255, y: top });
    const grunt = attacker(game, 120);
    const takeOffs = watchTakeOffs(game, grunt, 900, () => {
      game.player.invincible = 99;
    });
    expect(takeOffs).toHaveLength(1);
    expect(grunt).toMatchObject({ y: top, airborne: false });
  });
});

describe('a raider walking into a face', () => {
  beforeEach(() => {
    Math.random = seededRandom(17);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('hops a 20px step on the way to a hero standing far along it', () => {
    const game = createTerrainGame({ ground: bank(200, 20) });
    placeFighter(game, game.player, { x: 330 });
    const grunt = walker(game, 120);
    const takeOffs = watchTakeOffs(game, grunt, 250);
    expect(takeOffs).toHaveLength(1);
    expect(takeOffs[0].x).toBeLessThan(200);
    expect(game.player.x - takeOffs[0].x).toBeGreaterThan(40);
    expect(grunt).toMatchObject({ y: GROUND_Y - 20, airborne: false });
    expect(grunt.x).toBeGreaterThan(280);
  });

  it('hops a bank between it and a hero on the road beyond, then drops off the far side', () => {
    const game = createTerrainGame({ ground: bank(200, 24) });
    placeFighter(game, game.player, { x: 470 });
    const grunt = walker(game, 150);
    const takeOffs = watchTakeOffs(game, grunt, 600);
    expect(takeOffs.length).toBeGreaterThanOrEqual(1);
    expect(grunt).toMatchObject({ y: GROUND_Y, airborne: false });
    expect(grunt.x).toBeGreaterThan(400);
  });

  it('still clears a tall face it is already pressed against', () => {
    const game = createTerrainGame({ ground: bank(200, 40) });
    placeFighter(game, game.player, { x: 330 });
    const grunt = walker(game, 199.5);
    const takeOffs = watchTakeOffs(game, grunt, 120);
    expect(takeOffs).toHaveLength(1);
    expect(grunt).toMatchObject({ y: GROUND_Y - 40, airborne: false });
  });
});
