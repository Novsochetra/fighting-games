import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SLAB } from '../../../src/data/slabs.js';
import { applyHit } from '../../../src/sim/combat/apply-hit.js';
import { createFighter } from '../../../src/sim/fighters/create-fighter.js';
import { selectMission, startPlay } from '../../../src/sim/stage/flow.js';
import { missionOf } from '../../../src/sim/stage/mission.js';
import { groundAt } from '../../../src/sim/stage/terrain.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createTestGame, press, release, runTicks, tap } from '../../support/test-game.js';

const BAYON = 11;
const originalRandom = Math.random;
// a launcher that throws a raider up and down a little way along the floor
const LAUNCH = { damage: 4, knockback: [0.6, -4], launch: true, hitstop: 6, hitstun: 20 };

// the hero beside the first slab, in a fight on its last wave so no more raiders walk in
function inTheGallery() {
  const game = createTestGame();
  selectMission(game, BAYON);
  startPlay(game);
  const [slab] = game.slabs;
  const zones = missionOf(game).zones;
  const zoneIndex = zones.findIndex((zone) => slab.x > zone.left && slab.x < zone.right);
  game.arena = { left: zones[zoneIndex].left, right: zones[zoneIndex].right };
  Object.assign(game.stage, { zoneIndex, waveIndex: zones[zoneIndex].waves.length - 1 });
  game.fighters = [game.player];
  game.camera.x = slab.x - 192;

  return { game, slab };
}

function standHero(game, x) {
  Object.assign(game.player, { x, y: groundAt(game.terrain, x), facing: 1 });
}

describe('the cracked slabs in the Bayon galleries', () => {
  beforeEach(() => {
    Math.random = seededRandom(17);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('crack under a raider thrown down on one, and drop it through half a second later', () => {
    const { game, slab } = inTheGallery();
    standHero(game, slab.x - 60);
    const raider = createFighter('enemy', 'juggernaut', slab.x, slab.y);
    raider.facing = -1;
    game.fighters.push(raider);

    applyHit(game, {
      attacker: game.player,
      target: raider,
      move: LAUNCH,
      x: raider.x,
      y: raider.y,
    });
    runTicks(game, 50);
    expect(slab.state).toBe('cracking');
    expect(game.fighters).toContain(raider);

    runTicks(game, SLAB.crack);
    expect(slab.state).not.toBe('cracking');
    expect(raider.state).toBe('ko');
    expect(game.fighters).not.toContain(raider);
  });

  it("crack under the hero's dive, and throw the hero out still standing on it, hurt", () => {
    const { game, slab } = inTheGallery();
    standHero(game, slab.x - 12);
    game.ultMeter = 100;
    const before = game.player.hp;

    tap(game, 'jump');
    runTicks(game, 10);
    press(game, 'down');
    tap(game, 'heavy');
    release(game, 'down');
    runTicks(game, 20);
    expect(slab.state).toBe('cracking');

    runTicks(game, SLAB.crack + 60);
    expect(slab.state).toBe('broken');
    expect(game.player.hp).toBeLessThan(before);
    expect(game.player.hp).toBeGreaterThan(0);
    expect(Math.abs(game.player.x - slab.x)).toBeGreaterThan(SLAB.halfWidth);
    expect(game.player.y).toBe(groundAt(game.terrain, game.player.x));
  });
});
