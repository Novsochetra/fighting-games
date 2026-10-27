import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HAMMER } from '../../../src/data/hammers.js';
import { applyHit } from '../../../src/sim/combat/apply-hit.js';
import { createFighter } from '../../../src/sim/fighters/create-fighter.js';
import { selectMission, startPlay } from '../../../src/sim/stage/flow.js';
import { missionOf } from '../../../src/sim/stage/mission.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createTestGame, runTicks } from '../../support/test-game.js';

const IRON_WORKS = 7;
const SLAM_AT = HAMMER.rest + HAMMER.warn + HAMMER.drop;
const originalRandom = Math.random;
// a hit that knocks a raider down a little way along the floor
const KNOCK = { damage: 4, knockback: [1.4, -2], knockdown: true, hitstop: 6, hitstun: 20 };

// the fight around the first hammer, on its last wave so no more raiders walk in
function atTheHammer() {
  const game = createTestGame();
  selectMission(game, IRON_WORKS);
  startPlay(game);
  const [hammer] = game.hammers;
  const zone = missionOf(game).zones[0];
  game.arena = { left: zone.left, right: zone.right };
  Object.assign(game.stage, { zoneIndex: 0, waveIndex: zone.waves.length - 1 });
  game.fighters = [game.player];
  Object.assign(game.player, { x: hammer.x - 36, y: hammer.y, facing: 1 });
  game.camera.x = hammer.x - 192;

  return { game, hammer };
}

describe('the drop hammers of the iron works', () => {
  beforeEach(() => {
    Math.random = seededRandom(13);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('crush a raider knocked down under one just before it drops', () => {
    const { game, hammer } = atTheHammer();
    const raider = createFighter('enemy', 'grunt', hammer.x - 16, hammer.y);
    raider.facing = -1;
    game.fighters.push(raider);
    hammer.time = SLAM_AT - 16;

    applyHit(game, {
      attacker: game.player,
      target: raider,
      move: KNOCK,
      x: raider.x,
      y: raider.y,
    });
    runTicks(game, 30);

    expect(raider.state).toBe('ko');
    expect(game.player.hp).toBe(game.player.maxHp);
  });
});
