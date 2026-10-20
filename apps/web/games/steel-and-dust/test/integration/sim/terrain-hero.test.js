import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { GROUND_Y } from '../../../src/config.js';
import { groundAt } from '../../../src/sim/stage/terrain.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createTerrainGame, placeFighter } from '../../support/terrain-game.js';
import { press, release, runTicks, tap } from '../../support/test-game.js';

const originalRandom = Math.random;

// holds a direction until the hero reaches x or the ticks run out, checking him every tick
function walkTo(game, x, check = () => {}) {
  const side = Math.sign(x - game.player.x);
  const direction = side > 0 ? 'right' : 'left';
  press(game, direction);
  for (let i = 0; i < 600 && Math.sign(x - game.player.x) === side; i++) {
    runTicks(game, 1);
    check(game.player);
  }
  release(game, direction);
}

function holdFor(game, action, ticks) {
  press(game, action);
  runTicks(game, ticks);
  release(game, action);
}

describe('the hero on uneven ground', () => {
  beforeEach(() => {
    Math.random = seededRandom(11);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('walks up a ramp and down the other side without ever leaving his feet', () => {
    const game = createTerrainGame({
      ground: [
        [150, 0],
        [200, 24],
        [250, 24],
        [300, 0],
      ],
    });
    const heights = new Set();
    const onHisFeet = (player) => {
      expect(player.airborne).toBe(false);
      expect(player.state).toBe('walk');
      expect(player.y).toBe(groundAt(game.terrain, player.x));
      heights.add(player.y);
    };
    walkTo(game, 330, onHisFeet);
    walkTo(game, 120, onHisFeet);
    expect(Math.min(...heights)).toBe(GROUND_Y - 24);
    expect(game.player.y).toBe(GROUND_Y);
  });

  it('is stopped by a 20px step and jumps up onto it', () => {
    const game = createTerrainGame({
      ground: [
        [200, 0],
        [200, 20],
        [300, 20],
        [300, 0],
      ],
    });
    holdFor(game, 'right', 120);
    expect(game.player.x).toBeLessThan(200);
    expect(game.player).toMatchObject({ y: GROUND_Y, airborne: false });
    press(game, 'right');
    tap(game, 'jump');
    runTicks(game, 50);
    release(game, 'right');
    runTicks(game, 10);
    expect(game.player.x).toBeGreaterThan(200);
    expect(game.player).toMatchObject({ y: GROUND_Y - 20, airborne: false });
  });

  it('walks off a ledge into the air and lands on the road below', () => {
    const game = createTerrainGame({
      ground: [
        [100, 0],
        [100, 30],
        [200, 30],
        [200, 0],
      ],
    });
    placeFighter(game, game.player, { x: 180 });
    const states = [];
    walkTo(game, 240, (player) => states.push(player.state));
    runTicks(game, 30);
    expect(states).toContain('air');
    expect(game.player).toMatchObject({ y: GROUND_Y, airborne: false });
  });

  it('jumps up through a platform onto it, then drops through it and walks off its end', () => {
    const game = createTerrainGame({
      platforms: [{ at: 160, width: 80, rise: 40, kind: 'planks' }],
    });
    const top = GROUND_Y - 40;
    placeFighter(game, game.player, { x: 200 });
    tap(game, 'jump');
    runTicks(game, 60);
    expect(game.player).toMatchObject({ y: top, airborne: false });

    press(game, 'down');
    tap(game, 'jump');
    release(game, 'down');
    expect(game.player).toMatchObject({ state: 'air', airborne: true });
    runTicks(game, 40);
    expect(game.player).toMatchObject({ y: GROUND_Y, airborne: false });

    tap(game, 'jump');
    runTicks(game, 60);
    expect(game.player.y).toBe(top);
    walkTo(game, 250);
    runTicks(game, 40);
    expect(game.player).toMatchObject({ y: GROUND_Y, airborne: false });
  });
});
