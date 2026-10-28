import { describe, expect, it } from 'vitest';
import { QUICKSAND } from '../../../src/data/quicksand.js';
import { quicksandFrame } from '../../../src/render/scene/quicksand.js';
import { applyHit } from '../../../src/sim/combat/apply-hit.js';
import { shelf } from '../../../src/sim/hazards/quicksand-patch.js';
import { createQuicksand, updateQuicksand } from '../../../src/sim/hazards/quicksand.js';
import { createLootGame, soundKeys, spawnEnemy } from '../../support/loot-game.js';

const SPOT = 300;
const SWALLOW_TICKS = Math.ceil(QUICKSAND.raiderHeight / QUICKSAND.raiderSink);
const LAUNCHER = { damage: 3, knockback: [2, -6], launch: true, knockdown: true, hitstop: 6 };

function sandGame() {
  const { game, sounds } = createLootGame();
  game.player.x = SPOT - 120;
  game.quicksand = createQuicksand([{ x: SPOT, y: game.player.y }]);

  return { game, sounds, patch: game.quicksand[0] };
}

function knockedDownIn(game, x, kind = 'grunt') {
  return Object.assign(spawnEnemy(game, kind, x), { state: 'down', stateTime: 0 });
}

function sink(game, ticks) {
  for (let i = 0; i < ticks; i++) {
    updateQuicksand(game);
  }
}

describe('a patch of quicksand', () => {
  it('is deepest in the middle and shallow at the rim', () => {
    const patch = { x: SPOT, y: 184 };

    expect(shelf(patch, SPOT)).toBeGreaterThan(QUICKSAND.heroDepth);
    expect(shelf(patch, SPOT + QUICKSAND.halfWidth)).toBe(0);
    expect(shelf(patch, SPOT - 40)).toBe(0);
  });

  it('swirls on its own beat, so two patches never turn in step', () => {
    expect(quicksandFrame({ x: 300 }, 0)).not.toBe(quicksandFrame({ x: 306 }, 0));
  });
});

describe('a raider in the quicksand', () => {
  it('knocked down in it, is held there staggered and sinks', () => {
    const { game, sounds } = sandGame();
    const raider = knockedDownIn(game, SPOT + 6);

    sink(game, 30);

    expect(raider).toMatchObject({ state: 'hurt', x: SPOT + 6, airborne: false });
    expect(raider.sunk).toBeCloseTo(30 * QUICKSAND.raiderSink);
    expect(soundKeys(sounds)).toContain('dig');
  });

  it('takes every blow there without being thrown out of the sand', () => {
    const { game } = sandGame();
    const raider = knockedDownIn(game, SPOT);
    sink(game, 10);

    applyHit(game, { attacker: game.player, target: raider, move: LAUNCHER, x: SPOT, y: 170 });
    updateQuicksand(game);

    expect(raider.hp).toBe(raider.def.hp - LAUNCHER.damage);
    expect(raider).toMatchObject({ state: 'hurt', airborne: false, vx: 0, vy: 0, x: SPOT });
  });

  it('is swallowed for a bonus, out at once however much health it has', () => {
    const { game } = sandGame();
    const raider = knockedDownIn(game, SPOT + 4, 'juggernaut');
    const score = game.score;

    sink(game, SWALLOW_TICKS + 1);

    expect(raider).toMatchObject({ state: 'ko', removed: true });
    expect(raider.hp).toBe(raider.def.hp);
    expect(game.score).toBeGreaterThan(score + QUICKSAND.swallowBonus);
    expect(game.floaters.map((floater) => floater.text)).toContain('Swallowed!');
  });

  it('leaves its purse on the nearer rim, rolling away from the sand', () => {
    const { game } = sandGame();
    knockedDownIn(game, SPOT + 10);

    sink(game, SWALLOW_TICKS + 1);

    expect(game.loot.length).toBeGreaterThan(0);
    for (const coin of game.loot) {
      expect(coin.x).toBe(SPOT + QUICKSAND.halfWidth + QUICKSAND.rimOut);
      expect(coin.vx).toBeGreaterThanOrEqual(0);
    }
  });

  it('on its feet, wades through slowly and is not held', () => {
    const { game } = sandGame();
    const raider = Object.assign(spawnEnemy(game, 'grunt', SPOT), { state: 'walk', vx: 2 });

    updateQuicksand(game);

    expect(raider.x).toBe(SPOT - 2 * (1 - QUICKSAND.wade));
    expect(raider.state).toBe('walk');
    expect(raider.sunk).toBeFalsy();
  });

  it('standing its ground in it, sinks in and is held once it has stood there a moment', () => {
    const { game } = sandGame();
    const raider = Object.assign(spawnEnemy(game, 'grunt', SPOT + 6), { state: 'idle' });

    sink(game, QUICKSAND.mire - 1);
    expect(raider.state).toBe('idle');
    expect(raider.sunk).toBeFalsy();
    sink(game, 1);

    expect(raider).toMatchObject({ state: 'hurt', x: SPOT + 6 });
    expect(raider.sunk).toBeGreaterThan(0);
  });

  it('swinging at the hero from it, is held just the same', () => {
    const { game } = sandGame();
    const raider = Object.assign(spawnEnemy(game, 'grunt', SPOT), { state: 'attack' });

    sink(game, QUICKSAND.mire);

    expect(raider.state).toBe('hurt');
    expect(raider.sunk).toBeGreaterThan(0);
  });

  it('that keeps walking, is never held, however long it takes to cross', () => {
    const { game } = sandGame();
    const raider = Object.assign(spawnEnemy(game, 'grunt', SPOT), { state: 'walk', vx: 0.02 });

    sink(game, QUICKSAND.mire * 3);

    expect(raider.state).toBe('walk');
    expect(raider.sunk).toBeFalsy();
  });

  it('fighting back and forth in it, sinks in a little more every time it stands', () => {
    const { game } = sandGame();
    const raider = Object.assign(spawnEnemy(game, 'grunt', SPOT), { state: 'attack' });

    sink(game, QUICKSAND.mire / 2);
    raider.state = 'walk';
    sink(game, QUICKSAND.mire);
    raider.state = 'attack';
    sink(game, QUICKSAND.mire / 2);

    expect(raider.state).toBe('hurt');
    expect(raider.sunk).toBeGreaterThan(0);
  });

  it('that steps out of the sand, has its feet free and starts over', () => {
    const { game } = sandGame();
    const raider = Object.assign(spawnEnemy(game, 'grunt', SPOT), { state: 'idle' });

    sink(game, QUICKSAND.mire - 10);
    raider.x = SPOT + QUICKSAND.halfWidth + 10;
    sink(game, 1);
    raider.x = SPOT;
    sink(game, QUICKSAND.mire - 10);

    expect(raider.state).toBe('idle');
    expect(raider.sunk).toBeFalsy();
  });

  it('kicks up dust at its feet as it bogs down, the warning that it is going under', () => {
    const { game } = sandGame();
    Object.assign(spawnEnemy(game, 'grunt', SPOT), { state: 'idle' });

    sink(game, Math.floor(QUICKSAND.mire / 2));
    const early = game.particles.length;
    sink(game, Math.floor(QUICKSAND.mire / 2) - 1);

    expect(early).toBe(0);
    expect(game.particles.length).toBeGreaterThan(0);
  });

  it('knocked out on the sand, goes down into it', () => {
    const { game } = sandGame();
    const body = Object.assign(spawnEnemy(game, 'grunt', SPOT), { state: 'ko' });
    const score = game.score;

    sink(game, SWALLOW_TICKS + 1);

    expect(body.removed).toBe(true);
    expect(game.score).toBe(score);
  });

  it('leaves alone a raider still walking in, and a boss', () => {
    const { game } = sandGame();
    const walker = Object.assign(knockedDownIn(game, SPOT), { entering: true });
    const boss = knockedDownIn(game, SPOT + 8, 'djinn');

    sink(game, 20);

    expect(walker.state).toBe('down');
    expect(boss.state).toBe('down');
    expect(boss.sunk).toBeFalsy();
  });
});

