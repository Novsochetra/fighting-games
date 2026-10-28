import { describe, expect, it } from 'vitest';
import { SWARM } from '../../../src/data/nests.js';
import { flyHornet, hatchHornets } from '../../../src/sim/hazards/hornet-flight.js';
import { closestFighter, releaseSwarm, updateSwarm } from '../../../src/sim/hazards/hornets.js';
import { createNests } from '../../../src/sim/hazards/nests.js';
import { createLootGame, soundKeys, spawnEnemy } from '../../support/loot-game.js';

const AWAY = 200;
const OFF_ITS_FEET = new Set(['juggle', 'down', 'getup']);

// a nest just broken open on the road, its swarm out, the hero far off out of its range
function brokenNest() {
  const { game, sounds } = createLootGame();
  const x = game.player.x + AWAY;
  const [nest] = createNests([{ x, y: game.player.y }]);
  Object.assign(nest, { state: 'broken' });
  game.nests = [nest];
  game.player.invincible = 0;
  releaseSwarm(game, nest);

  return { game, sounds, nest };
}

// runs the swarm, noting every state each fighter passes through
function buzzFor(game, ticks) {
  const states = new Map(game.fighters.map((fighter) => [fighter, new Set()]));

  for (let i = 0; i < ticks; i++) {
    updateSwarm(game, game.nests[0]);
    for (const fighter of game.fighters) {
      states.get(fighter)?.add(fighter.state);
    }
  }

  return states;
}

describe('a hornet swarm', () => {
  it('stings the raider closest to it in small hits that score as the hero’s, never a knockdown', () => {
    const { game, nest } = brokenNest();
    const raider = spawnEnemy(game, 'grunt', nest.x + 12);
    const states = buzzFor(game, 120);

    expect(nest.swarm.target).toBe(raider);
    expect(raider.hp).toBeLessThan(raider.def.hp);
    expect(raider.hp).toBeGreaterThan(0);
    expect([...states.get(raider)].filter((state) => OFF_ITS_FEET.has(state))).toEqual([]);
    expect(game.score).toBeGreaterThan(0);
    expect(game.player.hp).toBe(game.player.maxHp);
  });

  it('stings the hero when he is the closest, a little at a time', () => {
    const { game, nest } = brokenNest();
    game.player.x = nest.x + 6;
    spawnEnemy(game, 'grunt', nest.x + 60);
    const states = buzzFor(game, SWARM.life);

    expect(game.player.hp).toBeLessThan(game.player.maxHp);
    expect(game.player.hp).toBeGreaterThan(game.player.maxHp - 25);
    expect([...states.get(game.player)].filter((state) => OFF_ITS_FEET.has(state))).toEqual([]);
  });

  it('leaves the hero to the raiders once he backs out of its range', () => {
    const { game, nest } = brokenNest();
    game.player.x = nest.x + 6;
    const raider = spawnEnemy(game, 'grunt', nest.x - 40);
    buzzFor(game, 10);
    expect(nest.swarm.target).toBe(game.player);

    game.player.x = nest.x + SWARM.range + 20;
    const hp = game.player.hp;
    buzzFor(game, 90);

    expect(nest.swarm.target).toBe(raider);
    expect(game.player.hp).toBe(hp);
  });

  it('ignores raiders still walking in and the knocked out', () => {
    const { game, nest } = brokenNest();
    game.player.x = nest.x + 50;
    Object.assign(spawnEnemy(game, 'grunt', nest.x), { entering: true });
    Object.assign(spawnEnemy(game, 'grunt', nest.x + 4), { state: 'ko' });
    buzzFor(game, 2);

    expect(nest.swarm.target).toBe(game.player);
  });

  it('can finish a raider worn down already', () => {
    const { game, nest } = brokenNest();
    const raider = spawnEnemy(game, 'grunt', nest.x + 12);
    raider.hp = 5;
    buzzFor(game, 120);

    expect(raider.state).toBe('ko');
  });

  it('hovers over its nest with nobody in range, buzzing, then scatters and is gone', () => {
    const { game, sounds, nest } = brokenNest();
    buzzFor(game, SWARM.life + SWARM.scatter);

    expect(nest.swarm.hornets).toEqual([]);
    expect(nest.swarm.target).toBeNull();
    expect(soundKeys(sounds).filter((key) => key === 'buzz').length).toBeGreaterThan(5);
  });

  it('picks whoever is closest to it', () => {
    const near = { x: 110, y: 100, scale: 1 };
    const far = { x: 160, y: 100, scale: 1 };

    expect(closestFighter([far, near], { x: 100, y: 80 })).toBe(near);
    expect(closestFighter([], { x: 100, y: 80 })).toBeNull();
  });

  it('flies no faster than its speed, however far its mark', () => {
    const [hornet] = hatchHornets({ x: 0, y: 100 });

    for (let i = 0; i < 30; i++) {
      flyHornet(hornet, { x: 1000, y: -500 });
      expect(Math.hypot(hornet.vx, hornet.vy)).toBeLessThanOrEqual(SWARM.speed + 1e-9);
    }

    expect(hornet.facing).toBe(1);
  });
});
