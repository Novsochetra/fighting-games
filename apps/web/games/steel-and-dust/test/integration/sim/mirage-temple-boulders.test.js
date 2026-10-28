import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFighter } from '../../../src/sim/fighters/create-fighter.js';
import { cameraTarget } from '../../../src/sim/stage/camera.js';
import { selectMission, startPlay } from '../../../src/sim/stage/flow.js';
import { missionOf } from '../../../src/sim/stage/mission.js';
import { createBot } from '../../support/bot.js';
import { createGameDriver, createScenarioGame } from '../../support/game-driver.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createTestGame, runTicks, tap } from '../../support/test-game.js';

const MIRAGE_TEMPLE = 8;
// the hero jumps once it is this close
const JUMP_FROM = 64;
const originalRandom = Math.random;

// the first fight on its last wave, so no more raiders walk in, two raiders behind the hero just
// short of the first boulder's spot
function beforeTheBoulder() {
  const game = createTestGame();
  selectMission(game, MIRAGE_TEMPLE);
  startPlay(game);
  const [boulder] = game.boulders;
  const zone = missionOf(game).zones[0];
  game.arena = { left: zone.left, right: zone.right };
  Object.assign(game.stage, { zoneIndex: 0, waveIndex: zone.waves.length - 1 });
  Object.assign(game.player, { x: boulder.spot - 6, facing: 1 });
  game.camera.x = cameraTarget(game);
  const raiders = [boulder.spot - 90, boulder.spot - 130].map((x) => {
    const raider = createFighter('enemy', 'ghoul', x, 184);
    raider.facing = 1;

    return raider;
  });
  game.fighters = [game.player, ...raiders];

  return { game, boulder, raiders };
}

function untilClose(game, boulder) {
  for (let tick = 0; tick < 400; tick++) {
    if (boulder.state === 'rolling' && boulder.x - game.player.x < JUMP_FROM) {
      return;
    }
    runTicks(game, 1);
  }
}

describe('the boulders of the Mirage Temple', () => {
  beforeEach(() => {
    Math.random = seededRandom(23);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('break loose as the hero passes, roll over him as he jumps, and flatten the raiders behind', () => {
    const { game, boulder, raiders } = beforeTheBoulder();

    game.player.x = boulder.spot + 2;
    runTicks(game, 2);
    expect(boulder.state).toBe('loose');
    untilClose(game, boulder);
    tap(game, 'jump');
    runTicks(game, 160);

    expect(boulder.state).toBe('gone');
    expect(boulder.struck).not.toContain(game.player);
    expect(raiders.map((raider) => raider.state)).toEqual(['ko', 'ko']);
  });

  it('roll once in a bot-played fight, and the bot fights on through to the next one', () => {
    Math.random = seededRandom(9);
    const game = createScenarioGame('moss', MIRAGE_TEMPLE);
    const driver = createGameDriver(game);
    const bot = createBot(driver, {});
    driver.act('play');
    for (let tick = 0; tick < 6000 && game.stage.zoneIndex < 1; tick++) {
      bot.step(tick);
      driver.tick();
      driver.afterTick();
      game.player.hp = game.player.maxHp;
    }

    expect(game.boulders[0].state).toBe('gone');
    expect(game.stage.zoneIndex).toBe(1);
  });
});
