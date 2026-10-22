import { describe, expect, it } from 'vitest';
import { groundAt } from '../../../src/sim/stage/terrain.js';
import { createPlayingGame, runTicks, tap } from '../../support/test-game.js';

// Bug: Bokator's lion ran straight lines between points in the air, so each leap was a sharp V that
// snapped from rising to falling in one tick, and the run looked like it skipped frames.
const SMOOTH = 2;

function lionPath() {
  const game = createPlayingGame({ settings: { hero: 'bokator' } });
  runTicks(game, 30);
  game.ultMeter = 100;
  tap(game, 'ult');
  const path = [];
  let lion = null;
  while (game.player.state === 'ult') {
    runTicks(game, 1);
    lion ??= game.summons.find((summon) => summon.kind === 'lion');
    if (lion && lion.time > lion.appear && !lion.fade) {
      path.push({ y: lion.y, airborne: groundAt(game.terrain, lion.x) - lion.y > 1 });
    }
  }
  return path;
}

describe("Pounding the Lion's run", () => {
  it('turns from rising to falling smoothly anywhere in the air', () => {
    const path = lionPath();
    expect(path.filter((point) => point.airborne).length).toBeGreaterThan(24);
    for (let i = 2; i < path.length; i++) {
      if (path[i - 1].airborne) {
        const bend = path[i].y - 2 * path[i - 1].y + path[i - 2].y;
        expect(Math.abs(bend), `tick ${i} of the run`).toBeLessThanOrEqual(SMOOTH);
      }
    }
  });
});
