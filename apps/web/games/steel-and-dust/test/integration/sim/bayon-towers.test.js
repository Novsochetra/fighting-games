import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { STONES, TOWER } from '../../../src/data/towers.js';
import { createFighter } from '../../../src/sim/fighters/create-fighter.js';
import { selectMission, startPlay } from '../../../src/sim/stage/flow.js';
import { missionOf } from '../../../src/sim/stage/mission.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createTestGame, runTicks, tap } from '../../support/test-game.js';

const BAYON = 11;
const originalRandom = Math.random;

// the hero beside the last face tower, in a fight on its last wave so no more raiders walk in
function besideTheTower() {
  const game = createTestGame();
  selectMission(game, BAYON);
  startPlay(game);
  const tower = game.towers.at(-1);
  const zones = missionOf(game).zones;
  const zoneIndex = zones.findIndex((zone) => tower.x > zone.left && tower.x < zone.right);
  game.arena = { left: zones[zoneIndex].left, right: zones[zoneIndex].right };
  Object.assign(game.stage, { zoneIndex, waveIndex: zones[zoneIndex].waves.length - 1 });
  game.fighters = [game.player];
  Object.assign(game.player, { x: tower.x - 28, y: tower.y, facing: 1 });
  game.camera.x = tower.x - 192;

  return { game, tower };
}

function runUntil(game, done) {
  for (let i = 0; i < 200 && !done(); i++) {
    runTicks(game, 1);
  }
}

describe('the face towers of the Bayon', () => {
  beforeEach(() => {
    Math.random = seededRandom(23);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('come apart under a blow, and drop their stones on raiders kept under the shadows', () => {
    const { game, tower } = besideTheTower();

    tap(game, 'light');
    runTicks(game, 12);
    expect(tower.state).toBe('cracking');

    runUntil(game, () => tower.state !== 'cracking');
    expect(tower.state).toBe('breaking');
    expect(tower.stones).toHaveLength(STONES.count);

    const stone = tower.stones[2];
    runTicks(game, stone.land - stone.time - 10);
    const raider = createFighter('enemy', 'grunt', stone.x, stone.floor);
    raider.facing = -1;
    game.fighters.push(raider);
    runTicks(game, 12);

    expect(raider.state).toBe('ko');
  });

  it('hurt the hero who stays under a shadow after the blow', () => {
    const { game, tower } = besideTheTower();
    const before = game.player.hp;

    tap(game, 'light');
    runTicks(game, TOWER.crack + STONES.lead + STONES.every * STONES.count + 20);

    expect(tower.state).toBe('gone');
    expect(tower.stones).toEqual([]);
    expect(game.player.hp).toBeLessThan(before);
    expect(game.player.hp).toBeGreaterThan(0);
  });
});
