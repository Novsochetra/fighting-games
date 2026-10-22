import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { hurtBox } from '../../../src/sim/combat/boxes.js';
import { jump, startMove } from '../../../src/sim/fighters/actions.js';
import { arenaBounds } from '../../../src/sim/fighters/arena-bounds.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

const originalRandom = Math.random;

function templeArena({ gap = 150, hp } = {}) {
  const game = createPlayingGame();
  game.missionIndex = 8;
  game.arena = { left: 0, right: 384 };
  game.player.x = 120;
  spawnEnemy(game, 'pharaoh', 1);
  const pharaoh = game.boss;
  Object.assign(pharaoh, { entering: false, x: game.player.x + gap, facing: -1 });
  pharaoh.hp = hp ?? pharaoh.maxHp;
  pharaoh.ai.cooldown = 9999;
  return { game, pharaoh };
}

// plays his move out with nothing else to think about, noting each state the hero passes through
function playOut(game, pharaoh, ticks, everyTick = () => {}) {
  const states = new Set();
  for (let i = 0; i < ticks; i++) {
    everyTick(i);
    runTicks(game, 1);
    pharaoh.ai.cooldown = 9999;
    states.add(game.player.state);
  }
  return states;
}

const shotsOf = (game, kind) => game.projectiles.filter((shot) => shot.kind === kind);

// the hero stands by a spot facing it and swings at it
function swingAt(game, pharaoh, x) {
  game.player.x = x - 14;
  game.player.facing = 1;
  game.player.state = 'idle';
  startMove(game, game.player, 'L1');
  playOut(game, pharaoh, 24);
}

