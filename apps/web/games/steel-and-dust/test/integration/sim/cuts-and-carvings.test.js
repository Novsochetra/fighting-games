import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { THOUSAND_CUTS } from '../../../src/data/ultimates/thousand-cuts.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { leaveCarving, swingCarving } from '../../../src/sim/summons/carvings.js';
import { hangCut, SEVER_TICKS, severCut } from '../../../src/sim/summons/hanging-cuts.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

const originalRandom = Math.random;
const { sever: SEVER, crumbleAfter } = THOUSAND_CUTS;
const ofKind = (game, kind) => game.summons.filter((summon) => summon.kind === kind);

function gameWithRaider() {
  const game = createPlayingGame({ settings: { hero: 'angkor' } });
  spawnEnemy(game, 'grunt', 1);
  const raider = game.fighters.find((fighter) => fighter.side === 'enemy');
  Object.assign(raider, { entering: false, x: game.player.x + 80, state: 'idle', hp: 200 });
  raider.maxHp = 200;
  raider.ai.cooldown = 999;
  return { game, raider };
}

describe("the Angkor Warrior's hanging cuts", () => {
  beforeEach(() => {
    Math.random = seededRandom(9);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('hangs on its raider, riding it where it goes, and strikes nothing until it lands', () => {
    const { game, raider } = gameWithRaider();
    hangCut(game, { target: raider, angle: 0.7, bow: 1, color: '#ffe08a', offset: [2, -6] });
    raider.x += 30;
    runTicks(game, 60);
    const [cut] = ofKind(game, 'hangingCut');
    expect(cut.x).toBe(raider.x + 2);
    expect(raider.hp).toBe(raider.maxHp);
  });

  it('lands as a blow of the dav from the side the hero stands, bursts, flares and is gone', () => {
    const { game, raider } = gameWithRaider();
    hangCut(game, { target: raider, angle: 0.7, bow: 1, color: '#ffe08a', offset: [0, 0] });
    runTicks(game, 2);
    const [cut] = ofKind(game, 'hangingCut');
    severCut(game, cut, { from: game.player, move: SEVER });
    expect(raider.maxHp - raider.hp).toBe(SEVER.damage);
    expect(raider.vx).toBeGreaterThan(0);
    expect(game.summons.some((summon) => summon.sprite === 'sever')).toBe(true);
    runTicks(game, SEVER_TICKS);
    expect(ofKind(game, 'hangingCut')).toEqual([]);
  });
});

describe("the Angkor Warrior's carvings", () => {
  it('stands in the stone until called on, swings and crumbles a beat later', () => {
    const { game } = gameWithRaider();
    const at = { x: game.player.x, y: game.player.y, facing: 1, sprite: ['slash1', 2, 0] };
    leaveCarving(game, at);
    runTicks(game, 120);
    const [carving] = ofKind(game, 'carving');
    expect(carving).toBeDefined();
    swingCarving(carving);
    runTicks(game, crumbleAfter - 1);
    expect(ofKind(game, 'carving')).toHaveLength(1);
    runTicks(game, 1);
    expect(ofKind(game, 'carving')).toEqual([]);
    expect(game.summons.some((summon) => summon.sprite === 'rubble')).toBe(true);
    expect(game.particles.some((particle) => particle.kind === 'chunk')).toBe(true);
  });
});
