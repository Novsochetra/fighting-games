import { describe, expect, it } from 'vitest';
import { GROUND_Y } from '../../../src/config.js';
import { FLAT_TERRAIN } from '../../../src/data/missions/terrain.js';
import {
  blockWall,
  dropThrough,
  floorUnder,
  followFloor,
  isFlat,
  nudge,
  placeOnGround,
} from '../../../src/sim/fighters/terrain-motion.js';
import { STEP_UP } from '../../../src/sim/stage/terrain.js';
import { buildTerrain } from '../../support/terrain-game.js';

// a ramp up 20px from x 100 to 140, a level top to 200, a sheer 20px drop at 200, then a 20px
// sheer step up at 300, and a log 40px up over the road from 400 to 460
const ROAD = buildTerrain({
  ground: [
    [100, 0],
    [140, 20],
    [200, 20],
    [200, 0],
    [300, 0],
    [300, 20],
    [360, 20],
    [360, 0],
  ],
  platforms: [{ at: 400, width: 60, rise: 40, kind: 'planks' }],
});
const LOG_TOP = GROUND_Y - 40;

function fighter(overrides) {
  return {
    x: 0,
    y: GROUND_Y,
    vy: 0,
    airborne: false,
    entering: false,
    state: 'idle',
    ...overrides,
  };
}

describe('the flat road', () => {
  it('is recognised by having no height table and no platforms', () => {
    expect(isFlat(FLAT_TERRAIN)).toBe(true);
    expect(isFlat(ROAD)).toBe(false);
    expect(isFlat(buildTerrain())).toBe(false);
  });

  it('leaves every fighter exactly where it was', () => {
    const lifted = fighter({ x: 50, y: GROUND_Y - 3 });
    followFloor(FLAT_TERRAIN, lifted);
    placeOnGround(FLAT_TERRAIN, lifted);
    expect(lifted).toMatchObject({ y: GROUND_Y - 3, airborne: false, state: 'idle' });
    expect(blockWall(FLAT_TERRAIN, fighter({ x: 52 }), { x: 50, y: GROUND_Y })).toBe(0);
    nudge(FLAT_TERRAIN, lifted, 1.2);
    expect(lifted.x).toBe(51.2);
    expect(dropThrough({ terrain: FLAT_TERRAIN }, lifted)).toBe(false);
  });
});

describe('a fighter on its feet', () => {
  it('follows a ramp up and down', () => {
    const walker = fighter({ x: 120 });
    followFloor(ROAD, walker);
    expect(walker).toMatchObject({ y: GROUND_Y - 10, airborne: false });
    walker.x = 116;
    followFloor(ROAD, walker);
    expect(walker).toMatchObject({ y: GROUND_Y - 8, airborne: false });
  });

  it('walks off a drop taller than a step and starts to fall', () => {
    const walker = fighter({ x: 201, y: GROUND_Y - 20, state: 'walk' });
    followFloor(ROAD, walker);
    expect(walker).toMatchObject({ y: GROUND_Y - 20, airborne: true, state: 'air' });
  });

  it('stays on a platform while it spans the fighter, and falls off its end', () => {
    const walker = fighter({ x: 459, y: LOG_TOP, state: 'walk' });
    followFloor(ROAD, walker);
    expect(walker).toMatchObject({ y: LOG_TOP, airborne: false });
    walker.x = 461;
    followFloor(ROAD, walker);
    expect(walker).toMatchObject({ airborne: true, state: 'air' });
  });

  it('keeps a raider walking in from off screen on the ground, whatever it rises to', () => {
    const raider = fighter({ x: 310, entering: true, state: 'walk' });
    followFloor(ROAD, raider);
    expect(raider.y).toBe(GROUND_Y - 20);
  });

  it('measures the floor under it from its feet', () => {
    expect(floorUnder(ROAD, fighter({ x: 430, y: LOG_TOP - 5 }))).toBe(LOG_TOP);
    expect(floorUnder(ROAD, fighter({ x: 430 }))).toBe(GROUND_Y);
  });
});

describe('walls', () => {
  it('send a fighter back to where it stood and tell which side it hit', () => {
    const walker = fighter({ x: 300.5 });
    expect(blockWall(ROAD, walker, { x: 299, y: GROUND_Y })).toBe(1);
    expect(walker.x).toBe(299);
  });

  it('let a small step or a ramp through', () => {
    const climber = fighter({ x: 300.5 });
    expect(blockWall(ROAD, climber, { x: 299, y: GROUND_Y - 20 + STEP_UP })).toBe(0);
    expect(climber.x).toBe(300.5);
    expect(blockWall(ROAD, fighter({ x: 121 }), { x: 119, y: GROUND_Y - 9 })).toBe(0);
  });

  it('do not stop a raider walking in from off screen', () => {
    const raider = fighter({ x: 300.5, entering: true });
    expect(blockWall(ROAD, raider, { x: 299, y: GROUND_Y })).toBe(0);
  });

  it('stop a push or a pull at the face of a step, and a push up a ramp follows it', () => {
    const pushed = fighter({ x: 299 });
    nudge(ROAD, pushed, 1.2);
    expect(pushed.x).toBe(299);
    const climber = fighter({ x: 120, y: GROUND_Y - 10 });
    nudge(ROAD, climber, 2);
    expect(climber).toMatchObject({ x: 122, y: GROUND_Y - 11 });
  });
});

describe('dropping through a platform', () => {
  it('puts a fighter on a platform one pixel below its top, in the air', () => {
    const hero = fighter({ x: 430, y: LOG_TOP, state: 'walk', vy: 0 });
    expect(dropThrough({ terrain: ROAD }, hero)).toBe(true);
    expect(hero).toMatchObject({ y: LOG_TOP + 1, airborne: true, state: 'air' });
    expect(floorUnder(ROAD, hero)).toBe(GROUND_Y);
  });

  it('does nothing on the ground or in the air', () => {
    expect(dropThrough({ terrain: ROAD }, fighter({ x: 430 }))).toBe(false);
    expect(dropThrough({ terrain: ROAD }, fighter({ x: 430, y: LOG_TOP, airborne: true }))).toBe(
      false,
    );
  });
});

describe('a teleport', () => {
  it('lands on the ground of its new spot', () => {
    const blinker = fighter({ x: 330 });
    placeOnGround(ROAD, blinker);
    expect(blinker.y).toBe(GROUND_Y - 20);
  });
});
