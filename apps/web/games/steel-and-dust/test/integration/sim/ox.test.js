import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { COLORS } from '../../../src/art/colors.js';
import { dash, jump, startMove } from '../../../src/sim/fighters/actions.js';
import { RIFT_RUN, openRift } from '../../../src/sim/hazards/rifts.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

const originalRandom = Math.random;

function fortress({ gap = 150, hp } = {}) {
  const game = createPlayingGame();
  game.missionIndex = 9;
  game.arena = { left: 0, right: 384 };
  game.player.x = 120;
  spawnEnemy(game, 'brute', 1);
  const ox = game.boss;
  Object.assign(ox, { entering: false, x: game.player.x + gap, facing: -1 });
  ox.hp = hp ?? ox.maxHp;
  ox.ai.cooldown = 9999;
  return { game, ox };
}

// plays his move out with nothing else to think about, noting each state the hero passes through
function playOut(game, ox, ticks, everyTick = () => {}) {
  const states = new Set();
  for (let i = 0; i < ticks; i++) {
    everyTick(i);
    runTicks(game, 1);
    ox.ai.cooldown = 9999;
    states.add(game.player.state);
  }
  return states;
}

const shotsOf = (game, kind) => game.projectiles.filter((shot) => shot.kind === kind);

describe('the Warden Ox in a fight', () => {
  beforeEach(() => {
    Math.random = seededRandom(10);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('hooks a hero who stands, drags them in and chops them down', () => {
    const { game, ox } = fortress({ gap: 170 });
    startMove(game, ox, 'chainHook');
    const moves = new Set();
    const states = playOut(game, ox, 120, () => moves.add(ox.move?.id));
    expect(moves.has('hookChop')).toBe(true);
    expect(states.has('hurt')).toBe(true);
    expect(game.player.hp).toBeLessThan(game.player.maxHp);
    expect(['juggle', 'down', 'getup']).toContain(game.player.state);
  });

  it('misses a hero who jumps the hook as it comes', () => {
    const { game, ox } = fortress({ gap: 170 });
    startMove(game, ox, 'chainHook');
    let jumped = false;
    const states = playOut(game, ox, 150, () => {
      const hook = shotsOf(game, 'chainHook')[0];
      if (!jumped && hook && hook.x - game.player.x < 80) {
        jump(game, game.player, { vy: -4.6, vx: 0 });
        jumped = true;
      }
    });
    expect(jumped).toBe(true);
    expect(states.has('hurt')).toBe(false);
    expect(game.player.hp).toBe(game.player.maxHp);
  });

  it('chops twice below half health, the second before the hero has recovered from the first', () => {
    const { game, ox } = fortress({ gap: 150 });
    startMove(game, ox, 'chainHookTwice');
    const moves = new Set();
    let hpAfterFirst = null;
    playOut(game, ox, 160, () => {
      moves.add(ox.move?.id);
      if (ox.move?.id === 'hookChopAgain' && hpAfterFirst === null) {
        hpAfterFirst = game.player.hp;
      }
    });
    expect(moves.has('hookChopAgain')).toBe(true);
    expect(hpAfterFirst).toBeLessThan(game.player.maxHp);
    expect(game.player.hp).toBeLessThan(hpAfterFirst);
  });

  it('reels the hook back in when it misses and stands down', () => {
    const { game, ox } = fortress({ gap: 170 });
    game.player.invincible = 9999;
    startMove(game, ox, 'chainHook');
    playOut(game, ox, 150);
    expect(shotsOf(game, 'chainHook')).toHaveLength(0);
    expect(ox.state).not.toBe('attack');
    expect(game.player.hp).toBe(game.player.maxHp);
  });

  it('parries a blow on his guard and answers with a counter that lands', () => {
    const { game, ox } = fortress({ gap: 40 });
    startMove(game, ox, 'guardCounter');
    const moves = new Set();
    const hp = ox.hp;
    const states = playOut(game, ox, 70, (i) => {
      moves.add(ox.move?.id);
      if (i === 20) {
        startMove(game, game.player, 'L1');
      }
    });
    expect(ox.hp).toBe(hp);
    expect(moves.has('guardStrike')).toBe(true);
    expect(states.has('hurt')).toBe(true);
    expect(game.player.hp).toBeLessThan(game.player.maxHp);
  });

  it('stops a parried swing there: a raider in the same swing is not struck by it', () => {
    const { game, ox } = fortress({ gap: 40 });
    spawnEnemy(game, 'grunt', 1);
    const raider = game.fighters.find((fighter) => fighter.kind === 'grunt');
    Object.assign(raider, { entering: false, x: game.player.x + 22, facing: -1 });
    raider.ai.cooldown = 9999;
    startMove(game, ox, 'guardCounter');
    playOut(game, ox, 40, (i) => {
      raider.ai.cooldown = 9999;
      // both stand inside the hero's swing as it lands
      raider.x = game.player.x + 12;
      ox.x = game.player.x + 26;
      if (i === 20) {
        // the swing meets him before the raider behind him
        game.fighters.sort((first, second) => (first === raider) - (second === raider));
        startMove(game, game.player, 'L1');
      }
    });
    expect(raider.hp).toBe(raider.maxHp);
  });

  it('lowers his guard and does nothing to a hero who leaves it alone', () => {
    const { game, ox } = fortress({ gap: 60 });
    startMove(game, ox, 'guardCounter');
    const moves = new Set();
    playOut(game, ox, 140, () => moves.add(ox.move?.id));
    expect(moves.has('guardStrike')).toBe(false);
    expect(game.player.hp).toBe(game.player.maxHp);
  });

  it('spins across the arena and back, then cleaves the road where the hero stands', () => {
    const { game, ox } = fortress({ gap: 200, hp: 100 });
    game.player.invincible = 9999;
    startMove(game, ox, 'executionersRound');
    const moves = [];
    const xs = [];
    playOut(game, ox, 600, () => {
      if (moves.at(-1) !== ox.move?.id) {
        moves.push(ox.move?.id);
      }
      xs.push(ox.x);
    });
    expect(moves.filter(Boolean)).toEqual(['executionersRound', 'roundBack', 'roundCleave']);
    expect(Math.min(...xs)).toBeLessThan(60);
    expect(Math.max(...xs)).toBeGreaterThan(320);
  });

  it('spins through a hero who stands, while one who dashes through him in time is clear', () => {
    for (const dashes of [false, true]) {
      const { game, ox } = fortress({ gap: 230 });
      startMove(game, ox, 'roundBack');
      const hp = game.player.hp;
      let dashed = false;
      while (ox.move?.id === 'roundBack') {
        if (dashes && !dashed && ox.x - game.player.x < 105) {
          dash(game, game.player, 1);
          dashed = true;
        }
        runTicks(game, 1);
        ox.ai.cooldown = 9999;
      }
      expect(game.player.hp < hp, dashes ? 'dashing' : 'standing').toBe(!dashes);
    }
  });

  it('splits the road both ways: a hero who stands is thrown up, one who jumps it is clear', () => {
    for (const leaps of [false, true]) {
      const { game, ox } = fortress({ gap: 220 });
      const hp = game.player.hp;
      // the crack runs 4px a tick, so it passes under a hero 100px off in 25 ticks
      openRift(game, { x: game.player.x + 100, side: ox.side, color: COLORS.red });
      playOut(game, ox, RIFT_RUN + 4, (i) => {
        if (leaps && i === 16) {
          jump(game, game.player, { vy: -4.6, vx: 0 });
        }
      });
      expect(shotsOf(game, 'rift')).toHaveLength(0);
      expect(game.player.hp < hp, leaps ? 'jumping' : 'standing').toBe(!leaps);
    }
  });
});
