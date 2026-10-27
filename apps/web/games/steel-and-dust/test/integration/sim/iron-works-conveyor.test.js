import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CONVEYOR, mouthOf } from '../../../src/data/conveyors.js';
import { applyHit } from '../../../src/sim/combat/apply-hit.js';
import { createFighter } from '../../../src/sim/fighters/create-fighter.js';
import { selectMission, startPlay } from '../../../src/sim/stage/flow.js';
import { missionOf } from '../../../src/sim/stage/mission.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createTestGame, runTicks } from '../../support/test-game.js';

const IRON_WORKS = 7;
const originalRandom = Math.random;
// a hit that knocks a raider down a little way along the floor
const KNOCK = { damage: 4, knockback: [1.4, -2], knockdown: true, hitstop: 6, hitstun: 20 };

// the fight on the belt's screen, on its last wave so no more raiders walk in, with the hero
// standing `upBelt` px up the belt from the furnace's mouth
function onTheBelt(upBelt) {
  const game = createTestGame();
  selectMission(game, IRON_WORKS);
  startPlay(game);
  const [belt] = game.conveyors;
  const zones = missionOf(game).zones;
  const zoneIndex = zones.findIndex((zone) => belt.from > zone.left && belt.to < zone.right);
  const zone = zones[zoneIndex];
  game.arena = { left: zone.left, right: zone.right };
  Object.assign(game.stage, { zoneIndex, waveIndex: zone.waves.length - 1 });
  game.fighters = [game.player];
  const x = mouthOf(belt) - belt.direction * upBelt;
  Object.assign(game.player, { x, y: belt.y, facing: belt.direction });
  game.camera.x = zone.right - 384;

  return { game, belt };
}

// the hero knocks a raider down toward the furnace, a little way short of its mouth
function knockDownOnTheBelt() {
  const { game, belt } = onTheBelt(50);
  const raider = createFighter('enemy', 'scrapper', game.player.x + belt.direction * 18, belt.y);
  raider.facing = -belt.direction;
  game.fighters.push(raider);

  applyHit(game, { attacker: game.player, target: raider, move: KNOCK, x: raider.x, y: raider.y });

  return { game, raider };
}

describe('the conveyor belt of the iron works', () => {
  beforeEach(() => {
    Math.random = seededRandom(21);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('feeds a raider knocked down on it to the furnace before it gets up', () => {
    const { game, raider } = knockDownOnTheBelt();
    const score = game.score;

    runTicks(game, 90);

    expect(raider).toMatchObject({ removed: true, state: 'ko' });
    expect(game.fighters).not.toContain(raider);
    expect(game.score).toBeGreaterThan(score + CONVEYOR.smeltBonus);
  });

  it('is what feeds it: on a still floor the raider gets back up', () => {
    const { game, raider } = knockDownOnTheBelt();
    game.conveyors = [];

    runTicks(game, 90);

    expect(raider.removed).toBeFalsy();
    expect(raider.hp).toBeGreaterThan(0);
  });

  it('carries the hero standing on it toward the furnace', () => {
    const { game, belt } = onTheBelt(100);
    const start = game.player.x;

    runTicks(game, 60);

    expect((game.player.x - start) * belt.direction).toBeCloseTo(60 * CONVEYOR.speed, 0);
    expect(game.player.hp).toBe(game.player.maxHp);
  });
});
