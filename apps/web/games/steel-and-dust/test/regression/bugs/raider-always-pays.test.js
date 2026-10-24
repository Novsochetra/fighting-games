import { describe, expect, it } from 'vitest';
import { dropLoot } from '../../../src/sim/items/loot-drops.js';
import { createLootGame, spawnEnemy } from '../../support/loot-game.js';

// Bug: every raider knocked down spilled coins, so coins rained over every fight and stopped
// feeling like a reward; now most raiders fall with nothing to drop
describe('raiders knocked down', () => {
  it('drop coins only now and then', () => {
    const { game } = createLootGame();
    const raider = spawnEnemy(game, 'grunt', 160);
    let paid = 0;
    for (let i = 0; i < 50; i++) {
      game.loot = [];
      dropLoot(game, raider);
      paid += game.loot.some((piece) => piece.kind === 'coin') ? 1 : 0;
    }
    expect(paid).toBeGreaterThan(5);
    expect(paid).toBeLessThan(35);
  });
});
