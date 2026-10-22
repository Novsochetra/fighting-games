import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { applyHit } from '../../../src/sim/combat/apply-hit.js';
import { jump, startMove } from '../../../src/sim/fighters/actions.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

const originalRandom = Math.random;

function knightArena({ gap = 150, hp } = {}) {
  const game = createPlayingGame();
  game.missionIndex = 7;
  game.arena = { left: 0, right: 384 };
  game.player.x = 120;
  spawnEnemy(game, 'furnace', 1);
  const knight = game.boss;
  Object.assign(knight, { entering: false, x: game.player.x + gap, facing: -1 });
  knight.hp = hp ?? knight.maxHp;
  knight.ai.cooldown = 9999;
  return { game, knight };
}

// plays his move out with nothing else to think about, noting each state the hero passes through
function playOut(game, knight, ticks, everyTick = () => {}) {
  const states = new Set();
  for (let i = 0; i < ticks; i++) {
    everyTick(i);
    runTicks(game, 1);
    knight.ai.cooldown = 9999;
    states.add(game.player.state);
  }
  return states;
}

const shotsOf = (game, kind) => game.projectiles.filter((shot) => shot.kind === kind);

const punch = (game, knight) => ({
  attacker: game.player,
  target: knight,
  move: { damage: 6, knockback: [1, 0], hitstop: 4, hitstun: 12 },
  x: knight.x,
  y: knight.y - 20,
});

describe('the Furnace Knight in a fight', () => {
  beforeEach(() => {
    Math.random = seededRandom(8);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('sweeps the flail along the floor and sets it burning ahead of him', () => {
    const { game, knight } = knightArena({ gap: 50 });
    startMove(game, knight, 'fireFlail');
    const states = playOut(game, knight, 60);
    expect(states.has('juggle')).toBe(true);
    const blazes = shotsOf(game, 'blaze');
    expect(blazes).toHaveLength(3);
    expect(blazes.every((blaze) => blaze.x < knight.x)).toBe(true);
  });

  it('burns a hero standing in the fire, and hops them out of it', () => {
    const { game, knight } = knightArena({ gap: 200 });
    knight.facing = 1;
    startMove(game, knight, 'fireFlail');
    playOut(game, knight, 46);
    const blaze = shotsOf(game, 'blaze')[0];
    game.player.x = blaze.x;
    playOut(game, knight, 20);
    expect(game.player.hp).toBeLessThan(game.player.maxHp);
    expect(Math.abs(game.player.x - blaze.x)).toBeGreaterThan(4);
  });

  it('lobs a pot onto the marked spot that breaks into a pool of lava', () => {
    const { game, knight } = knightArena();
    game.player.invincible = 9999;
    startMove(game, knight, 'slagPot');
    playOut(game, knight, 42);
    const pot = shotsOf(game, 'slagPot')[0];
    expect(pot.landing.x).toBeCloseTo(120, 0);
    playOut(game, knight, 80);
    const [pool] = shotsOf(game, 'lavaPool');
    expect(Math.abs(pool.x - 120)).toBeLessThan(10);
  });

  it('looses three flame lances: a hero who stands is struck, one who jumps each clears them', () => {
    const standing = knightArena({ hp: 110 });
    startMove(standing.game, standing.knight, 'meltdown');
    expect(playOut(standing.game, standing.knight, 120).has('juggle')).toBe(true);
    const jumping = knightArena({ hp: 110 });
    startMove(jumping.game, jumping.knight, 'meltdown');
    let lances = 0;
    playOut(jumping.game, jumping.knight, 240, () => {
      const lance = shotsOf(jumping.game, 'flameLance').find(
        (shot) => shot.x - jumping.game.player.x < 56 && !shot.jumped,
      );
      if (lance && !jumping.game.player.airborne) {
        lance.jumped = true;
        lances++;
        jump(jumping.game, jumping.game.player, { vy: -5.8, vx: 0 });
      }
    });
    expect(lances).toBe(3);
    expect(jumping.game.player.hp).toBe(jumping.game.player.maxHp);
  });

  it('overheats after the Meltdown: his armor is off and every hit does double', () => {
    const { game, knight } = knightArena({ hp: 110 });
    game.player.invincible = 9999;
    startMove(game, knight, 'meltdown');
    playOut(game, knight, 240);
    expect(knight.move.id).toBe('overheated');
    const before = knight.hp;
    applyHit(game, punch(game, knight));
    expect(before - knight.hp).toBe(12);
    expect(knight.move.id).toBe('overheated');
    playOut(game, knight, 200);
    expect(knight.move).toBeNull();
    const armored = knight.hp;
    applyHit(game, punch(game, knight));
    expect(armored - knight.hp).toBe(6);
  });

  // the hero cannot fall and now and then backs off across the arena, as a player keeping away would
  it('fights a whole bout with every move of his kit', () => {
    const { game, knight } = knightArena({ hp: 100 });
    knight.ai.cooldown = 0;
    const used = new Set();
    for (let i = 0; i < 4800; i++) {
      if (i % 600 === 0) {
        game.player.x = knight.x > 192 ? 20 : 364;
      }
      runTicks(game, 1);
      game.player.hp = game.player.maxHp;
      knight.hp = Math.max(knight.hp, 40);
      used.add(knight.move?.id);
    }
    expect([...used]).toEqual(
      expect.arrayContaining(['fireFlailHot', 'slagPot', 'meltdown', 'overheated']),
    );
  });
});
