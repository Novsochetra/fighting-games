import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TREE } from '../../../src/data/trees.js';
import { createFighter } from '../../../src/sim/fighters/create-fighter.js';
import { selectMission, startPlay } from '../../../src/sim/stage/flow.js';
import { missionOf } from '../../../src/sim/stage/mission.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createTestGame, runTicks, tap } from '../../support/test-game.js';

const PINE_RIDGE = 0;
const originalRandom = Math.random;

// the fight in the tree's zone is on its last wave, so no more raiders walk in
function inTheTreesZone(game, tree) {
  const zones = missionOf(game).zones;
  const zoneIndex = zones.findIndex((zone) => tree.x > zone.left && tree.x < zone.right);
  const zone = zones[zoneIndex];

  game.arena = { left: zone.left, right: zone.right };
  Object.assign(game.stage, { zoneIndex, waveIndex: zone.waves.length - 1 });
}

// the hero beside the tree's trunk with a raider beyond it, all of it on screen
function besideTheTree() {
  const game = createTestGame();
  selectMission(game, PINE_RIDGE);
  startPlay(game);
  const [tree] = game.trees;
  inTheTreesZone(game, tree);
  game.fighters = [game.player];
  Object.assign(game.player, { x: tree.x - 18, y: tree.y, facing: 1 });
  game.camera.x = tree.x - 150;
  const raider = createFighter('enemy', 'grunt', tree.x + 70, tree.y);
  raider.facing = -1;
  game.fighters.push(raider);

  return { game, tree, raider };
}

describe('the dead tree on Pine Ridge', () => {
  beforeEach(() => {
    Math.random = seededRandom(5);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('is felled by a blow of the hero, and comes down on the raider beyond it', () => {
    const { game, tree, raider } = besideTheTree();

    tap(game, 'light');
    runTicks(game, 12);
    expect(tree.state).toBe('creaking');
    expect(tree.direction).toBe(1);

    runTicks(game, TREE.creak + TREE.fall);
    expect(tree.state).toBe('fallen');
    expect(raider.state).toBe('ko');
  });
});