describe('the Sand Pharaoh in a fight', () => {
  beforeEach(() => {
    Math.random = seededRandom(9);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('steps out of the sand at one of three spots, his two copies at the others', () => {
    const { game, pharaoh } = templeArena();
    game.player.invincible = 9999;
    startMove(game, pharaoh, 'mirageClones');
    playOut(game, pharaoh, 36);
    expect(hurtBox(pharaoh)).toBeNull();
    playOut(game, pharaoh, 12);
    const spots = [pharaoh.x, ...pharaoh.mirages.map((mirage) => mirage.x)];
    expect(pharaoh.mirages).toHaveLength(2);
    expect(new Set(spots.map(Math.round)).size).toBe(3);
    expect(spots.every((x) => Math.abs(x - game.player.x) >= 50)).toBe(true);
  });

  it('moves his copies as he moves, and loses one to a single blow that leaves him whole', () => {
    const { game, pharaoh } = templeArena();
    game.player.invincible = 9999;
    startMove(game, pharaoh, 'mirageClones');
    playOut(game, pharaoh, 80);
    const [copy] = pharaoh.mirages;
    const before = copy.x;
    pharaoh.x += 10;
    const anchor = pharaoh.mirageAnchor;
    playOut(game, pharaoh, 1);
    expect(copy.x - before).toBeCloseTo(pharaoh.x - anchor, 5);
    expect(copy.x - before).toBeGreaterThan(5);
    swingAt(game, pharaoh, copy.x);
    expect(pharaoh.mirages).toHaveLength(1);
    expect(pharaoh.hp).toBe(pharaoh.maxHp);
  });

  it('has his copies fire mirage bolts below half health', () => {
    const { game, pharaoh } = templeArena({ gap: 200, hp: 140 });
    startMove(game, pharaoh, 'mirageVolley');
    const states = playOut(game, pharaoh, 300);
    expect(shotsOf(game, 'mirageBolt').length + (states.has('hurt') ? 1 : 0)).toBeGreaterThan(0);
    expect(game.player.hp).toBeLessThan(game.player.maxHp);
  });

  it('steps out at the far end of the arena when the hero crowds him', () => {
    const { game, pharaoh } = templeArena({ gap: 30 });
    game.player.invincible = 9999;
    startMove(game, pharaoh, 'mirageBlink');
    playOut(game, pharaoh, 30);
    expect(pharaoh.x).toBeGreaterThan(arenaBounds(game, pharaoh).max - 40);
  });

  it('pours a carpet of scarabs along the floor: a hero who stands is bitten, one who jumps clears it', () => {
    const standing = templeArena();
    startMove(standing.game, standing.pharaoh, 'scarabCarpet');
    playOut(standing.game, standing.pharaoh, 90);
    expect(standing.game.player.hp).toBeLessThan(standing.game.player.maxHp);
    const jumping = templeArena();
    startMove(jumping.game, jumping.pharaoh, 'scarabCarpet');
    playOut(jumping.game, jumping.pharaoh, 120, () => {
      const [carpet] = shotsOf(jumping.game, 'scarabs');
      const close = carpet && carpet.x - jumping.game.player.x < 34;
      if (close && !carpet.jumped && !jumping.game.player.airborne) {
        carpet.jumped = true;
        jump(jumping.game, jumping.game.player, { vy: -5.8, vx: 0 });
      }
    });
    expect(jumping.game.player.hp).toBe(jumping.game.player.maxHp);
  });

  it('burns the cursed hero when a canopic jar still stands as the sun goes down', () => {
    const { game, pharaoh } = templeArena({ hp: 110 });
    startMove(game, pharaoh, 'curseOfSun');
    playOut(game, pharaoh, 80);
    expect(shotsOf(game, 'canopic')).toHaveLength(3);
    expect(shotsOf(game, 'curseMark')).toHaveLength(1);
    const states = playOut(game, pharaoh, 380);
    expect(states.has('juggle') || states.has('down')).toBe(true);
    expect(game.player.maxHp - game.player.hp).toBeGreaterThanOrEqual(25);
    expect(shotsOf(game, 'curseMark')).toHaveLength(0);
  });

  it('breaks the curse when every jar is broken in time, leaving him reeling', () => {
    const { game, pharaoh } = templeArena({ hp: 110 });
    startMove(game, pharaoh, 'curseOfSun');
    playOut(game, pharaoh, 80);
    for (const jar of shotsOf(game, 'canopic')) {
      swingAt(game, pharaoh, jar.x);
    }
    playOut(game, pharaoh, 2);
    expect(pharaoh.move.id).toBe('sunBroken');
    expect(game.player.hp).toBe(game.player.maxHp);
    expect(shotsOf(game, 'curseMark')).toHaveLength(0);
    playOut(game, pharaoh, 400);
    expect(game.player.hp).toBe(game.player.maxHp);
  });

  // the hero cannot fall and now and then crosses the arena or crowds him, as a player would
  it('fights a whole bout with every move of his kit', () => {
    const { game, pharaoh } = templeArena({ hp: 100 });
    pharaoh.ai.cooldown = 0;
    const used = new Set();
    for (let i = 0; i < 4800; i++) {
      if (i % 600 === 0) {
        game.player.x = pharaoh.x > 192 ? 20 : 364;
      } else if (i % 300 === 0) {
        game.player.x = pharaoh.x + (pharaoh.x > 192 ? -30 : 30);
      }
      runTicks(game, 1);
      game.player.hp = game.player.maxHp;
      pharaoh.hp = Math.max(pharaoh.hp, 40);
      used.add(pharaoh.move?.id);
    }
    expect([...used]).toEqual(
      expect.arrayContaining(['mirageVolley', 'mirageBlink', 'scarabCarpet', 'curseOfSun']),
    );
  });

  // the rubble of a broken jar lies where it fell and fades, rather than vanishing as it lands
  it('leaves the rubble of a broken jar lying a while before it fades away', () => {
    const { game, pharaoh } = templeArena({ hp: 110 });
    game.player.invincible = 9999;
    startMove(game, pharaoh, 'curseOfSun');
    playOut(game, pharaoh, 80);
    const [jar] = shotsOf(game, 'canopic');
    swingAt(game, pharaoh, jar.x);
    expect(jar.shattered).toBe(true);
    playOut(game, pharaoh, 30 - (jar.time - jar.brokenAt));
    expect(game.projectiles).toContain(jar);
    playOut(game, pharaoh, 40);
    expect(game.projectiles).not.toContain(jar);
  });
});
