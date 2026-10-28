import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { VIEW_HEIGHT } from '../../../src/config.js';
import { MOAT } from '../../../src/data/moat.js';
import { applyHit } from '../../../src/sim/combat/apply-hit.js';
import { createFighter } from '../../../src/sim/fighters/create-fighter.js';
import { selectMission, startPlay } from '../../../src/sim/stage/flow.js';
import { groundAt } from '../../../src/sim/stage/terrain.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createTestGame, runTicks } from '../../support/test-game.js';

// Bug: a raider rung out in the Angkor moat vanished in mid-air just under the road, its gold
// knock-out ring flashing there, while its splash burst up from the bottom of the screen. The
// water now lies just under the bottom of the screen, where the splash rises: a raider falls until
// it reaches it, is rung out there, and sinks on out of sight under the splash before it is gone
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

  return { game, raider };
}

// where its feet and the top of its head are each tick, and whether it is out yet, until it is gone
function fallOf(game, raider) {
  const steps = [];

  for (let i = 0; i < 120 && !raider.removed; i++) {
    runTicks(game, 1);
    steps.push({
      y: raider.y,
      top: raider.y - MOAT.raiderHeight * raider.scale,
      out: raider.state === 'ko',
    });
  }

  return steps;
}

describe('a raider knocked into the Angkor moat', () => {
  beforeEach(() => {
    Math.random = seededRandom(11);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('is rung out only once it has fallen past the bottom of the screen', () => {
    const { game, raider } = knockIntoMoat();
    const ringOut = fallOf(game, raider).find((step) => step.out);

    expect(ringOut.y).toBeGreaterThan(VIEW_HEIGHT);
  });

  it('sinks on out of sight, never coming back up, before it is gone', () => {
    const { game, raider } = knockIntoMoat();
    const sinking = fallOf(game, raider).filter((step) => step.out);

    expect(raider.removed).toBe(true);
    expect(sinking.length).toBeGreaterThan(1);
    sinking.slice(1).forEach((step, i) => expect(step.y).toBeGreaterThanOrEqual(sinking[i].y));
    expect(sinking.at(-1).top).toBeGreaterThan(VIEW_HEIGHT);
  });
});
