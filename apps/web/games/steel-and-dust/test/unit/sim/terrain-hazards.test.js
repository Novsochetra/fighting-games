import { describe, expect, it } from 'vitest';
import { GROUND_Y } from '../../../src/config.js';
import { FLAT_TERRAIN } from '../../../src/data/missions/terrain.js';
import { separateFighters } from '../../../src/sim/fighters/separate.js';
import { flyBomb } from '../../../src/sim/hazards/enemy-shots.js';
import { hitsGround } from '../../../src/sim/hazards/projectiles.js';
import { rideFloor } from '../../../src/sim/hazards/shockwaves.js';
import { updatePickups } from '../../../src/sim/items/pickups.js';
import { buildTerrain } from '../../support/terrain-game.js';
import { createTestGame } from '../../support/test-game.js';

// a ramp up 12px from 100 to 140, level to 200, a 20px step at 200, and a log over the road
const ROAD = buildTerrain({
  ground: [
    [100, 0],
    [140, 12],
    [200, 12],
    [200, 32],
    [260, 32],
    [260, 0],
  ],
  platforms: [{ at: 300, width: 60, rise: 40, kind: 'planks' }],
});
const LOG_TOP = GROUND_Y - 40;

describe('a shockwave', () => {
  it('stays on the flat road exactly as before', () => {
    const wave = { x: 120, y: GROUND_Y };
    rideFloor(FLAT_TERRAIN, wave);
    expect(wave).toEqual({ x: 120, y: GROUND_Y });
  });

  it('climbs a ramp, runs along a platform and drops off its end', () => {
    const wave = { x: 120, y: GROUND_Y - 4 };
    rideFloor(ROAD, wave);
    expect(wave.y).toBe(GROUND_Y - 6);
    Object.assign(wave, { x: 330, y: LOG_TOP });
    rideFloor(ROAD, wave);
    expect(wave.y).toBe(LOG_TOP);
    wave.x = 362;
    rideFloor(ROAD, wave);
    expect(wave.y).toBe(GROUND_Y);
  });

  it('breaks on the face of a step', () => {
    const wave = { x: 201, y: GROUND_Y - 12 };
    rideFloor(ROAD, wave);
    expect(wave).toMatchObject({ broken: true, y: GROUND_Y - 12 });
  });
});

describe('a thrown or fired shot', () => {
  it('breaks when it reaches the ground under it', () => {
    expect(hitsGround(ROAD, { kind: 'knife', x: 230, y: GROUND_Y - 30 })).toBe(true);
    expect(hitsGround(ROAD, { kind: 'knife', x: 230, y: GROUND_Y - 34 })).toBe(false);
    expect(hitsGround(FLAT_TERRAIN, { kind: 'bolt', x: 230, y: GROUND_Y - 1 })).toBe(false);
  });

  it('leaves fire pots and fire to find their own floor', () => {
    expect(hitsGround(ROAD, { kind: 'fire', x: 230, y: GROUND_Y - 32 })).toBe(false);
    expect(hitsGround(ROAD, { kind: 'bomb', x: 230, y: GROUND_Y })).toBe(false);
  });
});

describe('a fire pot', () => {
  it('breaks on a platform it falls onto and leaves its fire there', () => {
    const game = Object.assign(createTestGame(), { terrain: ROAD });
    const bomb = {
      kind: 'bomb',
      x: 330,
      y: LOG_TOP - 4,
      vy: 3,
      side: 'enemy',
      time: 0,
      damage: 12,
      hitTargets: new Set(),
    };
    game.projectiles = [bomb];
    flyBomb(game, bomb);
    expect(bomb).toMatchObject({ dead: true, y: LOG_TOP });
    expect(game.projectiles.at(-1)).toMatchObject({ kind: 'fire', y: LOG_TOP });
  });

  it('flies up through a platform from below', () => {
    const game = Object.assign(createTestGame(), { terrain: ROAD });
    const bomb = { kind: 'bomb', x: 330, y: LOG_TOP + 1, vy: -3, hitTargets: new Set() };
    flyBomb(game, bomb);
    expect(bomb.dead).toBeUndefined();
  });
});

describe('fighters pushing apart', () => {
  function pair(firstY, secondY) {
    const base = { airborne: false, entering: false, state: 'idle', side: 'enemy', scale: 1 };
    return [
      { ...base, x: 225, y: firstY },
      { ...base, x: 226, y: secondY },
    ];
  }

  it('push apart on one level', () => {
    const fighters = pair(GROUND_Y - 32, GROUND_Y - 32);
    separateFighters(fighters, ROAD);
    expect(fighters[0].x).toBeLessThan(225);
    expect(fighters[1].x).toBeGreaterThan(226);
  });

  it('leave each other alone a step or more apart in height', () => {
    const fighters = pair(GROUND_Y - 32, LOG_TOP + 30);
    separateFighters(fighters, ROAD);
    expect(fighters.map((fighter) => fighter.x)).toEqual([225, 226]);
  });

  it('do not shove anyone into the face of a step', () => {
    const fighters = pair(GROUND_Y - 12, GROUND_Y - 12);
    Object.assign(fighters[0], { x: 198 });
    Object.assign(fighters[1], { x: 199.5 });
    separateFighters(fighters, ROAD);
    expect(fighters[0].x).toBeLessThan(198);
    expect(fighters[1].x).toBe(199.5);
  });
});

describe('a pickup', () => {
  it('falls onto a platform below it, and only the hero on that platform collects it', () => {
    const game = Object.assign(createTestGame(), { terrain: ROAD });
    game.pickups = [{ x: 330, y: LOG_TOP - 30, vy: 0, item: 'ration', time: 0, landed: false }];
    Object.assign(game.player, { x: 330, y: GROUND_Y });
    for (let i = 0; i < 40; i++) {
      updatePickups(game);
    }
    expect(game.pickups[0]).toMatchObject({ landed: true, y: LOG_TOP - 6 });
    game.player.y = LOG_TOP;
    updatePickups(game);
    expect(game.pickups).toHaveLength(0);
  });
});
