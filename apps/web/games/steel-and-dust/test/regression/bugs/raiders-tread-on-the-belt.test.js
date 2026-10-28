import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mouthOf } from '../../../src/data/conveyors.js';
import { createFighter } from '../../../src/sim/fighters/create-fighter.js';
import { selectMission, startPlay } from '../../../src/sim/stage/flow.js';
import { missionOf } from '../../../src/sim/stage/mission.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createTestGame, runTicks } from '../../support/test-game.js';

// Bug: the Iron Works belt runs at a heavy's walking pace, so on its last wave the stoker walking
// up it at the hero trod in place, the shield all but did and the juggernaut was carried back to
// the furnace's mouth, where they stood for the rest of the wave. Now a raider walking up the belt
// keeps its own pace
const IRON_WORKS = 7;
const originalRandom = Math.random;
// as far as a raider stands off the hero when it has no turn to attack, and a little over
const STANDING_OFF = 46 + 34 + 10;

// the belt's screen on its last wave, the hero standing just past the far end from the furnace
function pastTheBelt() {
  const game = createTestGame();
  selectMission(game, IRON_WORKS);
  startPlay(game);
  const [belt] = game.conveyors;
  const zones = missionOf(game).zones;
  const zoneIndex = zones.findIndex((zone) => belt.from > zone.left && belt.to < zone.right);
  const zone = zones[zoneIndex];
  const farEnd = belt.direction > 0 ? belt.from : belt.to;

  game.arena = { left: zone.left, right: zone.right };
  Object.assign(game.stage, { zoneIndex, waveIndex: zone.waves.length - 1 });
  game.fighters = [game.player];
  Object.assign(game.player, { x: farEnd - belt.direction * 24, y: belt.y, invincible: 99999 });
  game.camera.x = zone.right - 384;

  return { game, belt };
}

describe('a raider walking up the iron works belt at the hero', () => {
  beforeEach(() => {
    Math.random = seededRandom(5);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it.each(['juggernaut', 'stoker', 'shield'])('reaches him, as a %s', (type) => {
    const { game, belt } = pastTheBelt();
    const raider = createFighter('enemy', type, mouthOf(belt) - belt.direction * 12, belt.y);
    game.fighters.push(raider);

    runTicks(game, 600);

    expect(Math.abs(game.player.x - raider.x)).toBeLessThan(STANDING_OFF);
  });
});
