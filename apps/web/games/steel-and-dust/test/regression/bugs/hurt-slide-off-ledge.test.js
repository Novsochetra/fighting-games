import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { GROUND_Y } from '../../../src/config.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createTerrainGame, placeFighter } from '../../support/terrain-game.js';
import { runTicks } from '../../support/test-game.js';

const originalRandom = Math.random;

// a bank 30px up from the start of the road to x 200, then a sheer drop to the road
const LEDGE = {
  ground: [
    [0, 30],
    [200, 30],
    [200, 0],
  ],
};

describe('a raider whose hurt slide carries it off a ledge', () => {
  beforeEach(() => {
    Math.random = seededRandom(5);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('is in the air, not standing idle, when its hitstun runs out before it lands', () => {
    const game = createTerrainGame(LEDGE);
    placeFighter(game, game.player, { x: 600 });
    spawnEnemy(game, 'grunt', 1);
    const raider = game.fighters.find((fighter) => fighter.side === 'enemy');
    raider.entering = false;
    placeFighter(game, raider, { x: 196 });
    Object.assign(raider, { state: 'hurt', stateTime: 6, vx: 2.5 });
    while (raider.state === 'hurt') {
      runTicks(game, 1);
    }
    expect(raider.airborne).toBe(true);
    expect(raider.state).toBe('air');
    runTicks(game, 30);
    expect(raider).toMatchObject({ airborne: false, y: GROUND_Y });
  });
});
