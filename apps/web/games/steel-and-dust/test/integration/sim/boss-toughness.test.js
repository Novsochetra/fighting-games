import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HEROES } from '../../../src/data/heroes.js';
import { selectMission, startPlay } from '../../../src/sim/stage/flow.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { facingKhan, fireUltimate, hpShare } from '../../support/boss-ult.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createTestGame } from '../../support/test-game.js';

const originalRandom = Math.random;

function onLastRoad() {
  const game = createTestGame();
  selectMission(game, 11);
  startPlay(game);
  return game;
}

describe('bosses against ultimates', () => {
  beforeEach(() => {
    Math.random = seededRandom(11);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it("takes less than a third of the first boss's health with any Shade's ultimate", () => {
    for (const { id } of HEROES) {
      const game = facingKhan(id);
      expect(fireUltimate(game), id).toBe(true);
      expect(hpShare(game.boss), id).toBeLessThan(1);
      expect(hpShare(game.boss), id).toBeGreaterThan(2 / 3);
    }
  });
});

describe('bosses on later roads', () => {
  it('come with more health, the bar full', () => {
    const game = onLastRoad();
    spawnEnemy(game, 'guardian', 1);
    expect(game.boss).toMatchObject({ hp: 518, maxHp: 518, hpLag: 518 });
  });

  it('are tougher when met again as a mid-boss', () => {
    const game = onLastRoad();
    spawnEnemy(game, 'pharaoh', 1);
    expect(game.boss).toMatchObject({ hp: 418, maxHp: 418 });
  });

  it('leave the raiders as they were', () => {
    const game = onLastRoad();
    spawnEnemy(game, 'grunt', 1);
    const grunt = game.fighters.at(-1);
    expect(grunt.hp).toBe(grunt.def.hp);
  });
});
