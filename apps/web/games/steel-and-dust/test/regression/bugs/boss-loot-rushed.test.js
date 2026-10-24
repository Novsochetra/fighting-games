import { describe, expect, it } from 'vitest';
import { knockOut } from '../../../src/sim/combat/knock-out.js';
import { createLootGame, spawnEnemy } from '../../support/loot-game.js';
import { press, release, runTicks } from '../../support/test-game.js';

// Bug: the moment the mission's boss fell, Mission complete stamped in and the road wiped away
// under three seconds later, so the hero stood frozen while the chest's loot flew in by itself. The
// hero now has the loot time to walk about and fetch it before the clear and its summary
function felledMissionBoss() {
  const { game } = createLootGame();
  runTicks(game, 2);
  const boss = spawnEnemy(game, 'khan', game.player.x + 90);
  game.boss = boss;
  knockOut(game, boss, 1);
  return game;
}

describe("the mission boss's fall", () => {
  it('leaves the hero free on the road for a while before Mission complete', () => {
    const game = felledMissionBoss();
    runTicks(game, 180);
    expect(game.clearTime).toBe(0);
    expect(game.banner?.text).not.toBe('Mission complete');
    const x = game.player.x;
    press(game, 'right');
    runTicks(game, 20);
    release(game, 'right');
    expect(game.player.x).toBeGreaterThan(x);
  });

  it("leaves the chest's loot lying for the hero to fetch", () => {
    const game = felledMissionBoss();
    game.player.x -= 80;
    runTicks(game, 180);
    expect(game.loot.length).toBeGreaterThan(10);
    expect(game.clearTime).toBe(0);
  });
});