describe('the hero in the quicksand', () => {
  it('is slowed, and pulled down slowly', () => {
    const { game } = sandGame();
    Object.assign(game.player, { x: SPOT, state: 'run', vx: 2 });

    updateQuicksand(game);
    expect(game.player.x).toBe(SPOT - 2 * (1 - QUICKSAND.wade));
    game.player.vx = 0;
    sink(game, 59);

    expect(game.player.sunk).toBeCloseTo(60 * QUICKSAND.heroSink);
  });

  it('gets out with a jump or a dash', () => {
    const { game } = sandGame();
    Object.assign(game.player, { x: SPOT, state: 'idle', vx: 0 });
    sink(game, 60);

    Object.assign(game.player, { airborne: true, state: 'air' });
    updateQuicksand(game);
    expect(game.player.sunk).toBe(0);
    Object.assign(game.player, { airborne: false, state: 'idle' });
    sink(game, 60);
    game.player.state = 'dash';
    updateQuicksand(game);

    expect(game.player.sunk).toBe(0);
  });

  it('steps out of the shallow sand at the rim rather than popping up', () => {
    const { game } = sandGame();
    Object.assign(game.player, { x: SPOT, state: 'idle', vx: 0 });
    sink(game, 200);
    game.player.x = SPOT + QUICKSAND.halfWidth - 2;

    updateQuicksand(game);

    expect(game.player.sunk).toBeLessThan(QUICKSAND.shelf * 2 + 0.01);
  });

  it('left in it, is thrown out hurt, but never knocked out by it', () => {
    const { game, sounds } = sandGame();
    Object.assign(game.player, { x: SPOT + 2, state: 'idle', vx: 0, hp: 3 });

    sink(game, Math.ceil(QUICKSAND.heroDepth / QUICKSAND.heroSink) + 1);

    expect(game.player).toMatchObject({ hp: 1, state: 'juggle', airborne: true, sunk: 0 });
    expect(game.player.vx).toBeGreaterThan(0);
    expect(soundKeys(sounds)).toContain('eruption');
  });
});
