import { describe, expect, it } from 'vitest';
import { GROUND_Y } from '../../../src/config.js';
import { createFighter } from '../../../src/sim/fighters/create-fighter.js';
import { applyPhysics } from '../../../src/sim/fighters/physics.js';
import { groundAt } from '../../../src/sim/stage/terrain.js';
import { buildTerrain } from '../../support/terrain-game.js';
import { createTestGame } from '../../support/test-game.js';

// a slope rising 30px from 100 to 200
const SLOPE = buildTerrain({
  ground: [
    [100, 0],
    [200, 30],
  ],
});

// A knocked-out raider tumbling at the screen edge was dragged up a slope by the scrolling camera
// after its landing was checked, and ended the tick inside the hill.
describe('a body falling at the screen edge on a slope', () => {
  it('lands on the ground where the screen edge puts it, never inside the hill', () => {
    const game = createTestGame();
    Object.assign(game, { terrain: SLOPE, arena: null });
    game.camera.x = 144;
    const fighter = createFighter('enemy', 'grunt', 140, GROUND_Y - 13.5);
    Object.assign(fighter, { state: 'ko', airborne: true, vx: 0, vy: 0.5 });
    applyPhysics(game, fighter);
    expect(fighter.x).toBe(150);
    expect(fighter.y).toBeLessThanOrEqual(groundAt(SLOPE, fighter.x));
  });
});
