import { describe, expect, it } from 'vitest';
import { GROUND_Y } from '../../../src/config.js';
import { FLAT_TERRAIN } from '../../../src/data/missions/terrain.js';
import { ledgeBehind, planClimb, tryClimb } from '../../../src/sim/brains/enemy/climb.js';
import { buildTerrain } from '../../support/terrain-game.js';

// a log 32px up from x 200 to 280, and a bank 30px up from x 400 to 500
const ROAD = buildTerrain({
  ground: [
    [400, 0],
    [400, 30],
    [500, 30],
    [500, 0],
  ],
  platforms: [{ at: 200, width: 80, rise: 32, kind: 'log' }],
});
const LOG_TOP = GROUND_Y - 32;
const BANK_TOP = GROUND_Y - 30;

function raider(fields) {
  return {
    x: 0,
    y: GROUND_Y,
    facing: 1,
    state: 'idle',
    walkDirection: 1,
    def: { ranged: false },
    ai: { hopWait: 0 },
    ...fields,
  };
}

function hero(fields) {
  return { x: 0, y: GROUND_Y, airborne: false, ...fields };
}

describe('a raider and the hero on one level', () => {
  it('do nothing on a flat road, and the raider keeps its rest', () => {
    const walker = raider({ x: 100, state: 'walk', ai: { hopWait: 5 } });
    const game = { terrain: FLAT_TERRAIN, player: hero({ x: 120, y: GROUND_Y - 40 }) };
    expect(planClimb(FLAT_TERRAIN, walker, game.player)).toBeNull();
    expect(tryClimb(game, walker)).toBe(false);
    expect(walker.ai.hopWait).toBe(5);
  });

  it('do nothing on uneven ground with no face between them', () => {
    expect(planClimb(ROAD, raider({ x: 100 }), hero({ x: 130 }))).toBeNull();
    const onBank = raider({ x: 420, y: BANK_TOP, state: 'walk' });
    expect(planClimb(ROAD, onBank, hero({ x: 470, y: BANK_TOP }))).toBeNull();
  });
});

describe('a hero standing above a raider', () => {
  it('on a platform in reach draws a hop onto its near end', () => {
    const plan = planClimb(ROAD, raider({ x: 175 }), hero({ x: 205, y: LOG_TOP }));
    expect(plan).toEqual({ action: 'hop', toX: 210, faceX: null, rise: 32 });
  });

  it('draws a hop straight up from a raider already under the platform', () => {
    const plan = planClimb(ROAD, raider({ x: 260, facing: -1 }), hero({ x: 240, y: LOG_TOP }));
    expect(plan).toMatchObject({ action: 'hop', toX: 260, faceX: null });
  });

  it('on a bank draws a hop over its face', () => {
    const plan = planClimb(ROAD, raider({ x: 380 }), hero({ x: 410, y: BANK_TOP }));
    expect(plan).toEqual({ action: 'hop', toX: 410, faceX: 400, rise: 30 });
  });

  it('is left alone when too far away, too high or in the air', () => {
    expect(planClimb(ROAD, raider({ x: 150 }), hero({ x: 205, y: LOG_TOP }))).toBeNull();
    const high = hero({ x: 205, y: GROUND_Y - 60 });
    const highRoad = buildTerrain({ platforms: [{ at: 200, width: 80, rise: 60, kind: 'log' }] });
    expect(planClimb(highRoad, raider({ x: 175 }), high)).toBeNull();
    const jumping = hero({ x: 205, y: LOG_TOP, airborne: true });
    expect(planClimb(ROAD, raider({ x: 175 }), jumping)).toBeNull();
  });
});

describe('a hero standing below a raider', () => {
  it('draws a drop through the platform the raider stands on when he is close', () => {
    const onLog = raider({ x: 240, y: LOG_TOP });
    expect(planClimb(ROAD, onLog, hero({ x: 300 }))).toEqual({ action: 'drop' });
    expect(planClimb(ROAD, onLog, hero({ x: 330 }))).toBeNull();
  });

  it('leaves a raider on a bank to walk off its edge', () => {
    expect(planClimb(ROAD, raider({ x: 410, y: BANK_TOP }), hero({ x: 380 }))).toBeNull();
  });
});

describe('a raider walking into a face', () => {
  it('hops it when walking at the hero, wherever the hero stands', () => {
    const walker = raider({ x: 386, state: 'walk' });
    expect(planClimb(ROAD, walker, hero({ x: 700 }))).toEqual({
      action: 'hop',
      toX: 410,
      faceX: 400,
      rise: 30,
    });
  });

  it('stops at it when backing away or standing still', () => {
    const backing = raider({ x: 386, state: 'walk', walkDirection: -1 });
    expect(planClimb(ROAD, backing, hero({ x: 700 }))).toBeNull();
    expect(planClimb(ROAD, raider({ x: 386 }), hero({ x: 700 }))).toBeNull();
  });

  it('leaves a face taller than a hop alone', () => {
    const cliff = buildTerrain({
      ground: [
        [400, 0],
        [400, 60],
        [500, 60],
        [500, 0],
      ],
    });
    expect(planClimb(cliff, raider({ x: 386, state: 'walk' }), hero({ x: 700 }))).toBeNull();
  });
});

describe('a raider backing away', () => {
  it('finds the lip of a drop behind it, never on a flat road', () => {
    expect(ledgeBehind(ROAD, raider({ x: 203, y: LOG_TOP }))).toBe(true);
    expect(ledgeBehind(ROAD, raider({ x: 240, y: LOG_TOP }))).toBe(false);
    expect(ledgeBehind(ROAD, raider({ x: 403, y: BANK_TOP }))).toBe(true);
    expect(ledgeBehind(ROAD, raider({ x: 403, y: BANK_TOP, facing: -1 }))).toBe(false);
    expect(ledgeBehind(FLAT_TERRAIN, raider({ x: 203, y: LOG_TOP }))).toBe(false);
  });
});

describe('a ranged raider', () => {
  it('never hops up or drops down to the hero, but still hops a face in its way', () => {
    const ranged = { ranged: true };
    const below = raider({ x: 175, def: ranged });
    expect(planClimb(ROAD, below, hero({ x: 205, y: LOG_TOP }))).toBeNull();
    const onLog = raider({ x: 240, y: LOG_TOP, def: ranged });
    expect(planClimb(ROAD, onLog, hero({ x: 300 }))).toBeNull();
    const walker = raider({ x: 386, state: 'walk', def: ranged });
    expect(planClimb(ROAD, walker, hero({ x: 700 }))).toMatchObject({ action: 'hop' });
  });
});
