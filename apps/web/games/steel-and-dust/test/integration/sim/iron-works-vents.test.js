import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { VENT } from '../../../src/data/vents.js';
import { applyHit } from '../../../src/sim/combat/apply-hit.js';
import { createFighter } from '../../../src/sim/fighters/create-fighter.js';
import { VENT_BEAT } from '../../../src/sim/hazards/vent-beat.js';
import { selectMission, startPlay } from '../../../src/sim/stage/flow.js';
import { missionOf } from '../../../src/sim/stage/mission.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createTestGame, runTicks } from '../../support/test-game.js';

const IRON_WORKS = 7;
const GLOW_AT = VENT.rest;
const ERUPT_AT = VENT.rest + VENT.glow;
const originalRandom = Math.random;
// a hit that knocks a raider down a little way along the floor
const KNOCK = { damage: 4, knockback: [1.4, -2], knockdown: true, hitstop: 6, hitstun: 20 };

// the fight around the first vent, on its last wave so no more raiders walk in
function atTheVent() {
  const game = createTestGame();
  selectMission(game, IRON_WORKS);
  startPlay(game);
  const [vent] = game.vents;
  const zones = missionOf(game).zones;
  const zoneIndex = zones.findIndex((zone) => vent.x > zone.left && vent.x < zone.right);
  const zone = zones[zoneIndex];
  game.arena = { left: zone.left, right: zone.right };
  Object.assign(game.stage, { zoneIndex, waveIndex: zone.waves.length - 1 });
  game.fighters = [game.player];
  Object.assign(game.player, { x: vent.x - 40, y: vent.y, facing: 1 });
  game.camera.x = vent.x - 192;

  return { game, vent };
}

const burnOn = (game, fighter) =>
  game.summons.find((summon) => summon.kind === 'burn' && summon.target === fighter);

describe('the slag vents of the iron works', () => {
  beforeEach(() => {
    Math.random = seededRandom(17);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('throw a raider knocked onto a glowing vent high, and leave it burning', () => {
    const { game, vent } = atTheVent();
    const raider = createFighter('enemy', 'grunt', vent.x - 14, vent.y);
    raider.facing = -1;
    game.fighters.push(raider);
    vent.time = GLOW_AT + 20;

    applyHit(game, { attacker: game.player, target: raider, move: KNOCK, x: raider.x, y: vent.y });
    runTicks(game, ERUPT_AT - vent.time + 20);

    expect(raider.state).toBe('juggle');
    expect(raider.y).toBeLessThan(vent.y - 30);
    expect(burnOn(game, raider)).toBeDefined();
    expect(game.player.hp).toBe(game.player.maxHp);
  });

  it('leave the hero standing clear of the grate alone, and throw him out when he is over it', () => {
    const { game, vent } = atTheVent();
    vent.time = VENT_BEAT - 1;

    runTicks(game, ERUPT_AT + VENT.erupt + 1);
    expect(game.player.hp).toBe(game.player.maxHp);
    game.player.x = vent.x + 4;
    runTicks(game, ERUPT_AT + 50);

    expect(game.player.hp).toBeLessThan(game.player.maxHp);
    expect(Math.abs(game.player.x - vent.x)).toBeGreaterThan(VENT.halfWidth);
    expect(burnOn(game, game.player)).toBeUndefined();
  });
});
