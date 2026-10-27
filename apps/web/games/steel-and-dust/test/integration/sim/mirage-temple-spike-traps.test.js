import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SPIKE_TRAP } from '../../../src/data/spike-traps.js';
import { applyHit } from '../../../src/sim/combat/apply-hit.js';
import { createFighter } from '../../../src/sim/fighters/create-fighter.js';
import { selectMission, startPlay } from '../../../src/sim/stage/flow.js';
import { missionOf } from '../../../src/sim/stage/mission.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createTestGame, press, release, runTicks } from '../../support/test-game.js';

const MIRAGE_TEMPLE = 8;
const RISE_AT = SPIKE_TRAP.rest + SPIKE_TRAP.warn;
const SINK_AT = RISE_AT + SPIKE_TRAP.rise + SPIKE_TRAP.up;
const originalRandom = Math.random;
// a hit that knocks a raider down a little way along the road
const KNOCK = { damage: 4, knockback: [1.4, -2], knockdown: true, hitstop: 6, hitstun: 20 };

// the fight around the first row of tiles, on its last wave so no more raiders walk in
function atTheTiles() {
  const game = createTestGame();
  selectMission(game, MIRAGE_TEMPLE);
  startPlay(game);
  const row = game.spikeTraps.slice(0, SPIKE_TRAP.tiles);
  const zones = missionOf(game).zones;
  const zoneIndex = zones.findIndex((zone) => row[0].x > zone.left && row[0].x < zone.right);
  const zone = zones[zoneIndex];
  game.arena = { left: zone.left, right: zone.right };
  Object.assign(game.stage, { zoneIndex, waveIndex: zone.waves.length - 1 });
  game.fighters = [game.player];
  Object.assign(game.player, { x: row[0].x - 60, y: row[0].y, facing: 1 });
  game.camera.x = row[1].x - 192;

  return { game, row };
}

describe('the spike traps of the Mirage Temple', () => {
  beforeEach(() => {
    Math.random = seededRandom(17);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('throw up and finish a raider knocked onto a tile just before its spikes come up', () => {
    const { game, row } = atTheTiles();
    const [tile] = row;
    const raider = createFighter('enemy', 'ghoul', tile.x - 26, tile.y);
    raider.facing = -1;
    game.fighters.push(raider);
    game.player.x = raider.x - 20;
    tile.time = RISE_AT - 16;

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

  it('let the hero walk across between beats unhurt, once the ripple has passed', () => {
    const { game, row } = atTheTiles();
    for (const [i, tile] of row.entries()) {
      tile.time = SINK_AT + SPIKE_TRAP.sink - i * SPIKE_TRAP.stagger;
    }
    game.player.x = row[0].x - 30;

    press(game, 'right');
    runTicks(game, 70);
    release(game, 'right');

    expect(game.player.x).toBeGreaterThan(row[2].x + 30);
    expect(game.player.hp).toBe(game.player.maxHp);
  });

  it('stab the hero who stands on a tile as it comes up', () => {
    const { game, row } = atTheTiles();
    game.player.x = row[1].x;
    row[1].time = RISE_AT - 2;

    runTicks(game, 4);

    expect(game.player.hp).toBeLessThan(game.player.maxHp);
    expect(game.player.state).not.toBe('ko');
  });
});
