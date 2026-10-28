import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { applyHit } from '../../../src/sim/combat/apply-hit.js';
import { createFighter } from '../../../src/sim/fighters/create-fighter.js';
import { selectMission, startPlay } from '../../../src/sim/stage/flow.js';
import { missionOf } from '../../../src/sim/stage/mission.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createTestGame, runTicks } from '../../support/test-game.js';

const RAIDER_CAMP = 3;
const originalRandom = Math.random;
// a heavy hit that sends a raider tumbling a little way along the road
const KNOCK = { damage: 4, knockback: [2.6, -2.2], knockdown: true, hitstop: 6, hitstun: 20 };

// the fight around the camp's first fire, on its last wave so no more raiders walk in
function atTheFire() {
  const game = createTestGame();
  selectMission(game, RAIDER_CAMP);
  startPlay(game);
  const [fire] = game.campfires;
  const zone = missionOf(game).zones[0];
  game.arena = { left: zone.left, right: zone.right };
  Object.assign(game.stage, { zoneIndex: 0, waveIndex: zone.waves.length - 1 });
  game.fighters = [game.player];
  Object.assign(game.player, { x: fire.x - 50, y: fire.y, facing: 1 });
  game.camera.x = fire.x - 192;

  return { game, fire };
}

describe('the campfires of the raider camp', () => {
  beforeEach(() => {
    Math.random = seededRandom(9);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('set a raider knocked into one alight, and it burns on after it gets out', () => {
    const { game, fire } = atTheFire();
    const raider = createFighter('enemy', 'grunt', fire.x - 30, fire.y);
    raider.facing = -1;
    game.fighters.push(raider);

    applyHit(game, {
      attacker: game.player,
      target: raider,
      move: KNOCK,
      x: raider.x,
      y: raider.y,
    });
    runTicks(game, 40);
    const burning = game.summons.find((summon) => summon.kind === 'burn');
    const hp = raider.hp;
    runTicks(game, 100);

    expect(burning?.target).toBe(raider);
    expect(raider.hp).toBeLessThan(hp);
  });
});
