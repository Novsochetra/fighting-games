import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { lastFootfall, stomp } from '../../../src/sim/bosses/stomp.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { createPlayingGame } from '../../support/test-game.js';

const originalRandom = Math.random;

function walkingGuardian() {
  const game = createPlayingGame();
  game.missionIndex = 11;
  spawnEnemy(game, 'guardian', 1);
  Object.assign(game.boss, { entering: false, x: 240, facing: -1 });
  return { game, guardian: game.boss };
}

describe("the colossus's footfalls", () => {
  beforeEach(() => {
    // dust lands just where it is thrown with the middle of every random range
    Math.random = () => 0.5;
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('have not fallen before his first step lands', () => {
    const { game, guardian } = walkingGuardian();
    expect(lastFootfall(guardian).since).toBe(Infinity);
    stomp(game, guardian);
    expect(lastFootfall(guardian).since).toBe(Infinity);
  });

  it('are found where each foot came down, counting the ticks since', () => {
    const { game, guardian } = walkingGuardian();
    const falls = [];
    for (let tick = 0; tick < 100; tick++) {
      const dust = game.particles.length;
      stomp(game, guardian);
      if (game.particles.length > dust) {
        falls.push({ dust: game.particles[dust].x, ...lastFootfall(guardian) });
      }
    }
    expect(falls.length).toBe(4);
    for (const fall of falls) {
      expect(fall.since).toBe(0);
      expect(fall.x).toBe(fall.dust);
    }
    expect(falls[0].x).not.toBe(falls[1].x);
    expect(falls[0].x).toBe(falls[2].x);
    stomp(game, guardian);
    expect(lastFootfall(guardian)).toEqual({ x: falls[3].x, since: 5 });
  });
});
