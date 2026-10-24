import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { runTicks } from '../../support/test-game.js';
import { facingKhan, fireUltimate, hpShare } from '../../support/boss-ult.js';
import { seededRandom } from '../../support/seeded-random.js';

// Bug: the bar holds two ultimates, filled on the raiders before the boss, and an ultimate struck
// a boss standing alone as hard as a whole crowd: two from Bokator or the Angkor Warrior left
// Gravel Khan, the first boss, with a twentieth of his health, and all of Firefly's swarm stung him
// at once. A boss now takes half of an ultimate, and the swarm shares its stings out for a crowd
const originalRandom = Math.random;

describe('two banked ultimates on the first boss', () => {
  beforeEach(() => {
    Math.random = seededRandom(7);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  for (const hero of ['bokator', 'angkor', 'firefly']) {
    it(`leave Gravel Khan more than a third of his health (${hero})`, () => {
      const game = facingKhan(hero);
      expect(fireUltimate(game)).toBe(true);
      runTicks(game, 2);
      expect(fireUltimate(game)).toBe(true);
      expect(hpShare(game.boss)).toBeGreaterThan(1 / 3);
    });
  }
});
