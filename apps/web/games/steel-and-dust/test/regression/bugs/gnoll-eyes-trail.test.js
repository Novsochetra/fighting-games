import { describe, expect, it } from 'vitest';
import { enemySpriteFrame } from '../../../src/sim/enemy-animation.js';
import { startMove } from '../../../src/sim/fighters/actions.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

// his eyes on the frenzy's lunge frames, read off his sheet in his own units: the last frame
// thrusts his head forward, and on the others his face is behind his forearm
const EYES_ON = { 4: [12, 27], 5: [13, 26], 6: [12, 27], 7: [21.5, 25] };

// Bug: drawn at his size, the Gnoll Packlord's red eyes trailed from the empty air above and ahead
// of his head through the whole Blood Frenzy
describe("the Gnoll Packlord's Blood Frenzy", () => {
  it('trails red from his eyes on every lunge frame', () => {
    const game = createPlayingGame();
    game.arena = { left: 0, right: 384 };
    game.player.x = 40;
    game.player.invincible = 9999;
    spawnEnemy(game, 'gnoll', 1);
    const gnoll = game.boss;
    Object.assign(gnoll, { entering: false, x: 300, facing: -1 });
    gnoll.ai.cooldown = 9999;
    startMove(game, gnoll, 'bloodFrenzy');
    runTicks(game, gnoll.move.startup);
    const seen = new Set();
    for (let tick = 0; tick < 24; tick++) {
      const before = game.summons.length;
      runTicks(game, 1);
      const trail = game.summons.slice(before).find((burst) => burst.sprite === 'redeye');
      if (trail) {
        const [, frame] = enemySpriteFrame(gnoll);
        const [ahead, up] = EYES_ON[frame];
        expect(Math.abs((gnoll.x - trail.x) / gnoll.scale - ahead), `frame ${frame}`).toBeLessThan(
          1,
        );
        expect(Math.abs((gnoll.y - trail.y) / gnoll.scale - up), `frame ${frame}`).toBeLessThan(1);
        seen.add(frame);
      }
    }
    expect(seen.size).toBeGreaterThan(2);
  });
});
