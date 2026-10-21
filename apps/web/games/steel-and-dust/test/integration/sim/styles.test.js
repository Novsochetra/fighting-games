import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { equipWeapon } from '../../../src/sim/stage/flow.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks, tap } from '../../support/test-game.js';

const originalRandom = Math.random;

function fightOneRaider(hero, weapon = 'fists') {
  const game = createPlayingGame({ settings: { hero } });
  runTicks(game, 30);
  if (weapon !== 'fists') {
    equipWeapon(game, weapon);
  }
  spawnEnemy(game, 'grunt', 1);
  const raider = game.fighters.find((fighter) => fighter.side === 'enemy');
  Object.assign(raider, { entering: false, x: game.player.x + 16, hp: 300 });
  raider.maxHp = 300;
  raider.ai.cooldown = 999;
  game.player.facing = 1;
  return { game, raider };
}

// taps light as soon as each hit can chain into the next, up to `hits` presses
function lightString(game, hits) {
  let pressed = 0;
  for (let i = 0; i < 160 && pressed < hits; i++) {
    const { move, moveTime, state } = game.player;
    const ready = state !== 'attack' || moveTime >= move.cancelWindow[0];
    if (ready && i % 2 === 0) {
      tap(game, 'light');
      pressed++;
    } else {
      runTicks(game, 1);
    }
  }
}

function ticksUntilIdle(game) {
  let ticks = 0;
  while (game.player.state === 'attack' && ticks < 200) {
    runTicks(game, 1);
    ticks++;
  }
  return ticks;
}

function summonsOf(game, kind) {
  return game.summons.filter((summon) => summon.kind === kind);
}

describe('the Shades fight differently with the same weapon', () => {
  beforeEach(() => {
    Math.random = seededRandom(5);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('the Firefly jab recovers first and the Antler jab last', () => {
    const recovery = {};
    for (const hero of ['firefly', 'moss', 'antler']) {
      const { game } = fightOneRaider(hero);
      tap(game, 'light');
      recovery[hero] = ticksUntilIdle(game);
    }
    expect(recovery.firefly).toBeLessThan(recovery.moss);
    expect(recovery.moss).toBeLessThan(recovery.antler);
  });

  it("Moss's string finisher raises a bramble on the ground ahead", () => {
    const { game } = fightOneRaider('moss');
    lightString(game, 4);
    expect(game.player.move.id).toBe('L4');
    const { x, facing } = game.player;
    runTicks(game, 16);
    const [thorn] = summonsOf(game, 'thorn');
    expect(thorn.x).toBeCloseTo(x + facing * 30, -1);
  });

  it("Firefly's third hit is a flurry and its finisher looses fireflies", () => {
    const { game, raider } = fightOneRaider('firefly');
    lightString(game, 3);
    const comboBefore = game.combo.count;
    runTicks(game, 14);
    expect(game.combo.count - comboBefore).toBeGreaterThanOrEqual(2);
    lightString(game, 1);
    expect(game.player.move.id).toBe('L4');
    runTicks(game, 12);
    expect(summonsOf(game, 'firefly')).toHaveLength(2);
    expect(raider.hp).toBeLessThan(raider.maxHp);
  });

  it("Antler's third hit is an armored ram that sends a spirit stag", () => {
    const { game } = fightOneRaider('antler');
    lightString(game, 3);
    runTicks(game, 2);
    expect(game.player.move).toMatchObject({ id: 'L3', armor: true });
    runTicks(game, 14);
    expect(summonsOf(game, 'stag')).toHaveLength(1);
  });

  it("Blue's heavy freezes the raider, which shatters after it", () => {
    const { game, raider } = fightOneRaider('blue', 'sword');
    tap(game, 'heavy');
    runTicks(game, 20);
    expect(raider.frozen).toBe(true);
    runTicks(game, 40);
    expect(raider.frozen).toBe(false);
    expect(raider.state).toBe('juggle');
  });

  it("Ember's heavy sets the raider burning, and the fire keeps eating at it", () => {
    const { game, raider } = fightOneRaider('ember', 'sword');
    tap(game, 'heavy');
    runTicks(game, 20);
    expect(summonsOf(game, 'burn').map((burn) => burn.target)).toEqual([raider]);
    const afterCut = raider.hp;
    runTicks(game, 50);
    expect(raider.hp).toBeLessThan(afterCut);
  });

  it("Ember's fourth light hit raises two flame pillars ahead", () => {
    const { game } = fightOneRaider('ember', 'sword');
    lightString(game, 4);
    runTicks(game, 12);
    expect(game.player.move?.id).toBe('L4');
    expect(summonsOf(game, 'pillar')).toHaveLength(2);
  });

  it('the same press from the Moss Shade leaves the raider unfrozen', () => {
    const { game, raider } = fightOneRaider('moss', 'sword');
    tap(game, 'heavy');
    runTicks(game, 20);
    expect(raider.frozen).toBeFalsy();
    expect(game.summons).toEqual([]);
  });
});
