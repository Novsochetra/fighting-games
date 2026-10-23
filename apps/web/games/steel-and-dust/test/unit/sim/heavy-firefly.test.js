import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ULT_MAX } from '../../../src/config.js';
import { FIREFLY_HEAVY_SOUNDS } from '../../../src/audio/live/heavy/firefly.js';
import { buildChain } from '../../../src/audio/context/build-chain.js';
import { isHeavyMove } from '../../../src/data/moves/heavy-moves.js';
import { WEAPONS } from '../../../src/data/weapons/index.js';
import { FIREFLY_HEAVY_KIT } from '../../../src/sim/fx/heavy/firefly.js';
import { FIREFLY_PARTICLE_MOVERS } from '../../../src/sim/fx/heavy/firefly-movers.js';
import { swarmKnotOf, swarmOrbit } from '../../../src/sim/fx/heavy/firefly-orbit.js';
import { spawnJoiner } from '../../../src/sim/fx/heavy/firefly-swarm.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks, tap } from '../../support/test-game.js';
import { createFakeAudioContext, nodesOfKind } from '../audio/fake-audio-context.js';

const originalRandom = Math.random;
const isFirefly = (particle) => particle.kind.startsWith('firefly');
const hero = { x: 100, y: 150, facing: 1, trail: [] };
const heavies = Object.values(WEAPONS).flatMap((weapon) =>
  Object.values(weapon.moves).filter(isHeavyMove),
);

function fireflyFight() {
  const game = createPlayingGame({ settings: { hero: 'firefly' }, io: { sfx: () => {} } });
  runTicks(game, 30);
  spawnEnemy(game, 'grunt', 1);
  const raider = game.fighters.find((fighter) => fighter.side === 'enemy');
  Object.assign(raider, { entering: false, x: game.player.x + 22, hp: 900, maxHp: 900 });
  raider.ai.cooldown = 9999;
  game.player.facing = 1;
  game.ultMeter = ULT_MAX;
  return game;
}

describe("the Firefly Shade's heavy", () => {
  beforeEach(() => {
    Math.random = seededRandom(9);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('gathers its swarm in tight round the waist, below the face', () => {
    const move = { startup: 8, hitbox: [4, -25, 20, 10] };
    const spread = (time) => {
      const xs = swarmOrbit(hero, move, time).map((bug) => bug.x);
      return Math.max(...xs) - Math.min(...xs);
    };
    expect(spread(7)).toBeLessThan(spread(0) / 3);
    for (let time = 0; time <= 8; time++) {
      swarmOrbit(hero, move, time).forEach((bug) => expect(bug.y).toBeGreaterThan(hero.y - 28));
    }
  });

  // the strike pose throws the head forward to where the chest stood
  it('knots its swarm out ahead of the face, whichever way it faces', () => {
    const move = { startup: 8, hitbox: [4, -25, 20, 10] };
    expect(swarmKnotOf(hero, move).x - hero.x).toBeGreaterThanOrEqual(10);
    expect(swarmKnotOf({ ...hero, facing: -1 }, move).x - hero.x).toBeLessThanOrEqual(-10);
  });

  it('flies a joining firefly in on a curve to where the swarm gathers', () => {
    const game = { particles: [], fxSeed: 5 };
    const to = { x: 50, y: 80 };
    spawnJoiner(game, to, { radius: 30, life: 8, bend: -1.6 });
    const [bug] = game.particles;
    for (let i = 0; i < 8; i++) {
      FIREFLY_PARTICLE_MOVERS.fireflyBug(bug);
    }
    expect(Math.hypot(bug.x - to.x, bug.y - to.y)).toBeLessThan(1);
  });

  it('dresses every heavy of every weapon without Math.random', () => {
    const game = fireflyFight();
    Math.random = () => {
      throw new Error('the Firefly kit used Math.random');
    };
    for (const move of heavies) {
      FIREFLY_HEAVY_KIT.windup(game, game.player, move);
      for (let time = 0; time < move.startup + move.active; time++) {
        FIREFLY_HEAVY_KIT.gather(game, game.player, move, time);
        FIREFLY_HEAVY_KIT.trail(game, game.player, move, time);
      }
      FIREFLY_HEAVY_KIT.release(game, game.player, move);
      FIREFLY_HEAVY_KIT.impact(game, { attacker: game.player, move, x: 140, y: 120 });
    }
    expect(game.particles.filter(isFirefly).length).toBeGreaterThan(heavies.length * 10);
  });

  it('keeps a mashed heavy chain within its share of the particles', () => {
    const game = fireflyFight();
    let most = 0;
    for (let i = 0; i < 160; i++) {
      if (i % 6 === 0) {
        tap(game, 'heavy');
      }
      runTicks(game, 1);
      most = Math.max(most, game.particles.filter(isFirefly).length);
    }
    expect(most).toBeGreaterThan(10);
    expect(most).toBeLessThanOrEqual(60);
  });

  it('charges with a short buzz and twinkle that are over in a quarter second', () => {
    const context = createFakeAudioContext({ state: 'running' });
    const live = { context, chain: buildChain(context) };
    FIREFLY_HEAVY_SOUNDS.heavyFireflyCharge(live, 2);
    const sources = [
      ...nodesOfKind(context, 'oscillator'),
      ...nodesOfKind(context, 'bufferSource'),
    ];
    expect(sources.length).toBeGreaterThan(4);
    for (const source of sources) {
      expect(source.stops.at(-1)[0]).toBeLessThanOrEqual(2 + 0.3);
    }
  });
});
