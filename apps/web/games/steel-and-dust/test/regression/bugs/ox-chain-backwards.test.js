import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { startMove } from '../../../src/sim/fighters/actions.js';
import { fistOf } from '../../../src/sim/hazards/chain-fist.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

// Bug: once the Warden Ox's hook had caught the hero and dragged them close, its ring was pinned
// behind his fist, so the chain ran back from his fist into his own legs and the hook stuck out of
// his knee while he held the hero for the chop
const originalRandom = Math.random;

describe("the Warden Ox's chain", () => {
  beforeEach(() => {
    Math.random = seededRandom(10);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('runs forward from his fist to the hook all the while he drags and holds the hero', () => {
    const game = createPlayingGame();
    game.missionIndex = 9;
    game.arena = { left: 0, right: 384 };
    game.player.x = 120;
    spawnEnemy(game, 'brute', 1);
    const ox = game.boss;
    Object.assign(ox, { entering: false, x: game.player.x + 170, facing: -1 });
    ox.ai.cooldown = 9999;
    startMove(game, ox, 'chainHook');
    let caughtTicks = 0;
    for (let tick = 0; tick < 160; tick++) {
      runTicks(game, 1);
      ox.ai.cooldown = 9999;
      const hook = game.projectiles.find((shot) => shot.kind === 'chainHook');
      if (hook && (hook.state === 'pull' || hook.state === 'held')) {
        caughtTicks++;
        expect((hook.x - fistOf(ox).x) * ox.facing, `tick ${tick}`).toBeGreaterThan(0);
      }
    }
    expect(caughtTicks).toBeGreaterThan(0);
  });
});
