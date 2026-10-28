import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FX_SPRITES } from '../../../src/data/fx-sprites.js';
import { applyHit } from '../../../src/sim/combat/apply-hit.js';
import { createFighter } from '../../../src/sim/fighters/create-fighter.js';
import { selectMission, startPlay } from '../../../src/sim/stage/flow.js';
import { groundAt } from '../../../src/sim/stage/terrain.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createTestGame, runTicks } from '../../support/test-game.js';

// Bug: a raider knocked into the Angkor moat splashed just where it reached the water, and one
// knocked off a bank sails over the breach and comes down at the foot of the far bank, so the
// splash burst half out of that bank's rock face. It now bursts up out of the breach, as far in
// from either bank as its width needs, which in a breach this narrow is its middle
const ANGKOR_WAT = 10;
const KNOCK = { damage: 5, knockback: [2.4, -2.6], knockdown: true, hitstop: 6, hitstun: 20 };
const originalRandom = Math.random;

// the hero on the near bank knocks a raider at the edge into the breach, all of it on screen
function knockIntoMoat() {
  const game = createTestGame();
  selectMission(game, ANGKOR_WAT);
  startPlay(game);
  const [moat] = game.terrain.water;
  const [heroX, raiderX] = [moat.from - 30, moat.from - 8];
  const raider = createFighter('enemy', 'grunt', raiderX, groundAt(game.terrain, raiderX));
  Object.assign(game.player, { x: heroX, y: groundAt(game.terrain, heroX), facing: 1 });
  game.fighters = [game.player, raider];
  game.camera.x = moat.from - 192;
  applyHit(game, { attacker: game.player, target: raider, move: KNOCK, x: raiderX, y: raider.y });

  return { game, moat };
}

function firstSplash(game) {
  for (let i = 0; i < 60; i++) {
    runTicks(game, 1);
    const splash = game.summons.find((summon) => summon.sprite === 'splash');

    if (splash) {
      return splash;
    }
  }

  return null;
}

describe('the splash of a raider knocked into the Angkor moat', () => {
  beforeEach(() => {
    Math.random = seededRandom(11);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('bursts up out of the middle of the breach, not out of the bank it fell by', () => {
    const { game, moat } = knockIntoMoat();
    const splash = firstSplash(game);
    const width = FX_SPRITES.splash.frameWidth * splash.scale;

    expect(moat.to - moat.from).toBeLessThan(width);
    expect(splash.x).toBe((moat.from + moat.to) / 2);
  });
});
