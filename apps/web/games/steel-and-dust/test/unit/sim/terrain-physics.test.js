import { describe, expect, it } from 'vitest';
import { GROUND_Y } from '../../../src/config.js';
import { createFighter } from '../../../src/sim/fighters/create-fighter.js';
import { applyPhysics } from '../../../src/sim/fighters/physics.js';
import { buildTerrain } from '../../support/terrain-game.js';
import { createTestGame } from '../../support/test-game.js';

// a 6px kerb at 100, a 20px step at 200 that ends in a sheer drop at 260, and a log 40px over
// the road from 300 to 360
const ROAD = buildTerrain({
  ground: [
    [100, 0],
    [100, 6],
    [140, 6],
    [140, 0],
    [200, 0],
    [200, 20],
    [260, 20],
    [260, 0],
  ],
  platforms: [{ at: 300, width: 60, rise: 40, kind: 'log' }],
});
const LOG_TOP = GROUND_Y - 40;

function fighterOn(fields) {
  const game = createTestGame();
  game.terrain = ROAD;
  const fighter = createFighter('enemy', 'grunt', fields.x, GROUND_Y);
  Object.assign(fighter, fields);
  return { game, fighter };
}

function step(game, fighter, ticks = 1) {
  for (let i = 0; i < ticks; i++) {
    applyPhysics(game, fighter);
  }
}

describe('landing on a platform', () => {
  it('catches a fighter coming down onto it from above', () => {
    const { game, fighter } = fighterOn({ x: 330, y: LOG_TOP - 3, vy: 4, airborne: true });
    step(game, fighter);
    expect(fighter).toMatchObject({ y: LOG_TOP, vy: 0, airborne: false });
  });

  it('lets a fighter rising from below pass through its top', () => {
    const { game, fighter } = fighterOn({ x: 330, y: LOG_TOP + 2, vy: -3, airborne: true });
    step(game, fighter);
    expect(fighter.y).toBeLessThan(LOG_TOP);
    expect(fighter.airborne).toBe(true);
  });

  it('lets a fighter falling under it drop on to the ground', () => {
    const { game, fighter } = fighterOn({ x: 330, y: LOG_TOP + 5, vy: 2, airborne: true });
    step(game, fighter, 60);
    expect(fighter).toMatchObject({ y: GROUND_Y, airborne: false });
  });

  it('bounces a juggled raider off the platform and brings it down on the platform again', () => {
    const { game, fighter } = fighterOn({ x: 330, y: LOG_TOP - 3, vy: 4, airborne: true });
    Object.assign(fighter, { state: 'juggle', groundBounce: true });
    step(game, fighter);
    expect(fighter).toMatchObject({ y: LOG_TOP - 1, airborne: true, groundBounceUsed: true });
    step(game, fighter, 40);
    expect(fighter).toMatchObject({ y: LOG_TOP, airborne: false, state: 'down' });
  });
});

describe('steps and walls', () => {
  it('walks up a kerb no taller than a step', () => {
    const { game, fighter } = fighterOn({ x: 98, state: 'walk', vx: 1.5 });
    step(game, fighter, 4);
    expect(fighter.x).toBeGreaterThan(100);
    expect(fighter).toMatchObject({ y: GROUND_Y - 6, airborne: false });
  });

  it('stops at a rise taller than a step', () => {
    const { game, fighter } = fighterOn({ x: 197, state: 'walk', vx: 1.5 });
    step(game, fighter, 4);
    expect(fighter.x).toBeLessThan(200);
    expect(fighter).toMatchObject({ y: GROUND_Y, vx: 0, airborne: false });
  });

  it('bounces a fast juggled raider off the face of a step', () => {
    const { game, fighter } = fighterOn({ x: 198, y: GROUND_Y - 2, airborne: true });
    Object.assign(fighter, { state: 'juggle', vx: 3, vy: -1 });
    step(game, fighter);
    expect(fighter.x).toBe(198);
    expect(fighter.vx).toBeCloseTo(-3 * 0.985 * 0.45);
    expect(fighter.wallBounced).toBe(true);
  });

  it('walks off a ledge into the air and lands on the road below', () => {
    const { game, fighter } = fighterOn({ x: 258, y: GROUND_Y - 20, state: 'walk', vx: 1.5 });
    step(game, fighter, 2);
    expect(fighter).toMatchObject({ state: 'air', airborne: true });
    step(game, fighter, 30);
    expect(fighter).toMatchObject({ y: GROUND_Y, airborne: false, state: 'idle' });
  });
});
