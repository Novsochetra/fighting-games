import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFighter } from '../../../src/sim/fighters/create-fighter.js';
import { selectMission, startPlay } from '../../../src/sim/stage/flow.js';
import { missionOf } from '../../../src/sim/stage/mission.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createTestGame, press, release, runTicks, tap } from '../../support/test-game.js';

const PINE_RIDGE = 0;
const originalRandom = Math.random;

// the fight in the nest's zone is on its last wave, so no more raiders walk in
function inTheNestsZone(game, nest) {
  const zones = missionOf(game).zones;
  const zoneIndex = zones.findIndex((zone) => nest.x > zone.left && nest.x < zone.right);
  const zone = zones[zoneIndex];

  game.arena = { left: zone.left, right: zone.right };
  Object.assign(game.stage, { zoneIndex, waveIndex: zone.waves.length - 1 });
}

// the hero just short of the spot under the nest with a raider on it, the bar full for a launcher
function underTheNest() {
  const game = createTestGame();
  selectMission(game, PINE_RIDGE);
  startPlay(game);
  const [nest] = game.nests;
  inTheNestsZone(game, nest);
  game.fighters = [game.player];
  Object.assign(game.player, { x: nest.x - 16, y: nest.y, facing: 1, invincible: 0 });
  game.camera.x = nest.x - 192;
  game.ultMeter = 200;
  const raider = createFighter('enemy', 'grunt', nest.x + 2, nest.y);
  raider.facing = -1;
  game.fighters.push(raider);

  return { game, nest, raider };
}

// up and heavy together: the launcher
function launch(game) {
  Object.assign(game.input.pressed, { up: true, heavy: true });
  game.input.held.up = true;
  runTicks(game, 1);
  game.input.held.up = false;
}

function until(game, done, limit) {
  for (let i = 0; i < limit && !done(); i++) {
    runTicks(game, 1);
  }
}

describe('the hornet nest on Pine Ridge', () => {
  beforeEach(() => {
    Math.random = seededRandom(5);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('is knocked down by a launched raider, and its swarm stings him once the hero backs off', () => {
    const { game, nest, raider } = underTheNest();

    launch(game);
    until(game, () => nest.state !== 'hanging', 30);
    expect(raider.state).toBe('juggle');
    expect(nest.state).toBe('struck');

    press(game, 'left');
    until(game, () => nest.state === 'broken', 60);
    release(game, 'left');
    expect(nest.state).toBe('broken');
    runTicks(game, 1);
    expect(nest.swarm.target).toBe(raider);

    const launched = raider.hp;
    const heroHp = game.player.hp;
    runTicks(game, 150);
    expect(nest.swarm.target).toBe(raider);
    expect(raider.hp).toBeLessThan(launched);
    expect(game.player.hp).toBe(heroHp);
  });

  it('is knocked down by a blow the hero jumps up to swing at it, and not by one on the road', () => {
    const { game, nest } = underTheNest();
    game.fighters = [game.player];
    game.player.x = nest.x - 12;

    tap(game, 'light');
    runTicks(game, 20);
    expect(nest.state).toBe('hanging');

    tap(game, 'jump');
    runTicks(game, 14);
    tap(game, 'light');
    until(game, () => nest.state !== 'hanging', 20);
    expect(nest.state).toBe('struck');
  });

  it('stings the hero instead when he stays under it', () => {
    const { game, nest } = underTheNest();

    launch(game);
    until(game, () => nest.state === 'broken', 80);
    runTicks(game, 120);

    expect(nest.swarm.target).toBe(game.player);
    expect(game.player.hp).toBeLessThan(game.player.maxHp);
    expect(game.player.hp).toBeGreaterThan(game.player.maxHp - 20);
  });
});
