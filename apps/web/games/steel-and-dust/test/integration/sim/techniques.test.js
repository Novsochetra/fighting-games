import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { freezeTarget } from '../../../src/sim/combat/freeze.js';
import { equipWeapon } from '../../../src/sim/stage/flow.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks, tap } from '../../support/test-game.js';

const originalRandom = Math.random;
const INPUTS = {
  S1: ['heavy', 'light'],
  S2: ['heavy', 'heavy', 'light'],
  S3: ['heavy', 'heavy', 'heavy', 'light'],
};

function fightRaiders(hero, { weapon = 'sword', offsets = [16] } = {}) {
  const sounds = [];
  const game = createPlayingGame({ settings: { hero }, io: { sfx: (key) => sounds.push(key) } });
  runTicks(game, 30);
  equipWeapon(game, weapon);
  const raiders = offsets.map((offset) => addRaider(game, offset));
  game.player.facing = 1;
  return { game, raiders, sounds };
}

// presses once the current move can chain and its hitstop is over, as a player watching the hit would
function pressWhenReady(game, action) {
  for (let i = 0; i < 90; i++) {
    const { move, moveTime, state, hitstop } = game.player;
    if (state === 'attack' && moveTime >= move.cancelWindow[0] && hitstop === 0) {
      tap(game, action);
      return;
    }
    runTicks(game, 1);
  }
}

function perform(game, [first, ...rest]) {
  tap(game, first);
  rest.forEach((action) => pressWhenReady(game, action));
  runTicks(game, 1);
}

function untilStrike(game) {
  while (game.player.moveTime <= game.player.move.startup) {
    runTicks(game, 1);
  }
}

const summonsOf = (game, kind) => game.summons.filter((summon) => summon.kind === kind);

// the summons a technique raises on its strike, apart from any its heavy left behind
function summonedOnStrike(game, kind) {
  const earlier = new Set(game.summons);
  untilStrike(game);
  return summonsOf(game, kind).filter((summon) => !earlier.has(summon));
}

function addRaider(game, offset) {
  spawnEnemy(game, 'grunt', 1);
  const raider = game.fighters.at(-1);
  Object.assign(raider, { entering: false, x: game.player.x + offset, hp: 300, maxHp: 300 });
  raider.ai.cooldown = 999;
  return raider;
}

describe('Shade techniques', () => {
  beforeEach(() => {
    Math.random = seededRandom(11);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it.each(['moss', 'firefly', 'antler', 'blue'])(
    'the %s Shade branches a technique off each heavy, on every weapon',
    (hero) => {
      for (const weapon of ['fists', 'sword', 'spear', 'axe']) {
        for (const [id, inputs] of Object.entries(INPUTS)) {
          const { game } = fightRaiders(hero, { weapon });
          perform(game, inputs);
          expect(game.player.move?.id, `${weapon} ${inputs.join(' ')}`).toBe(id);
        }
      }
    },
  );

  it('comes out of an air heavy too', () => {
    const { game } = fightRaiders('firefly');
    tap(game, 'jump');
    runTicks(game, 12);
    perform(game, ['heavy', 'light']);
    expect(game.player.move).toMatchObject({ id: 'AS', name: 'Firefly Rain' });
  });

  it("calls out its name in the Shade's colors with its own sound", () => {
    const { game, sounds } = fightRaiders('antler');
    perform(game, INPUTS.S2);
    untilStrike(game);
    expect(game.floaters.map((floater) => floater.text)).toContain('Herd Charge');
    expect(sounds).toContain('technique');
    expect(game.effects.some((effect) => effect.kind === 'ring')).toBe(true);
  });

  it("Moss's Bramble Wall raises four thorns ahead and Grove Wrath rings the Shade with them", () => {
    const wall = fightRaiders('moss').game;
    perform(wall, INPUTS.S2);
    const brambles = summonedOnStrike(wall, 'thorn');
    expect(brambles).toHaveLength(4);
    expect(brambles.every((thorn) => thorn.x > wall.player.x)).toBe(true);
    const ring = fightRaiders('moss').game;
    perform(ring, INPUTS.S3);
    const sides = summonedOnStrike(ring, 'thorn').map((thorn) =>
      Math.sign(thorn.x - ring.player.x),
    );
    expect(sides.sort()).toEqual([-1, -1, 1, 1]);
  });

  it("Moss's Root Snare lashes out to snare a raider the heavy threw away", () => {
    const { game, raiders } = fightRaiders('moss', { weapon: 'spear' });
    perform(game, INPUTS.S1);
    const before = raiders[0].hp;
    runTicks(game, 30);
    expect(before - raiders[0].hp).toBeGreaterThanOrEqual(9);
  });

  it("Firefly's Swarm Crescendo darts in, launches the raider and looses six fireflies", () => {
    const { game, raiders } = fightRaiders('firefly');
    perform(game, INPUTS.S3);
    expect(summonedOnStrike(game, 'firefly')).toHaveLength(6);
    runTicks(game, 6);
    expect(raiders[0].state).toBe('juggle');
  });

  it("Antler's Earthshaker quakes raiders far out of its reach", () => {
    const { game } = fightRaiders('antler');
    perform(game, INPUTS.S3);
    const far = addRaider(game, -150);
    runTicks(game, 24);
    expect(far.hp).toBeLessThan(far.maxHp);
  });

  it("Antler's Antler Toss rushes the raider and throws it back over the Shade's shoulder", () => {
    const { game, raiders } = fightRaiders('antler');
    perform(game, INPUTS.S1);
    runTicks(game, 50);
    expect(raiders[0].x).toBeLessThan(game.player.x);
  });

  it("Blue's Shatterpoint breaks the ice at once, for the shatter hit on top", () => {
    const { game, raiders } = fightRaiders('blue', { offsets: [24] });
    const [raider] = raiders;
    perform(game, INPUTS.S3);
    Object.assign(raider, { x: game.player.x + 30, state: 'idle', airborne: false });
    freezeTarget(game, raider, { duration: 200 });
    const before = raider.hp;
    untilStrike(game);
    runTicks(game, 2);
    expect(raider.frozen).toBe(false);
    expect(summonsOf(game, 'ice')).toEqual([]);
    expect(before - raider.hp).toBeGreaterThan(game.player.move.damage);
  });
});
